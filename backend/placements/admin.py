from django.contrib import admin
from .models import Recruiter, Student, Job, Application

admin.site.register(Recruiter)
admin.site.register(Student)
admin.site.register(Job)
admin.site.register(Application)