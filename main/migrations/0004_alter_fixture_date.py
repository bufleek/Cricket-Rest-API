# Generated by Django 4.0.3 on 2022-03-14 16:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_alter_team_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='fixture',
            name='date',
            field=models.DateTimeField(),
        ),
    ]