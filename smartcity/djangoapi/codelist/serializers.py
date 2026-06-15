from rest_framework import serializers
from .models import Barrio, TipoResiduo, TipoPavimento, TipoMantenimiento

class BarrioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barrio
        fields = ['id', 'nombre']

class TipoResiduoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoResiduo
        fields = ['id', 'nombre']

class TipoPavimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoPavimento
        fields = ['id', 'nombre']

class TipoMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoMantenimiento
        fields = ['id', 'nombre']