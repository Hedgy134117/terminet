# Generated by Django 3.1.3 on 2020-12-16 18:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_box'),
    ]

    operations = [
        migrations.AlterField(
            model_name='box',
            name='text',
            field=models.TextField(blank=True, default='', max_length=65536, null=True),
        ),
    ]