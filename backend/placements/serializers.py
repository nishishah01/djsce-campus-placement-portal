from rest_framework import serializers
from .models import Student, Job, Application, Recruiter

class RecruiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruiter
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'
