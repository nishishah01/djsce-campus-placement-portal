from rest_framework import serializers
from django.conf import settings
# pyrefly: ignore [missing-import]
from .models import Student, Job, Application, Recruiter
import re
from datetime import datetime


def _to_https(url: str) -> str:
    """Ensure the Cloudinary URL is a full https URL.
    CloudinaryField sometimes returns just the public path (no domain).
    """
    if not url:
        return ""
    if url.startswith("https://"):
        return url
    if url.startswith("http://"):
        return "https://" + url[7:]
    # It's a raw public path like "student/raw/upload/v.../file.pdf"
    cloud_name = settings.CLOUDINARY_STORAGE.get('CLOUD_NAME', '')
    return f"https://res.cloudinary.com/{cloud_name}/{url}"


class RecruiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruiter
        fields = '__all__'

    def validate_email(self, value):
        qs = Recruiter.objects.filter(email__iexact=value)
        # On updates, exclude the current instance
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A recruiter with this email is already registered.")
        return value


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('resumeUrl'):
            data['resumeUrl'] = _to_https(str(data['resumeUrl']))
        return data


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

    def to_representation(self, instance):
        #api response ko customize karega before sending it to frontend
        data = super().to_representation(instance)
        if data.get('jdPdf'):
            data['jdPdf'] = _to_https(str(data['jdPdf']))#cause cloudinary doesn't return https
        return data


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

    def validate(self, data):
        job_id = data.get('jobId')
        if job_id:
            try:
                job = Job.objects.get(id=job_id)
                deadline_str = job.deadline
                if deadline_str:
                    match = re.match(r'^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s*IST$', deadline_str, re.IGNORECASE)
                    if match:
                        date_part, time_part = match.groups()
                        dt = datetime.strptime(f"{date_part} {time_part}", "%Y-%m-%d %H:%M")
                        if datetime.now() > dt:
                            raise serializers.ValidationError("This application is no longer accepting requests....")
                    else:
                        try:
                            dt = datetime.strptime(deadline_str, "%Y-%m-%d")
                            if datetime.now() > dt:
                                raise serializers.ValidationError("This application is no longer accepting requests....")
                        except ValueError:
                            pass
            except Job.DoesNotExist:
                pass
        return data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('customResume'):
            data['customResume'] = _to_https(str(data['customResume']))
        return data
