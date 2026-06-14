from rest_framework import serializers
from core.myLib.geoModelSerializer import GeoModelSerializer
from .models import Parques, Contenedores, CarrilesBici

class ParquesSerializer(GeoModelSerializer):
    check_geometry_is_valid = True # Valida que el polígono esté cerrado y no se auto-cruce
    check_st_relation = True       # Comprueba colisiones con otros parques de la tabla
    matrix9IM = 'T********'        # 'T********' evita que los interiores de los parques se superpongan
    geoms_as_wkt = True            # Espera que Angular le mande los datos como texto WKT

    class Meta:
        model = Parques
        fields = GeoModelSerializer.Meta.fields + [
            'nombre', 
            'area_hectareas', 
            'tiene_zona_infantil', 
            'horario_cierre', 
            'tipo_mantenimiento'
        ]

class ContenedoresSerializer(GeoModelSerializer):
    check_geometry_is_valid = True
    check_st_relation = False      # Lo pongo en False porque la colisión entre Puntos en la misma capa no suele ser problemática con 'T********'
    geoms_as_wkt = True

    class Meta:
        model = Contenedores
        fields = GeoModelSerializer.Meta.fields + [
            'tipo_residuo', 
            'capacidad_litros', 
            'fecha_ultima_recogida', 
            'estado_conservacion', 
            'barrio'
        ]

class CarrilesBiciSerializer(GeoModelSerializer):
    check_geometry_is_valid = True
    check_st_relation = False      # False para evitar errores si se cruzan dos líneas en la misma capa
    geoms_as_wkt = True

    class Meta:
        model = CarrilesBici
        fields = GeoModelSerializer.Meta.fields + [
            'nombre_calle', 
            'longitud_metros', 
            'tipo_pavimento', 
            'sentido_unico', 
            'anyo_construccion'
        ]