from django.http.response import Http404
from rest_framework import permissions
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from . import serializers, models

class CharacterList(APIView):
    """ 
    Get the list of characters under a user
    Add a character to a user
    """
    def get(self, request, userId):
        """ Get the list of characters """
        characters = models.Character.objects.all().filter(owner=userId)
        serializer = serializers.CharacterSerializer(instance=characters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, userId):
        """ Add a character """
        serializer = serializers.CharacterSerializer(data=request.data)
        serializer.initial_data['owner'] = request.user.id
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CampaignCharacterList(APIView):
    """
    Get the list of characters whose dm is the user
    """
    def get(self, request, userId):
        """ Get the list of characters """
        characters = models.Character.objects.all().filter(~Q(owner=userId), dm=userId)
        serializer = serializers.CharacterSerializer(instance=characters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CharacterDetail(APIView):
    """ Get the details of a specific character """
    def get(self, request, userId, characterId):
        """ Get the character """
        character = models.Character.objects.get(owner=userId, id=characterId)
        serializer = serializers.CharacterSerializer(instance=character)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BoxList(APIView):
    """
    Get all the character's boxes
    Add a box to the character
    """
    def get_character(self, userId, characterId):
        try:
            return models.Character.objects.get(owner=userId, id=characterId)
        except:
            raise Http404

    def get(self, request, userId, characterId):
        """ Get all the character's boxes """
        character = self.get_character(userId, characterId)
        boxes = models.Box.objects.all().filter(character=character)
        serializer = serializers.BoxSerializer(instance=boxes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, userId, characterId):
        """ Add a box """
        character = self.get_character(userId, characterId)
        serializer = serializers.BoxSerializer(data=request.data)
        serializer.initial_data['character'] = character.id
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BoxDetail(APIView):
    """
    Get the details of a specific box
    Edit a character's box
    Delete a character's box
    """
    def get_character(self, userId, characterId):
        try:
            return models.Character.objects.get(owner=userId, id=characterId)
        except:
            raise Http404
    
    def get_box(self, boxId):
        try:
            return models.Box.objects.get(id=boxId)
        except:
            raise Http404
    
    def get(self, request, userId, characterId, boxId):
        """ Get A character's box """
        box = self.get_box(boxId)
        serializer = serializers.BoxSerializer(instance=box)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, userId, characterId, boxId):
        """ Edit a character's box """
        box = self.get_box(boxId)
        serializer = serializers.BoxSerializer(instance=box, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, userId, characterId, boxId):
        """ Delete a character's box """
        box = self.get_box(boxId)
        box.delete()
        return Response(None, status=status.HTTP_204_NO_CONTENT)