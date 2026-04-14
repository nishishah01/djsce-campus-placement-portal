from rest_framework import serializers
from django.conf import settings
from .models import Student, Job, Application, Recruiter


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
        data = super().to_representation(instance)
        if data.get('jdPdf'):
            data['jdPdf'] = _to_https(str(data['jdPdf']))
        return data


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('customResume'):
            data['customResume'] = _to_https(str(data['customResume']))
        return data
