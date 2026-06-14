from psycopg.rows import dict_row
from myLib.connect import connect
from myLib.p1Settings import EPSG_CODE

class ContenedoresOOP():
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
            
            # 1. Comprobamos validez geometría (punto)
            query_valid = "SELECT ST_isvalid(st_snaptogrid(st_geomfromtext(%s, %s), %s))"
            self.cur.execute(query_valid, [geom, EPSG_CODE, self.snap_dist])
            if not self.cur.fetchall()[0][0]:
                return {'ok': False, 'message': 'La geometría del punto no es válida', 'data': []}
            
            # 2. REGLA DE PUNTOS: Comprobar que punto está DENTRO de un polígono (un parque)
            query_within = """SELECT id FROM d.parques WHERE ST_Within(st_snaptogrid(st_geomfromtext(%s, %s), %s), geom)"""
            self.cur.execute(query_within, [geom, EPSG_CODE, self.snap_dist])
            if len(self.cur.fetchall()) == 0:
                # Si la lista esta vacia, es que no esta dentro de ningun parque
                return {'ok': False, 'message': 'El contenedor debe estar situado dentro de un parque', 'data': []}
            
            # 3. Insertamos
            cons = """
            INSERT INTO d.contenedores 
                (tipo_residuo, capacidad_litros, fecha_ultima_recogida, estado_conservacion, barrio, geom)
            VALUES
                (%s, %s, %s, %s, %s, st_snaptogrid(st_geometryFromText(%s, %s), %s))
            RETURNING id
            """
            self.cur.execute(cons, [
                d.get('tipo_residuo', ''),
                d.get('capacidad_litros', 0.0),
                d.get('fecha_ultima_recogida', None),
                d.get('estado_conservacion', ''),
                d.get('barrio', ''),
                geom,
                EPSG_CODE,
                self.snap_dist
            ])
            self.conn.commit()
            
            id_nuevo = self.cur.fetchall()[0][0]
            
            return {'ok': True, 'message': 'Contenedor insertado correctamente', 'data': [{'id': id_nuevo}]}
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
                
                # 2. Comprobamos que el nuevo punto sigue estando dentro de un parque
                # Aquí no nos hace falta excluir su propio ID porque estamos consultando contra la tabla parques
                query_within = """
                    SELECT id FROM d.parques 
                    WHERE ST_Within(st_snaptogrid(st_geomfromtext(%s, %s), %s), geom)
                """
                self.cur.execute(query_within, [geom, EPSG_CODE, self.snap_dist])
                if len(self.cur.fetchall()) == 0:
                    return {'ok': False, 'message': 'La nueva ubicación del contenedor no está dentro de ningún parque', 'data': []}
                
                # 3. Actualizamos todos los datos
                cons = """
                UPDATE d.contenedores 
                SET tipo_residuo = COALESCE(%s, tipo_residuo),
                    capacidad_litros = COALESCE(%s, capacidad_litros),
                    fecha_ultima_recogida = COALESCE(%s, fecha_ultima_recogida),
                    estado_conservacion = COALESCE(%s, estado_conservacion),
                    barrio = COALESCE(%s, barrio),
                    geom = st_snaptogrid(st_geometryFromText(%s, %s), %s)
                WHERE id = %s
                """
                self.cur.execute(cons, [
                    d.get('tipo_residuo'), d.get('capacidad_litros'), d.get('fecha_ultima_recogida'),
                    d.get('estado_conservacion'), d.get('barrio'),
                    geom, EPSG_CODE, self.snap_dist, id_row
                ])
                
            else:
                # Actualizamos solo datos normales
                cons = """
                UPDATE d.contenedores 
                SET tipo_residuo = COALESCE(%s, tipo_residuo),
                    capacidad_litros = COALESCE(%s, capacidad_litros),
                    fecha_ultima_recogida = COALESCE(%s, fecha_ultima_recogida),
                    estado_conservacion = COALESCE(%s, estado_conservacion),
                    barrio = COALESCE(%s, barrio)
                WHERE id = %s
                """
                self.cur.execute(cons, [
                    d.get('tipo_residuo'), d.get('capacidad_litros'), d.get('fecha_ultima_recogida'),
                    d.get('estado_conservacion'), d.get('barrio'), id_row
                ])

            filas_actualizadas = self.cur.rowcount
            self.conn.commit()
            
            return {'ok': True, 'message': 'Contenedor actualizado', 'data': [{'rows_updated': filas_actualizadas}]}
        except Exception as e:
            self.conn.rollback()
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsDicts(self, d):
        try:
            cur = self.conn.cursor(row_factory=dict_row)
            
            cons = """
            SELECT id, tipo_residuo, capacidad_litros, fecha_ultima_recogida, estado_conservacion, barrio, st_astext(geom) as geom
            FROM d.contenedores 
            WHERE id = %s
            """
            cur.execute(cons, [d['id']])
            resultados = cur.fetchall()

            cur.close()
            
            if len(resultados) == 0:
                return {'ok': False, 'message': 'No existe el contenedor', 'data': []}
                
            return {'ok': True, 'message': 'Contenedor recuperado', 'data': [resultados[0]]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def selectAsTuples(self, d):
        try:
            #self.cur = self.conn.cursor()
            
            cons = """
            SELECT id, tipo_residuo, capacidad_litros, fecha_ultima_recogida, estado_conservacion, barrio, st_astext(geom)
            FROM d.contenedores 
            WHERE id = %s
            """
            self.cur.execute(cons, [d['id']])
            resultados = self.cur.fetchall()
            
            if len(resultados) == 0:
                return {'ok': False, 'message': 'No existe el contenedor', 'data': []}
                
            return {'ok': True, 'message': 'Contenedor recuperado en tupla', 'data': [resultados[0]]}
        except Exception as e:
            return {'ok': False, 'message': str(e), 'data': []}

    def delete(self, d):
        try:
            cons = "DELETE FROM d.contenedores WHERE id = %s"
            self.cur.execute(cons, [d['id']])
            filas_borradas = self.cur.rowcount
            self.conn.commit()
            
            return {'ok': True, 'message': 'Contenedor borrado', 'data': [{'rows_deleted': filas_borradas}]}
        except Exception as e:
            self.conn.rollback()
            return {'ok': False, 'message': str(e), 'data': []}