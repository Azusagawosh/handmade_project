from django.urls import path
from .views import RegisterAPIView, LoginAPIView, ProfileAPIView, UserListView, UserChangeRoleView, UserDetailAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('users/<int:pk>/change-role/', UserChangeRoleView.as_view(), name='user-change-role'),
]