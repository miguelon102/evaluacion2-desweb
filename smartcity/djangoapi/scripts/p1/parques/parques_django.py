from smartcity_app.models import Parques
from django.forms.models import model_to_dict
from django.contrib.gis.geos import GEOSGeometry
from django.db import connection # Necesario para hacer el SnapToGrid

class ParquesDjango:
    def __init__(self):
        self.snap_dist = 0.0001
        self.srid = 25830

    def _snap_geometry(self, geom_wkt):
        """
        Método auxiliar para aplicar ST_SnapToGrid usando un cursor rápido de Django,
        exactamente igual que haciamos en psycopg.
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

            # 2. Comprobamos validez de la geometría tras redondearla
            if not geom_obj.valid:
                return {'ok': False, 'message': 'La geometría no es válida', 'data': []}

            # 3. Comprobamos que no intersecte con otro parque (st_relate 'T********')
            # Equivale a: SELECT id FROM parques WHERE ST_relate(...)
            if Parques.objects.filter(geom__relate=(geom_obj, 'T********')).exists():
                return {'ok': False, 'message': 'El parque intersecta con otro', 'data': []}

            # 4. Si todo es correcto, instanciamos y guardamos
            b = Parques()
            b.nombre = d.get('nombre', '')
            b.area_hectareas = d.get('area_hectareas', 0.0)
            b.tiene_zona_infantil = d.get('tiene_zona_infantil', False)
            b.horario_cierre = d.get('horario_cierre')
            b.tipo_mantenimiento = d.get('tipo_mantenimiento', '')
            b.geom = geom_obj # Asignamos la geometría ya validada y redondeada
            
            b.save() # Hace el INSERT y el COMMIT automáticamente
            
            return {'ok': True, 'message': 'Parque insertado', 'data': [{'id': b.id}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def update(self, d):
        try:
            id_row = d['id']
            # Buscamos el objeto por su ID
            lista = list(Parques.objects.filter(id=id_row))
            if len(lista) == 0:
                return {'ok': False, 'message': f"El parque id {id_row} no existe", 'data': []}
            
            b = lista[0]
            
            # Si se envía nueva geometría, tenemos que validarla
            if 'geom' in d:
                geom_texto = d['geom']
                
                # 1. Aplicamos SnapToGrid
                geom_obj = self._snap_geometry(geom_texto)
                
                # 2. Comprobamos validez
                if not geom_obj.valid:
                    return {'ok': False, 'message': 'La nueva geometría no es válida', 'data': []}
                
                # 3. Comprobamos intersección EXCLUYENDO el ID actual
                # .exclude(id=id_row) equivale exactamente a tu "WHERE id != %s"
                if Parques.objects.exclude(id=id_row).filter(geom__relate=(geom_obj, 'T********')).exists():
                    return {'ok': False, 'message': 'La nueva geometría intersecta con otro parque', 'data': []}
                
                b.geom = geom_obj

            # Actualizamos el resto de campos si vienen en el diccionario
            if 'nombre' in d: b.nombre = d['nombre']
            if 'area_hectareas' in d: b.area_hectareas = d['area_hectareas']
            if 'tiene_zona_infantil' in d: b.tiene_zona_infantil = d['tiene_zona_infantil']
            if 'horario_cierre' in d: b.horario_cierre = d['horario_cierre']
            if 'tipo_mantenimiento' in d: b.tipo_mantenimiento = d['tipo_mantenimiento']
            
            b.save()
            return {'ok': True, 'message': 'Parque actualizado', 'data': [{'rows_updated': 1}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsDicts(self, d):
        try:
            id_row = d['id']
            lista = list(Parques.objects.filter(id=id_row))
            
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el parque', 'data': []}
                
            b = lista[0]
            dic = model_to_dict(b)
            
            if dic.get('geom'):
                dic['geom'] = dic['geom'].wkt
                
            return {'ok': True, 'message': 'Parque recuperado', 'data': [dic]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsTuples(self, d):
        try:
            id_row = d['id']
            lista = list(Parques.objects.filter(id=id_row))
            
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el parque', 'data': []}
                
            b = lista[0]
            geom_text = b.geom.wkt if b.geom else None
            
            tup = (b.id, b.nombre, b.area_hectareas, b.tiene_zona_infantil, b.horario_cierre, b.tipo_mantenimiento, geom_text)
            return {'ok': True, 'message': 'Parque recuperado en tupla', 'data': [tup]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def delete(self, d):
        try:
            id_row = d['id']
            lista = list(Parques.objects.filter(id=id_row))
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el parque', 'data': []}
                
            b = lista[0]
            b.delete()
            return {'ok': True, 'message': 'Parque borrado', 'data': [{'rows_deleted': 1}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}