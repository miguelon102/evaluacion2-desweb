from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Parques, Contenedores, CarrilesBici
from .serializers import ParquesSerializer, ContenedoresSerializer, CarrilesBiciSerializer

# Create your views here.

class ParquesViewSet(viewsets.ModelViewSet):
    queryset = Parques.objects.all()
    serializer_class = ParquesSerializer
    permission_classes = [permissions.AllowAny]

class ContenedoresViewSet(viewsets.ModelViewSet):
    queryset = Contenedores.objects.all()
    serializer_class = ContenedoresSerializer
    permission_classes = [permissions.AllowAny]

class CarrilesBiciViewSet(viewsets.ModelViewSet):
    queryset = CarrilesBici.objects.all()
    serializer_class = CarrilesBiciSerializer
    permission_classes = [permissions.AllowAny]