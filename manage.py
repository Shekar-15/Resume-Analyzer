#!/usr/bin/env python
# Django Management Script - Basic Python
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        error_message = "Django not installed. Please run: pip install django"
        print(error_message)
        sys.exit(1)
    execute_from_command_line(sys.argv)
