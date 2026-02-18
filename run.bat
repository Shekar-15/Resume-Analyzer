@echo off
echo ====================================
echo   Resume Analyzer - ATS System
echo   Using Django Framework
echo ====================================
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting application...
echo.
echo Open your browser and go to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
python manage.py runserver 0.0.0.0:8000
pause
