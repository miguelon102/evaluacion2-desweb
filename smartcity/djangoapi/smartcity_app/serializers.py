from rest_framework import serializers
from core.myLib.geoModelSerializer import GeoModelSerializer
from .models import Parques, Contenedores, CarrilesBici

class ParquesSerializer(GeoModelSerializer):
    check_geometry_is_valid = True
    check_st_relation = True
    matrix9IM = 'T********'
    geoms_as_wkt = True
    
    # Campo extra: Django leerá el nombre de la relación automáticamente
    nombre_mantenimiento = serializers.CharField(source='tipo_mantenimiento.nombre', read_only=True)

    class Meta:
        model = Parques
        fields = GeoModelSerializer.Meta.fields + [
            'nombre', 'area_hectareas', 'tiene_zona_infantil', 
            'horario_cierre', 'tipo_mantenimiento', 'nombre_mantenimiento'
        ]

class ContenedoresSerializer(GeoModelSerializer):
    check_geometry_is_valid = True
    geoms_as_wkt = True
    
    nombre_residuo = serializers.CharField(source='tipo_residuo.nombre', read_only=True)
    nombre_barrio = serializers.CharField(source='barrio.nombre', read_only=True)

    class Meta:
        model = Contenedores
        fields = GeoModelSerializer.Meta.fields + [
            'tipo_residuo', 'nombre_residuo', 'capacidad_litros', 
            'fecha_ultima_recogida', 'estado_conservacion', 'barrio', 'nombre_barrio'
        ]

class CarrilesBiciSerializer(GeoModelSerializer):
    check_geometry_is_valid = True
    geoms_as_wkt = True
    
    nombre_pavimento = serializers.CharField(source='tipo_pavimento.nombre', read_only=True)

    class Meta:
        model = CarrilesBici
        fields = GeoModelSerializer.Meta.fields + [
            'nombre_calle', 'longitud_metros', 'tipo_pavimento', 
            'nombre_pavimento', 'sentido_unico', 'anyo_construccion'
        ]


        