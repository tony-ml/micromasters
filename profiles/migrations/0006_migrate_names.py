# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-12 21:03
from __future__ import unicode_literals

from django.db import migrations, models
from profiles.util import split_name


def copy_names(apps, schema_editor):
    Profile = apps.get_model("profiles", "Profile")

    for profile in Profile.objects.all():
        name = profile.name
        profile.preferred_name = name
        profile.first_name, profile.last_name = split_name(name)
        profile.save()


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0005_personal_fields'),
    ]

    operations = [
        migrations.RunPython(copy_names, lambda apps, schema_editor: None)
    ]
