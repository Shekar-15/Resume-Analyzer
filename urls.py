# Django URLs - Basic Python URL Configuration
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from views import index, analyze

# URL patterns
urlpatterns = [
    path('', index, name='index'),
    path('analyze', analyze, name='analyze'),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
