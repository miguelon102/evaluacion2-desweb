from django.db import models

# Create your models here.

class Barrio(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.nombre
    class Meta: ordering = ['nombre']

class TipoResiduo(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre
    class Meta: ordering = ['nombre']

class TipoPavimento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre
    class Meta: ordering = ['nombre']

class TipoMantenimiento(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.nombre
    class Meta: ordering = ['nombre']