# -*- coding: utf-8 -*-
# Generated by Django 1.10.3 on 2016-12-27 18:30
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0020_courserun_freeze_grade_date'),
        ('grades', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CourseRunGradingStatus',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_on', models.DateTimeField(auto_now_add=True)),
                ('updated_on', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('pending', 'pending'), ('complete', 'complete')], default='pending', max_length=30)),
                ('course_run', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='courses.CourseRun')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
