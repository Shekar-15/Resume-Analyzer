# Django Settings - Basic Python Configuration
import os

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Secret key
SECRET_KEY = 'django-secret-key-for-resume-analyzer-2026'

# Debug mode
DEBUG = True

# Allowed hosts
ALLOWED_HOSTS = ['*']

# Installed apps
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# Root URL configuration
ROOT_URLCONF = 'urls'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

# WSGI application
WSGI_APPLICATION = 'wsgi.application'

# Database (not needed for this app)
DATABASES = {}

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# File upload settings - Increased for bulk resume uploads (up to 500 files)
FILE_UPLOAD_MAX_MEMORY_SIZE = 209715200  # 200MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 209715200  # 200MB

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Time zone
TIME_ZONE = 'UTC'
USE_TZ = True
