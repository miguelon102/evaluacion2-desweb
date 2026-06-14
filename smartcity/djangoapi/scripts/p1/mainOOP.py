import sys
from parques.parquesOOP import ParquesOOP
from contenedores.contenedoresOOP import ContenedoresOOP
from carriles_bici.carriles_biciOOP import CarrilesBiciOOP

def main():
    if len(sys.argv) == 3:
        tableName = sys.argv[1]
        functionName = sys.argv[2]     
    else:
        print("Error: You mus give two parameters tableName and functionName to execute the addecuate function.")
        sys.exit(0)

    if tableName not in ["parques", "contenedores", "carriles_bici"]:
        print("Error: The available table names are parques, contenedores, carriles_bici")
        sys.exit(0)
    
    if functionName not in ["insert", "select", "selectAsDict", "update", "delete"]:
        print("Error the available function names are insert, select, selectAsDict, delete or update")
        sys.exit(0)

    # DATOS DE PRUEBA
    d_parque = {
        'nombre': 'Parque Central',
        'area_hectareas': 12.5,
        'tiene_zona_infantil': True,
        'horario_cierre': '22:00',
        'tipo_mantenimiento': 'Diario',
        'geom': 'POLYGON((100 100, 110 100, 110 110, 100 110, 100 100))'
    }

    d_contenedor = {
        'tipo_residuo': 'Plastico',
        'capacidad_litros': 1000,
        'fecha_ultima_recogida': '2026-03-05',
        'estado_conservacion': 'Nuevo',
        'barrio': 'Centro',
        'geom': 'POINT(5 5)'
    }

    d_carril = {
        'nombre_calle': 'Avenida Principal',
        'longitud_metros': 500,
        'tipo_pavimento': 'Asfalto',
        'sentido_unico': True,
        'anyo_construccion': 2024,
        'geom': 'LINESTRING(20 20, 30 30, 40 40)'
    }
    
    if tableName == "parques":
            b = ParquesOOP()
            d = d_parque # Asignamos datos base del parque
            if functionName=="insert": 
                print(b.insert(d))
            elif functionName=="select": 
                print(b.selectAsTuples({'id': 1}))
            elif functionName=="selectAsDict": 
                print(b.selectAsDicts({'id': 1}))
            elif functionName=="update": 
                # Le pasamos el ID y un dato nuevo para ver que realmente lo cambia
                print(b.update({'id': 3, 'nombre': 'Parque Norte Actualizado'}))
            elif functionName=="delete": 
                print(b.delete({'id': 1}))
            b.disconnect()            

    elif tableName=="contenedores":
        b = ContenedoresOOP()
        d = d_contenedor # Asignamos datos del contenedor
        if functionName=="insert": print(b.insert(d))
        elif functionName=="select": print(b.selectAsTuples({'id': 1}))
        elif functionName=="selectAsDict": print(b.selectAsDicts({'id': 1}))
        elif functionName=="update": print(b.update(d))
        elif functionName=="delete": print(b.delete({'id': 1}))
        b.disconnect()
            
    elif tableName=="carriles_bici":
        b = CarrilesBiciOOP()
        d = d_carril # Asignamo datos del carril bici
        if functionName=="insert": print(b.insert(d))
        elif functionName=="select": print(b.selectAsTuples({'id': 1}))
        elif functionName=="selectAsDict": print(b.selectAsDicts({'id': 1}))
        elif functionName=="update": print(b.update(d))
        elif functionName=="delete": print(b.delete({'id': 1}))
        b.disconnect()

if __name__ == "__main__":
    main()