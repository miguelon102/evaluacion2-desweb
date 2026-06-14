from psycopg.rows import dict_row
from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE

class CarrilesBiciOOP():
    def __init__(self):
        self.conn = connect()
        self.cur = self.conn.cursor()
        self.snap_dist = 0.0001
        
    def disconnect(self):
        self.cur.close()
        self.conn.close()

    def insert(self, d):
        try:
            geom = d['geom']
            
            # 1. Comprobamos validez geom (línea)
            query_valid = "SELECT ST_isvalid(st_snaptogrid(st_geomfromtext(%s, %s), %s))"
            self.cur.execute(query_valid, [geom, EPSG_CODE, self.snap_dist])
            if not self.cur.fetchall()[0][0]:
                return {'ok': False, 'message': 'La geometría de la línea no es válida', 'data': []}
            
            # 2. Comprobamos que no intersecte con otro carril bici
            # query_intersect = """
            #     SELECT id FROM d.carriles_bici 
            #     WHERE ST_intersects(geom, st_snaptogrid(st_geomfromtext(%s, %s), %s))
            # """
            # self.cur.execute(query_intersect, [geom, EPSG_CODE, self.snap_dist])
            # if len(self.cur.fetchall()) > 0:
            #     return {'ok': False, 'message': 'El carril bici se cruza con otro existente', 'data': []}
            
            # 3. Insertamos
            cons = """
            INSERT INTO d.carriles_bici 
                (nombre_calle, longitud_metros, tipo_pavimento, sentido_unico, anyo_construccion, geom)
            VALUES
                (%s, %s, %s, %s, %s, st_snaptogrid(st_geometryFromText(%s, %s), %s))
            RETURNING id
            """
            self.cur.execute(cons, [
                d.get('nombre_calle', ''),
                d.get('longitud_metros', 0.0),
                d.get('tipo_pavimento', ''),
                d.get('sentido_unico', False),
                d.get('anyo_construccion', None),
                geom,
                EPSG_CODE,
                self.snap_dist
            ])
            self.conn.commit()
            
            id_nuevo = self.cur.fetchall()[0][0]
            
            return {'ok': True, 'message': 'Carril bici insertado', 'data': [{'id': id_nuevo}]}
        except Exception as e:
            self.conn.rollback()
            return {'ok': False, 'message': str(e), 'data': []}

    def update(self, d):
        try:
            id_row = d['id']
            
            if 'geom' in d:
                geom = d['geom']
                
                # 1. Comprobamos validez
                query_valid = "SELECT ST_isvalid(st_snaptogrid(st_geomfromtext(%s, %s), %s))"
                self.cur.execute(query_valid, [geom, EPSG_CODE, self.snap_dist])
                if not self.cur.fetchall()[0][0]:
                    return {'ok': False, 'message': 'La nueva geometría no es válida', 'data': []}
                
                # 2. Comprobamos intersección EXCLUYENDO ID actual
                query_intersect = """
                    SELECT id FROM d.carriles_bici 
                    WHERE id != %s AND ST_intersects(geom, st_snaptogrid(st_geomfromtext(%s, %s), %s))
                """
                self.cur.execute(query_intersect, [id_row, geom, EPSG_CODE, self.snap_dist])
                if len(self.cur.fetchall()) > 0:
                    return {'ok': False, 'message': 'La nueva línea se cruza con otro carril bici', 'data': []}
                
                # 3. Actualizamos
                cons = """
                UPDATE d.carriles_bici 
                SET nombre_calle = COALESCE(%s, nombre_calle),
                    longitud_metros = COALESCE(%s, longitud_metros),
                    tipo_pavimento = COALESCE(%s, tipo_pavimento),
                    sentido_unico = COALESCE(%s, sentido_unico),
                    anyo_construccion = COALESCE(%s, anyo_construccion),
                    geom = st_snaptogrid(st_geometryFromText(%s, %s), %s)
                WHERE id = %s
                """
                self.cur.execute(cons, [
                    d.get('nombre_calle'), d.get('longitud_metros'), d.get('tipo_pavimento'),
                    d.get('sentido_unico'), d.get('anyo_construccion'),
                    geom, EPSG_CODE, self.snap_dist, id_row
                ])
                
            else:
                # Si no hay geometría, actualizamos solo datos normales
                cons = """
                UPDATE d.carriles_bici 
                SET nombre_calle = COALESCE(%s, nombre_calle),
                    longitud_metros = COALESCE(%s, longitud_metros),
                    tipo_pavimento = COALESCE(%s, tipo_pavimento),
                    sentido_unico = COALESCE(%s, sentido_unico),
                    anyo_construccion = COALESCE(%s, anyo_construccion)
                WHERE id = %s
                """
                self.cur.execute(cons, [
                    d.get('nombre_calle'), d.get('longitud_metros'), d.get('tipo_pavimento'),
                    d.get('sentido_unico'), d.get('anyo_construccion'), id_row
                ])

            filas_actualizadas = self.cur.rowcount
            self.conn.commit()
            
            return {'ok': True, 'message': 'Carril bici actualizado', 'data': [{'rows_updated': filas_actualizadas}]}
        except Exception as e:
            self.conn.rollback()
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsDicts(self, d):
        try:
            cur = self.conn.cursor(row_factory=dict_row)
            
            cons = """
            SELECT id, nombre_calle, longitud_metros, tipo_pavimento, sentido_unico, anyo_construccion, st_astext(geom) as geom
            FROM d.carriles_bici 
            WHERE id = %s
            """
            cur.execute(cons, [d['id']])
            resultados = cur.fetchall()

            cur.close()
            
            if len(resultados) == 0:
                return {'ok': False, 'message': 'No existe el carril bici', 'data': []}
                
            return {'ok': True, 'message': 'Carril bici recuperado', 'data': [resultados[0]]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsTuples(self, d):
        try:
            #self.cur = self.conn.cursor()
            
            cons = """
            SELECT id, nombre_calle, longitud_metros, tipo_pavimento, sentido_unico, anyo_construccion, st_astext(geom)
            FROM d.carriles_bici 
            WHERE id = %s
            """
            self.cur.execute(cons, [d['id']])
            resultados = self.cur.fetchall()
            
            if len(resultados) == 0:
                return {'ok': False, 'message': 'No existe el carril bici', 'data': []}
                
            return {'ok': True, 'message': 'Carril bici recuperado en tupla', 'data': [resultados[0]]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def delete(self, d):
        try:
            cons = "DELETE FROM d.carriles_bici WHERE id = %s"
            self.cur.execute(cons, [d['id']])
            filas_borradas = self.cur.rowcount
            self.conn.commit()
            
            return {'ok': True, 'message': 'Carril bici borrado', 'data': [{'rows_deleted': filas_borradas}]}
        except Exception as e:
            self.conn.rollback()
            return {'ok': False, 'message': str(e), 'data': []}