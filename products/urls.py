from django.urls import path
from .views import (
    ProductListAPIView, ProductDetailAPIView, CategoryListAPIView,
    MyProductsAPIView, FavoriteListAPIView, FavoriteDeleteAPIView
)

urlpatterns = [
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('my-products/', MyProductsAPIView.as_view(), name='my-products'),
    path('favorites/', FavoriteListAPIView.as_view(), name='favorite-list'),
    path('favorites/<int:pk>/', FavoriteDeleteAPIView.as_view(), name='favorite-delete'),
]