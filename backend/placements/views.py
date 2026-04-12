from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Student, Job, Application, Recruiter
from .serializers import StudentSerializer, JobSerializer, ApplicationSerializer, RecruiterSerializer

class RecruiterViewSet(viewsets.ModelViewSet):
    queryset = Recruiter.objects.all()
    serializer_class = RecruiterSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = [MultiPartParser, FormParser]

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    parser_classes = [MultiPartParser, FormParser]

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    parser_classes = [MultiPartParser, FormParser]
