import sys

from buildings.insert import insert as insert_parques
from buildings.select import select as select_parques
from buildings.update import update as update_parques
from buildings.delete import delete as delete_parques

from buildings.insert import insert as insert_contenedores
from buildings.select import select as select_contenedores
from buildings.update import update as update_contenedores
from buildings.delete import delete as delete_contenedores

from buildings.insert import insert as insert_carriles_bici
from buildings.select import select as select_carriles_bici
from buildings.update import update as update_carriles_bici
from buildings.delete import delete as delete_carriles_bici

def main():
    # sys.argv[0] es siempre el nombre del archivo (main.py)
    # Por eso verificamos que haya al menos 3 elementos (nombre + p1 + p2)
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
        print("Error the available function names are insert, select, delete or update")
        sys.exit(0)

    if tableName == "parques":
        if functionName=="insert":
            insert_parques()
        elif functionName=="select":
            select_parques()
        elif functionName=="selectAsDict":
            select_parques(asDict=True)
        elif functionName=="update":
            update_parques()
        elif functionName=="delete":
            delete_parques()
    elif tableName=="contenedores":
        if functionName=="insert":
            insert_contenedores()
        elif functionName=="select":
            select_contenedores()
        elif functionName=="selectAsDict":
            select_contenedores(asDict=True)
        elif functionName=="update":
            update_contenedores()
        elif functionName=="delete":
            delete_contenedores()
    elif tableName=="carriles_bici":
        if functionName=="insert":
            insert_carriles_bici()
        elif functionName=="select":
            select_carriles_bici()
        elif functionName=="selectAsDict":
            select_carriles_bici(asDict=True)
        elif functionName=="update":
            update_carriles_bici()
        elif functionName=="delete":
            delete_carriles_bici()

if __name__ == "__main__":
    main()

