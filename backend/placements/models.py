from django.db import models

class Recruiter(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    companyName = models.CharField(max_length=255)
    recruiterName = models.CharField(max_length=255)
    email = models.EmailField()
    password = models.CharField(max_length=255, default="password123")

class Student(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255)
    sapId = models.CharField(max_length=255)
    email = models.EmailField()
    department = models.CharField(max_length=255)
    dob = models.DateField()
    score10th = models.FloatField()
    score12th = models.FloatField()
    cgpa = models.FloatField()
    resumeUrl = models.FileField(upload_to="resumes/", blank=True, null=True)
    avatar = models.CharField(max_length=500, blank=True, null=True)

class Job(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    companyName = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    stipend = models.CharField(max_length=255)
    eligibleDepartments = models.JSONField(default=list)
    deadline = models.DateField()
    description = models.TextField(blank=True, null=True)
    jdUrl = models.URLField(blank=True, null=True)
    postedBy = models.CharField(max_length=255)
    postedAt = models.DateField()
    location = models.CharField(max_length=255)
    TYPE_CHOICES = (
        ("Full-Time", "Full-Time"),
        ("Internship", "Internship"),
        ("Part-Time", "Part-Time"),
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)

class Application(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    studentId = models.CharField(max_length=255)
    jobId = models.CharField(max_length=255)
    appliedAt = models.DateField()
    STATUS_CHOICES = (
        ("pending", "pending"),
        ("shortlisted", "shortlisted"),
        ("rejected", "rejected"),
        ("accepted", "accepted"),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    customResume = models.FileField(upload_to="custom_resumes/", blank=True, null=True)
    coverNote = models.TextField(blank=True, null=True)
