from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, JobViewSet, ApplicationViewSet, RecruiterViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'recruiters', RecruiterViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
