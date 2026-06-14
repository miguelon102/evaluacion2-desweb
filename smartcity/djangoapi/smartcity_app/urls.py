from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'parques', views.ParquesViewSet)
router.register(r'contenedores', views.ContenedoresViewSet)
router.register(r'carriles', views.CarrilesBiciViewSet)

urlpatterns = [
    path('', include(router.urls)),
]