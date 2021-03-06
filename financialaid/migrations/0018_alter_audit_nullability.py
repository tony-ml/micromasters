# -*- coding: utf-8 -*-
# Generated by Django 1.9.10 on 2016-10-19 21:45
from __future__ import unicode_literals

from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('financialaid', '0017_countryincomethreshold_unique'),
    ]

    operations = [
        migrations.AlterField(
            model_name='financialaidaudit',
            name='acting_user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='financialaidaudit',
            name='data_after',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='financialaidaudit',
            name='data_before',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, null=True),
        ),
    ]
