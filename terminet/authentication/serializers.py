from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User

UserModel = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        user = UserModel.objects.create_user(
            username=validated_data['username'],
            playerType=validated_data['playerType'], 
            password=validated_data['password']
        )
        user.save()

        return user

    class Meta:
        model = User
        fields = ['id', 'username', 'playerType', 'password']