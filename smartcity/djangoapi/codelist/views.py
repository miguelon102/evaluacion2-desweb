from django.http import JsonResponse
from django.views import View
from rest_framework import viewsets, permissions
from .models import Barrio, TipoResiduo, TipoPavimento, TipoMantenimiento
from .serializers import BarrioSerializer, TipoResiduoSerializer, TipoPavimentoSerializer, TipoMantenimientoSerializer

class HelloWord(View):
    def get(self, request):
        return JsonResponse({"ok":True,"message": "Codelist. Hello world", "data":[]})

class BarrioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Barrio.objects.all()
    serializer_class = BarrioSerializer
    permission_classes = [permissions.AllowAny]

class TipoResiduoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoResiduo.objects.all()
    serializer_class = TipoResiduoSerializer
    permission_classes = [permissions.AllowAny]

class TipoPavimentoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoPavimento.objects.all()
    serializer_class = TipoPavimentoSerializer
    permission_classes = [permissions.AllowAny]

class TipoMantenimientoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoMantenimiento.objects.all()
    serializer_class = TipoMantenimientoSerializer
    permission_classes = [permissions.AllowAny]



    