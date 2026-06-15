from codelist import views
from django.urls import path, include
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'barrios', views.BarrioViewSet)
router.register(r'tipos-residuo', views.TipoResiduoViewSet)
router.register(r'tipos-pavimento', views.TipoPavimentoViewSet)
router.register(r'tipos-mantenimiento', views.TipoMantenimientoViewSet)

urlpatterns = [
    path("hello_world/", views.HelloWord.as_view(), name="hello_world"),
    path('', include(router.urls)),
]