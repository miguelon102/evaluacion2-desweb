from django.contrib import admin
from django.contrib.gis import admin as gis_admin
from .models import Parques, Contenedores, CarrilesBici

class ParquesAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'area_hectareas', 'geom')

class ContenedoresAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_residuo', 'capacidad_litros', 'geom')

class CarrilesBiciAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_calle', 'longitud_metros', 'geom')

gis_admin.site.register(Parques, ParquesAdmin)
gis_admin.site.register(Contenedores, ContenedoresAdmin)
gis_admin.site.register(CarrilesBici, CarrilesBiciAdmin)