from smartcity_app.models import CarrilesBici
from django.forms.models import model_to_dict
from django.contrib.gis.geos import GEOSGeometry
from django.db import connection # Necesario para hacer el SnapToGrid

class CarrilesBiciDjango:
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

            # 2. Comprobamos validez de la geometría tras redondearla
            if not geom_obj.valid:
                return {'ok': False, 'message': 'La geometría de la línea no es válida', 'data': []}

            # 3. Comprobamos que no intersecte con otro carril bici (st_intersects)
            # Equivale a: SELECT id FROM carriles_bici WHERE ST_intersects(...)
            if CarrilesBici.objects.filter(geom__intersects=geom_obj).exists():
                return {'ok': False, 'message': 'El carril bici se cruza con otro existente', 'data': []}

            # 4. Si todo es correcto, instanciamos y guardamos
            b = CarrilesBici()
            b.nombre_calle = d.get('nombre_calle', '')
            b.longitud_metros = d.get('longitud_metros', 0.0)
            b.tipo_pavimento = d.get('tipo_pavimento', '')
            b.sentido_unico = d.get('sentido_unico', False)
            b.anyo_construccion = d.get('anyo_construccion', None)
            b.geom = geom_obj # Asignamos la geometría ya validada y redondeada
            
            b.save() # Hace el INSERT y el COMMIT automáticamente
            
            return {'ok': True, 'message': 'Carril bici insertado', 'data': [{'id': b.id}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def update(self, d):
        try:
            id_row = d['id']
            # Buscamos el objeto por su ID
            lista = list(CarrilesBici.objects.filter(id=id_row))
            if len(lista) == 0:
                return {'ok': False, 'message': f"El carril id {id_row} no existe", 'data': []}
            
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
                if CarrilesBici.objects.exclude(id=id_row).filter(geom__intersects=geom_obj).exists():
                    return {'ok': False, 'message': 'La nueva línea se cruza con otro carril bici', 'data': []}
                
                b.geom = geom_obj

            # Actualizamos el resto de campos si vienen en el diccionario
            if 'nombre_calle' in d: b.nombre_calle = d['nombre_calle']
            if 'longitud_metros' in d: b.longitud_metros = d['longitud_metros']
            if 'tipo_pavimento' in d: b.tipo_pavimento = d['tipo_pavimento']
            if 'sentido_unico' in d: b.sentido_unico = d['sentido_unico']
            if 'anyo_construccion' in d: b.anyo_construccion = d['anyo_construccion']
            
            b.save()
            return {'ok': True, 'message': 'Carril bici actualizado', 'data': [{'rows_updated': 1}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsDicts(self, d):
        try:
            id_row = d['id']
            lista = list(CarrilesBici.objects.filter(id=id_row))
            
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el carril bici', 'data': []}
                
            b = lista[0]
            dic = model_to_dict(b)
            
            if dic.get('geom'):
                dic['geom'] = dic['geom'].wkt
                
            return {'ok': True, 'message': 'Carril bici recuperado', 'data': [dic]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsTuples(self, d):
        try:
            id_row = d['id']
            lista = list(CarrilesBici.objects.filter(id=id_row))
            
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el carril bici', 'data': []}
                
            b = lista[0]
            geom_text = b.geom.wkt if b.geom else None
            
            tup = (b.id, b.nombre_calle, b.longitud_metros, b.tipo_pavimento, b.sentido_unico, b.anyo_construccion, geom_text)
            return {'ok': True, 'message': 'Carril bici recuperado en tupla', 'data': [tup]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def delete(self, d):
        try:
            id_row = d['id']
            lista = list(CarrilesBici.objects.filter(id=id_row))
            if len(lista) == 0:
                return {'ok': False, 'message': 'No existe el carril bici', 'data': []}
                
            b = lista[0]
            b.delete()
            return {'ok': True, 'message': 'Carril bici borrado', 'data': [{'rows_deleted': 1}]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}