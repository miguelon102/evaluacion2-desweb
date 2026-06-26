from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated  # ← equivalente DRF de LoginRequiredMixin

from .models import Parques, Contenedores, CarrilesBici
from .serializers import ParquesSerializer, ContenedoresSerializer, CarrilesBiciSerializer

class ParquesViewSet(viewsets.ModelViewSet):
    queryset = Parques.objects.all()
    serializer_class = ParquesSerializer
    permission_classes = [IsAuthenticated]  # bloquea todo a usuarios no autenticados

class ContenedoresViewSet(viewsets.ModelViewSet):
    queryset = Contenedores.objects.all()
    serializer_class = ContenedoresSerializer
    permission_classes = [IsAuthenticated]

class CarrilesBiciViewSet(viewsets.ModelViewSet):
    queryset = CarrilesBici.objects.all()
    serializer_class = CarrilesBiciSerializer
    permission_classes = [IsAuthenticated]




#CODIGO ANTERIOR (clave del error "permission_classes = [DjangoModelPermissionsOrAnonReadOnly]"):
#rom django.shortcuts import render
#rom rest_framework import viewsets, permissions
# PERMISOS DE DJANGO
#  rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly MAAAAL


""" class ParquesViewSet(viewsets.ModelViewSet):
    queryset = Parques.objects.all()
    serializer_class = ParquesSerializer
    # CANDADO PARA MODIFICACIONES (rechaza post o put si es AnonymousUser)
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]  

class ContenedoresViewSet(viewsets.ModelViewSet):
    queryset = Contenedores.objects.all()
    serializer_class = ContenedoresSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly]  

class CarrilesBiciViewSet(viewsets.ModelViewSet):
    queryset = CarrilesBici.objects.all()
    serializer_class = CarrilesBiciSerializer
    permission_classes = [DjangoModelPermissionsOrAnonReadOnly] """