from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    playerTypeChoices = [
        ('dm', 'Dungeon Master'),
        ('player', 'Player')
    ]
    playerType = models.CharField(max_length=64, choices=playerTypeChoices)
    pass