from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from django.http import HttpResponse
import csv
from .models import Student, Job, Application, Recruiter
from .serializers import StudentSerializer, JobSerializer, ApplicationSerializer, RecruiterSerializer

class RecruiterViewSet(viewsets.ModelViewSet):
    queryset = Recruiter.objects.all()
    serializer_class = RecruiterSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @action(detail=True, methods=['get'])
    def download_applications(self, request, pk=None):
        job = self.get_object()
        applications = Application.objects.filter(jobId=pk)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="applications_{job.role}_{job.companyName}.csv"'
        writer = csv.writer(response)
        writer.writerow(['Name', 'SAP ID', 'Email', 'Department', '10th Score', '12th Score', 'CGPA', 'Resume URL', 'Custom Resume URL', 'Cover Note', 'Status', 'Applied At'])
        for app in applications:
            try:
                student = Student.objects.get(id=app.studentId)
                writer.writerow([
                    student.name,
                    student.sapId,
                    student.email,
                    student.department,
                    student.score10th,
                    student.score12th,
                    student.cgpa,
                    student.resumeUrl.url if student.resumeUrl else '',
                    app.customResume.url if app.customResume else '',
                    app.coverNote or '',
                    app.status,
                    app.appliedAt,
                ])
            except Student.DoesNotExist:
                continue
        return response

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
