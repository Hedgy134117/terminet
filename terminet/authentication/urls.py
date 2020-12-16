from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.UserList.as_view(), name='user-list'),
    path('login/', views.UserLogin.as_view(), name='user-login'),
]