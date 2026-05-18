from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'full_name', 'phone', 'avatar', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'full_name', 'phone']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'user'),
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', '')
        )
        return user