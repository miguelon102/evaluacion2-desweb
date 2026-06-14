# Crea una clase que se llame Parcela
# Debe tener 3 propiedades:     area, perimetro y nombre_dueño
# El area y perimetro deben ser mayores que cero
# Crea un metodo privado que se llame __check_dueño__. Devuelve True o False si nombre_dueño es mas largo de 50
# Usa el metodo privado en el constructor para no permitir nombres de mas de 50 caracteres
# Crea setters para el area y el perimetro
# Crea el metodo getAsHectarea(), que devuelve area dividida por 10.000
# RECUERDA:     carpetas empiezan en minuscula, clases empiezan por MAYUSCULA
#                                   Funciones y metodos empiezan en MINUSCULA
#                                        Variables globales TODO en MAYUSCULA
#                                       Nombres de modulo empiezan en MINUSCULA

class Parcela:
    def __init__(self,area,perimetro,nombre_owner):
        self.setArea(area)
        self.setPerimetro(perimetro)
        self.setOwner(nombre_owner)
        
    def setArea(self,area):
        area=float(area)
        if area < 0:
            raise Exception("Area debe ser mayor que 0")
        self.area = area

    def setPerimetro(self,perimetro):
        perimetro=float(perimetro)
        if perimetro < 0:
            raise Exception("Perimetro debe ser mayor que 0")
        self.perimetro = perimetro

    def setOwner(self,nombre_owner):
        nombre_owner=str(nombre_owner)
        self.nombre_owner = nombre_owner

    def __check_owner(nombre_owner):
        if len(nombre_owner) < 50:
            return True
        else:
            return False

    def getAsHectarea(area):
        ha=area/10000
        return ha