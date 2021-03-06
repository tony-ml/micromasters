# Generated by Django 2.1.11 on 2019-12-12 18:18

from django.db import migrations
import wagtail.core.fields


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0042_programpage_program_letter_footer'),
    ]

    operations = [
        migrations.AddField(
            model_name='programpage',
            name='program_letter_footer_text',
            field=wagtail.core.fields.RichTextField(blank=True, help_text='Footer text that will appear on the program congratulation letter.', null=True),
        ),
    ]
