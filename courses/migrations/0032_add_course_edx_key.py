# Generated by Django 2.1.10 on 2019-08-15 18:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0031_electives_set_releated_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='edx_key',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
