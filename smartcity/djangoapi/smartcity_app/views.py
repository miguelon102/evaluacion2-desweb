from django.shortcuts import render
from rest_framework import viewsets, permissions
# IMPORTAMOS LA REGLA DE SEGURIDAD
from rest_framework.permissions import IsAuthenticatedOrReadOnly 

from .models import Parques, Contenedores, CarrilesBici
from .serializers import ParquesSerializer, ContenedoresSerializer, CarrilesBiciSerializer

class ParquesViewSet(viewsets.ModelViewSet):
    queryset = Parques.objects.all()
    serializer_class = ParquesSerializer
    # APLICAMOS CANDADO
    permission_classes = [IsAuthenticatedOrReadOnly]  

class ContenedoresViewSet(viewsets.ModelViewSet):
    queryset = Contenedores.objects.all()
    serializer_class = ContenedoresSerializer
    # APLICAMOS CANDADO
    permission_classes = [IsAuthenticatedOrReadOnly]  

class CarrilesBiciViewSet(viewsets.ModelViewSet):
    queryset = CarrilesBici.objects.all()
    serializer_class = CarrilesBiciSerializer
    # APLICAMOS CANDADO
    permission_classes = [IsAuthenticatedOrReadOnly]