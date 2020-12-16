from rest_framework import serializers
from . import models

class CharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Character
        fields = '__all__'


class BoxSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Box
        fields = '__all__'