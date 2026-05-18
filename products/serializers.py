from rest_framework import serializers
from .models import Category, Product, Favorite


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    seller_name = serializers.ReadOnlyField(source='seller.username')
    is_favorited = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['seller', 'created_at', 'updated_at']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, product=obj).exists()
        return False

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class FavoriteSerializer(serializers.ModelSerializer):
    product_title = serializers.ReadOnlyField(source='product.title')
    product_price = serializers.ReadOnlyField(source='product.price')
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ['id', 'product', 'product_title', 'product_price', 'product_image', 'created_at']

    def get_product_image(self, obj):
        if obj.product.image:
            return obj.product.image.url
        return None