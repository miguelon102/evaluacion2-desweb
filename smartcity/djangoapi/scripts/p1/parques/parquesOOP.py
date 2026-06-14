from psycopg.rows import dict_row
from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE

class ParquesOOP():
    #se define el constructor
    def __init__(self):
        #creamos variable instancia conexion a postgres
        self.conn = connect()
        #se accede al metodo cursor
        self.cur = self.conn.cursor()
        self.snap_dist = 0.0001 # para redondear coordenadas
        
    def disconnect(self):
        self.cur.close()
        self.conn.close()

    def insert(self, d):
        try:
            geom = d['geom'] # Asumimos que geom en formato texto WKT
            
            # 1. Comprobamos validez de la geometría tras redondearla
            query_valid = "SELECT ST_isvalid(st_snaptogrid(st_geomfromtext(%s, %s), %s))"
            self.cur.execute(query_valid, [geom, EPSG_CODE, self.snap_dist])
            if not self.cur.fetchall()[0][0]:
                return {'ok': False, 'message': 'La geometría no es válida', 'data': []}
            
            # 2. Comprobamos que no intersecte con otro parque (con st_relate para detectar solo intersecciones interior-interior)
            query_intersect = """SELECT id FROM d.parques WHERE ST_relate(geom, st_snaptogrid(st_geomfromtext(%s, %s), %s), 'T********')"""
            self.cur.execute(query_intersect, [geom, EPSG_CODE, self.snap_dist])
            if len(self.cur.fetchall()) > 0:
                return {'ok': False, 'message': 'El parque intersecta con otro', 'data': []}
            
            # 3. Si todoes correcto, insertamos
            cons = """
            INSERT INTO d.parques 
                (nombre, area_hectareas, tiene_zona_infantil, horario_cierre, tipo_mantenimiento, geom)
            VALUES
                (%s, %s, %s, %s, %s, st_snaptogrid(st_geometryFromText(%s, %s), %s))
            RETURNING id
            """
            self.cur.execute(cons, [
                d.get('nombre', ''),
                d.get('area_hectareas', 0.0),
                d.get('tiene_zona_infantil', False),
                d.get('horario_cierre', ''),
                d.get('tipo_mantenimiento', ''),
                geom,
                EPSG_CODE,
                self.snap_dist
            ])
            self.conn.commit()
            
            # Capturamos ID nuevo
            id_nuevo = self.cur.fetchall()[0][0]
            
            return {'ok': True, 'message': 'Parque insertado', 'data': [{'id': id_nuevo}]}
        except Exception as e:
            self.conn.rollback() # Cancelamos si hay algun error SQL
            return {'ok': False, 'message': str(e), 'data': []}
        
    def update(self, d):
        try:
            id_row = d['id']
            
            # Si se envia nueva geometria, tenemos que validarla
            if 'geom' in d:
                geom = d['geom']
                
                # 1. Comprobamos validez
                query_valid = "SELECT ST_isvalid(st_snaptogrid(st_geomfromtext(%s, %s), %s))"
                self.cur.execute(query_valid, [geom, EPSG_CODE, self.snap_dist])
                if not self.cur.fetchall()[0][0]:
                    return {'ok': False, 'message': 'La nueva geometría no es válida', 'data': []}
                
                # 2. Comprobamos intersección EXCLUYENDO ID actual (id != %s) y usando st_relate
                query_intersect = """SELECT id FROM d.parques WHERE id != %s AND ST_relate(geom, st_snaptogrid(st_geomfromtext(%s, %s), %s), 'T********')"""
                self.cur.execute(query_intersect, [id_row, geom, EPSG_CODE, self.snap_dist])
                if len(self.cur.fetchall()) > 0:
                    return {'ok': False, 'message': 'La nueva geometría intersecta con otro parque', 'data': []}
                
                # 3. Actualizamos todos los datos, incluida la geometría
                cons = """
                UPDATE d.parques 
                SET nombre = COALESCE(%s, nombre),
                    area_hectareas = COALESCE(%s, area_hectareas),
                    tiene_zona_infantil = COALESCE(%s, tiene_zona_infantil),
                    horario_cierre = COALESCE(%s, horario_cierre),
                    tipo_mantenimiento = COALESCE(%s, tipo_mantenimiento),
                    geom = st_snaptogrid(st_geometryFromText(%s, %s), %s)
                WHERE id = %s
                """
                self.cur.execute(cons, [
                    d.get('nombre'), d.get('area_hectareas'), d.get('tiene_zona_infantil'),
                    d.get('horario_cierre'), d.get('tipo_mantenimiento'),
                    geom, EPSG_CODE, self.snap_dist, id_row
                ])
                
            else:
                # Si no envían geometría, solo actualizamos los campos normales
                cons = """
                UPDATE d.parques 
                SET nombre = COALESCE(%s, nombre),
                    area_hectareas = COALESCE(%s, area_hectareas),
                    tiene_zona_infantil = COALESCE(%s, tiene_zona_infantil),
                    horario_cierre = COALESCE(%s, horario_cierre),
                    tipo_mantenimiento = COALESCE(%s, tipo_mantenimiento)
                WHERE id = %s
                """
                self.cur.execute(cons, [
                    d.get('nombre'), d.get('area_hectareas'), d.get('tiene_zona_infantil'),
                    d.get('horario_cierre'), d.get('tipo_mantenimiento'), id_row
                ])

            filas_actualizadas = self.cur.rowcount
            self.conn.commit()
            
            return {'ok': True, 'message': 'Parque actualizado', 'data': [{'rows_updated': filas_actualizadas}]}
        except Exception as e:
            self.conn.rollback()
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsDicts(self, d):
        try:
            # 1. Creamos un cursor LOCAL (cur) en vez de machacar el global (self.cur)
            cur = self.conn.cursor(row_factory=dict_row)
            
            cons = """
            SELECT id, nombre, area_hectareas, tiene_zona_infantil, horario_cierre, tipo_mantenimiento, st_astext(geom) as geom
            FROM d.parques 
            WHERE id = %s
            """
            cur.execute(cons, [d['id']])
            resultados = cur.fetchall()
            
            cur.close() #Cerramos este cursor especial porque ya no hace falta
            
            if len(resultados) == 0:
                return {'ok': False, 'message': 'No existe el parque', 'data': []}
                
            return {'ok': True, 'message': 'Parque recuperado', 'data': [resultados[0]]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}
            
    def selectAsTuples(self, d):
        try:
            # Modo tupla normal (sin row_factory) aunque no hace falta volverlo a definir
            #self.cur = self.conn.cursor()
            
            cons = """
            SELECT id, nombre, area_hectareas, tiene_zona_infantil, horario_cierre, tipo_mantenimiento, st_astext(geom)
            FROM d.parques 
            WHERE id = %s
            """
            self.cur.execute(cons, [d['id']])
            resultados = self.cur.fetchall()
            
            if len(resultados) == 0:
                return {'ok': False, 'message': 'No existe el parque', 'data': []}
                
            return {'ok': True, 'message': 'Parque recuperado en tupla', 'data': [resultados[0]]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def delete(self, d):
        try:
            cons = "DELETE FROM d.parques WHERE id = %s"
            self.cur.execute(cons, [d['id']])
            filas_borradas = self.cur.rowcount
            self.conn.commit()
            
            return {'ok': True, 'message': 'Parque borrado', 'data': [{'rows_deleted': filas_borradas}]}
        except Exception as e:
            self.conn.rollback()
            return {'ok': False, 'message': str(e), 'data': []}