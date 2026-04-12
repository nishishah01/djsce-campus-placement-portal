from rest_framework import viewsets
from .models import Student, Job, Application, Recruiter
from .serializers import StudentSerializer, JobSerializer, ApplicationSerializer, RecruiterSerializer

class RecruiterViewSet(viewsets.ModelViewSet):
    queryset = Recruiter.objects.all()
    serializer_class = RecruiterSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
