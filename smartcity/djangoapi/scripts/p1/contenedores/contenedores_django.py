from smartcity_app.models import Contenedores, Parques # Importamos también Parques para aplicar la regla within
from django.forms.models import model_to_dict
from django.contrib.gis.geos import GEOSGeometry
from django.db import connection # Necesario para hacer el SnapToGrid

class ContenedoresDjango:
    def __init__(self):
        self.snap_dist = 0.0001
        self.srid = 25830

    def _snap_geometry(self, geom_wkt):
        """
        Método auxiliar para aplicar ST_SnapToGrid usando un cursor rápido de Django.
        """
        with connection.cursor() as cur:
            query = "SELECT st_snaptogrid(st_geomfromtext(%s, %s), %s)"
            cur.execute(query, [geom_wkt, self.srid, self.snap_dist])
            snapped_wkb = cur.fetchone()[0]
            # Devolvemos el objeto GEOSGeometry ya redondeado
            return GEOSGeometry(snapped_wkb, srid=self.srid)

    def insert(self, d):
        try:
            geom_texto = d.get('geom')
            if not geom_texto:
                return {'ok': False, 'message': 'Falta la geometría', 'data': []}

            # 1. Aplicamos SnapToGrid y creamos el objeto espacial
            geom_obj = self._snap_geometry(geom_texto)

            # 2. Comprobamos validez de la geometría del punto
            if not geom_obj.valid:
                return {'ok': False, 'message': 'La geometría del punto no es válida', 'data': []}

            # 3. REGLA DE PUNTOS: Comprobar que el punto está DENTRO de un parque
            # En Django, usamos el filtro __contains (El polígono del parque CONTIENE el punto)
            # Equivale exactamente a tu ST_Within(punto, geom_parque)
            esta_en_parque = Parques.objects.filter(geom__contains=geom_obj).exists()
            
            if not esta_en_parque:
                # El punto cae fuera de cualquier parque
                return {'ok': False, 'message': 'El contenedor debe estar situado dentro de un parque', 'data': []}

            # 4. Si todo es correcto, instanciamos y guardamos
            b = Contenedores()
            b.tipo_residuo = d.get('tipo_residuo', '')
            b.capacidad_litros = d.get('capacidad_litros', 0.0)
            b.fecha_ultima_recogida = d.get('fecha_ultima_recogida', None)
            b.estado_conservacion = d.get('estado_conservacion', '')
            b.barrio = d.get('barrio', '')
            b.geom = geom_obj # Asignamos la geometría ya validada y redondeada
            
            b.save() # Hace el INSERT y el COMMIT automáticamente
            
            return {'ok': True, 'message': 'Contenedor insertado correctamente', 'data': [{'id': b.id}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def update(self, d):
        try:
            id_row = d['id']
            # Buscamos el objeto por su ID
            lista = list(Contenedores.objects.filter(id=id_row))
            if len(lista) == 0:
                return {'ok': False, 'message': f"El contenedor id {id_row} no existe", 'data': []}
            
            b = lista[0]
            
            # Si se envía nueva geometría, tenemos que validarla
            if 'geom' in d:
                geom_texto = d['geom']
                
                # 1. Aplicamos SnapToGrid
                geom_obj = self._snap_geometry(geom_texto)
                
                # 2. Comprobamos validez
                if not geom_obj.valid:
                    return {'ok': False, 'message': 'La nueva geometría no es válida', 'data': []}
                
                # 3. Comprobamos que el nuevo punto sigue estando dentro de un parque
                # Al igual que en tu código OOP, aquí no hace falta excluir ningún ID
                esta_en_parque = Parques.objects.filter(geom__contains=geom_obj).exists()
                
                if not esta_en_parque:
                    return {'ok': False, 'message': 'La nueva ubicación del contenedor no está dentro de ningún parque', 'data': []}
                
                b.geom = geom_obj

            # Actualizamos el resto de campos si vienen en el diccionario
            if 'tipo_residuo' in d: b.tipo_residuo = d['tipo_residuo']
            if 'capacidad_litros' in d: b.capacidad_litros = d['capacidad_litros']
            if 'fecha_ultima_recogida' in d: b.fecha_ultima_recogida = d['fecha_ultima_recogida']
            if 'estado_conservacion' in d: b.estado_conservacion = d['estado_conservacion']
            if 'barrio' in d: b.barrio = d['barrio']
            
            b.save()
            return {'ok': True, 'message': 'Contenedor actualizado', 'data': [{'rows_updated': 1}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsDicts(self, d):
        try:
            id_row = d['id']
            lista = list(Contenedores.objects.filter(id=id_row))
            
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el contenedor', 'data': []}
                
            b = lista[0]
            dic = model_to_dict(b)
            
            if dic.get('geom'):
                dic['geom'] = dic['geom'].wkt
                
            return {'ok': True, 'message': 'Contenedor recuperado', 'data': [dic]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsTuples(self, d):
        try:
            id_row = d['id']
            lista = list(Contenedores.objects.filter(id=id_row))
            
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el contenedor', 'data': []}
                
            b = lista[0]
            geom_text = b.geom.wkt if b.geom else None
            
            tup = (b.id, b.tipo_residuo, b.capacidad_litros, b.fecha_ultima_recogida, b.estado_conservacion, b.barrio, geom_text)
            return {'ok': True, 'message': 'Contenedor recuperado en tupla', 'data': [tup]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def delete(self, d):
        try:
            id_row = d['id']
            lista = list(Contenedores.objects.filter(id=id_row))
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el contenedor', 'data': []}
                
            b = lista[0]
            b.delete()
            return {'ok': True, 'message': 'Contenedor borrado', 'data': [{'rows_deleted': 1}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}