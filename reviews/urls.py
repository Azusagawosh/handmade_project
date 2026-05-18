from django.urls import path
from .views import ReviewListCreateAPIView, MyReviewsAPIView, AllReviewsAPIView

urlpatterns = [
    path('products/<int:product_id>/reviews/', ReviewListCreateAPIView.as_view(), name='review-list-create'),
    path('my-reviews/', MyReviewsAPIView.as_view(), name='my-reviews'),
    path('reviews/all/', AllReviewsAPIView.as_view(), name='all-reviews'),
]