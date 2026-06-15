from django.shortcuts import render
from rest_framework import viewsets, permissions
# PERMISOS DE DJANGO
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly 

from .models import Parques, Contenedores, CarrilesBici
from .serializers import ParquesSerializer, ContenedoresSerializer, CarrilesBiciSerializer

class ParquesViewSet(viewsets.ModelViewSet):
    queryset = Parques.objects.all()
    serializer_class = ParquesSerializer
    # CANDADO PARA MODIFICACIONES
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]  

class ContenedoresViewSet(viewsets.ModelViewSet):
    queryset = Contenedores.objects.all()
    serializer_class = ContenedoresSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]  

class CarrilesBiciViewSet(viewsets.ModelViewSet):
    queryset = CarrilesBici.objects.all()
    serializer_class = CarrilesBiciSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]