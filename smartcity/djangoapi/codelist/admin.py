from django.contrib import admin

# Register your models here.
from .models import Barrio, TipoResiduo, TipoPavimento, TipoMantenimiento

admin.site.register(Barrio)
admin.site.register(TipoResiduo)
admin.site.register(TipoPavimento)
admin.site.register(TipoMantenimiento)