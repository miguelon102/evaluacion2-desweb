from scripts.p1.parques.parques_django import ParquesDjango
from scripts.p1.contenedores.contenedores_django import ContenedoresDjango
from scripts.p1.carriles_bici.carriles_bici_django import CarrilesBiciDjango

def run(*args):
    if len(args) != 2:
        print("Error: Necesitas dar dos parametros: tableName y functionName.")
        return

    tableName = args[0]
    functionName = args[1]

    # Ampliamos para que acepte las 3 tablas
    if tableName not in ["parques", "contenedores", "carriles"]:
        print("Error: Las tablas disponibles son parques, contenedores, carriles")
        return
    
    if functionName not in ["insert", "selectAsTuples", "selectAsDicts", "update", "delete"]:
        print("Error: Las funciones disponibles son insert, selectAsTuples, selectAsDicts, delete o update")
        return

    # DATOS DE PRUEBA
    
    d_parque = {
        'id': 2, 
        'nombre': 'Parque Django Prueba',
        'area_hectareas': 20.5,
        'tiene_zona_infantil': True,
        'horario_cierre': '20:00:00',
        'tipo_mantenimiento': 'Mensual',
        # Polígono de 50x50 cerca del origen
        'geom': 'POLYGON((0 0, 50 0, 50 50, 0 50, 0 0))'
    }

    d_contenedor = {
        'id': 1, 
        'tipo_residuo': 'Vidrio',
        'capacidad_litros': 1000.5,
        'fecha_ultima_recogida': '2026-03-25',
        'estado_conservacion': 'Bueno',
        'barrio': 'Centro',
        'geom': 'POINT(25 25)' 
    }

    d_carril = {
        'id': 1, 
        'nombre_calle': 'Avenida Blasco Ibañez',
        'longitud_metros': 2500.0,
        'tipo_pavimento': 'Asfalto',
        'sentido_unico': True,
        'anyo_construccion': 2018,
        'geom': 'LINESTRING(100 100, 150 100, 150 150)' 
    }

    # ENRUTAMIENTO Y EJECUCIÓN

    if tableName == "parques":
        b = ParquesDjango()
        d = d_parque
    elif tableName == "contenedores":
        b = ContenedoresDjango()
        d = d_contenedor
    elif tableName == "carriles":
        b = CarrilesBiciDjango()
        d = d_carril
        
    print(f"\nEjecutando {functionName.upper()} en la tabla {tableName.upper()}")
    
    if functionName == "insert":
        print(b.insert(d))
    elif functionName == "selectAsTuples":
        print(b.selectAsTuples(d)) 
    elif functionName == "selectAsDicts":
        print(b.selectAsDicts(d))
    elif functionName == "update":
        print(b.update(d))
    elif functionName == "delete":
        print(b.delete(d))