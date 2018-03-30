# Generated by Django 2.0.2 on 2018-03-22 16:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

from dashboard.utils import get_mmtrack


def populate_user_course(apps, schema_editor):
    MicromastersCourseCertificate = apps.get_model('grades', 'MicromastersCourseCertificate')

    for certificate in MicromastersCourseCertificate.objects.select_related('final_grade').all():
        grade = certificate.final_grade
        certificate.user = grade.user
        certificate.course = grade.course_run.course
        certificate.save()


def populate_final_grade(apps, schema_editor):
    MicromastersCourseCertificate = apps.get_model('grades', 'MicromastersCourseCertificate')

    for certificate in MicromastersCourseCertificate.objects.select_related('final_grade').all():
        if not certificate.final_grade:
            mmtrack = get_mmtrack(certificate.user, certificate.course.program)
            certificate.final_grade = mmtrack.get_best_final_grade_for_course(certificate.course)
            certificate.save()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('courses', '0027_added_course_number_to_course_model'),
        ('grades', '0012_combined_final_grade'),
    ]

    operations = [
        migrations.AddField(
            model_name='micromasterscoursecertificate',
            name='course',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='courses.Course'),
        ),
        migrations.AddField(
            model_name='micromasterscoursecertificate',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL,related_name='course_certificates', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='micromasterscoursecertificate',
            name='final_grade',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='certificate', to='grades.FinalGrade'),
        ),
        migrations.RunPython(populate_user_course, populate_final_grade),
    ]