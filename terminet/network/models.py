from django.db import models

# Create your models here.
class Character(models.Model):
    name = models.CharField(max_length=256)
    owner = models.ForeignKey('authentication.User', models.CASCADE, related_name='owner')
    dm = models.ForeignKey('authentication.User', models.CASCADE, null=True, blank=True, related_name='dm')

    def __str__(self):
        return f'{self.owner}: {self.name}'


class Box(models.Model):
    boxTypeChoices = [
        ('name', 'Name'),
        ('nameNumber', 'Name & Number'),
        ('nameNumberInf', 'Name & Number Calculator'),
        ('nameNumberRange', 'Name & Number Calculator w/range'),
        ('nameDice', 'Name & Dice'),
        ('nameShortDesc', 'Name & Short Description'),
        ('nameLongDesc', 'Name & Long Description'),
    ]
    boxType = models.CharField(max_length=64, choices=boxTypeChoices)
    character = models.ForeignKey('network.Character', models.CASCADE)

    name = models.CharField(max_length=256, default='', blank=True, null=True)
    text = models.TextField(max_length=2 ** 16, default='', blank=True, null=True)
    longText = models.TextField(blank=True, null=True)
    minNum = models.IntegerField(blank=True, null=True)
    maxNum = models.IntegerField(blank=True, null=True)

    positionX = models.IntegerField()
    positionY = models.IntegerField()

    def __str__(self):
        return f'{self.character.owner}: {self.character.name}: [{self.boxType}]{self.name}'