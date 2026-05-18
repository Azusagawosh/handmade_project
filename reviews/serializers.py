from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    product_title = serializers.ReadOnlyField(source='product.title')

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'product', 'created_at']