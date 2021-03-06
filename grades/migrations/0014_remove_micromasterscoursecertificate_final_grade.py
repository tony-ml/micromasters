# Generated by Django 2.0.2 on 2018-03-26 19:07

from django.db import migrations
from django.db.models import Count

from micromasters.utils import generate_md5


def delete_duplicate_cert(apps, schema_editor):
    Course = apps.get_model('courses', 'Course')
    MicromastersCourseCertificate = apps.get_model('grades', 'MicromastersCourseCertificate')
    FinalGrade = apps.get_model('grades', 'FinalGrade')

    courses = Course.objects.filter(
        program__live=True,
        program__financial_aid_availability=True
    )
    for course in courses:
        # find all users with duplicate certificates
        users_with_dup = MicromastersCourseCertificate.objects.filter(
            course=course
        ).values('user').annotate(Count('user')).filter(user__count__gt=1)
        for user in users_with_dup:
            best_grade = FinalGrade.objects.filter(
                user=user['user'],
                course_run__course=course,
                passed=True
            ).order_by('-grade').first()
            # trying to preserve the cert that is linked in the dashboard
            if MicromastersCourseCertificate.objects.filter(final_grade=best_grade).exists():
                # delete other certificates
                MicromastersCourseCertificate.objects.filter(
                    course=course, user=user['user']
                ).exclude(final_grade=best_grade).delete()
            else:
                certs = MicromastersCourseCertificate.objects.filter(
                    course=course, user=user['user']
                )
                certs.exclude(id__in=certs[:1]).delete()


def add_final_grade(apps, schema_editor):
    MicromastersCourseCertificate = apps.get_model('grades', 'MicromastersCourseCertificate')
    FinalGrade = apps.get_model('grades', 'FinalGrade')
    Course = apps.get_model('courses', 'Course')

    certificates= MicromastersCourseCertificate.objects.filter(course__isnull=True)
    for certificate in certificates:
        certificate.delete()
    certificates = MicromastersCourseCertificate.objects.filter(course__program__financial_aid_availability=True)

    for certificate in certificates:
        passing_final_grades = FinalGrade.objects.filter(
            user=certificate.user,
            course_run__course=certificate.course,
            passed=True
        ).order_by('-grade')
        certificate.final_grade = passing_final_grades.first()
        certificate.save()
        # check if has other passing final_grades
        for final_grade in passing_final_grades[1:]:
            hash = generate_md5('{}|{}'.format(certificate.user_id, final_grade.course_run_id).encode('utf-8'))
            MicromastersCourseCertificate.objects.create(
                final_grade=final_grade,
                user=final_grade.user,
                course=certificate.course,
                hash=hash
            )


class Migration(migrations.Migration):

    dependencies = [
        ('grades', '0013_modify_course_certificate'),
    ]

    operations = [
                migrations.RunPython(delete_duplicate_cert, add_final_grade),
    ]
