from django.db import models
from django.contrib.gis.db import models as gis_models
from djangoapi.settings import EPSG_FOR_GEOMETRIES

class Parques(models.Model):
    nombre = models.CharField(max_length=100, blank=True, null=True)
    area_hectareas = models.FloatField(blank=True, null=True)
    tiene_zona_infantil = models.BooleanField(default=False, blank=True, null=True)
    horario_cierre = models.TimeField(blank=True, null=True)
    tipo_mantenimiento = models.CharField(max_length=50, blank=True, null=True)
    geom = gis_models.PolygonField(srid=int(EPSG_FOR_GEOMETRIES), blank=True, null=True)

class Contenedores(models.Model):
    tipo_residuo = models.CharField(max_length=50, blank=True, null=True)
    capacidad_litros = models.FloatField(blank=True, null=True)
    fecha_ultima_recogida = models.DateField(blank=True, null=True)
    estado_conservacion = models.CharField(max_length=50, blank=True, null=True)
    barrio = models.CharField(max_length=100, blank=True, null=True)
    geom = gis_models.PointField(srid=int(EPSG_FOR_GEOMETRIES), blank=True, null=True)

class CarrilesBici(models.Model):
    nombre_calle = models.CharField(max_length=100, blank=True, null=True)
    longitud_metros = models.FloatField(blank=True, null=True)
    tipo_pavimento = models.CharField(max_length=50, blank=True, null=True)
    sentido_unico = models.BooleanField(default=False, blank=True, null=True)
    anyo_construccion = models.IntegerField(blank=True, null=True)
    geom = gis_models.LineStringField(srid=int(EPSG_FOR_GEOMETRIES), blank=True, null=True)