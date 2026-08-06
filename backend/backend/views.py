# backend/views.py
import os
from django.http import HttpResponse, FileResponse, Http404
from django.conf import settings

def serve_frontend(request, path='index.html'):
    if not path or path == '/':
        path = 'index.html'

    mainweb_dir = settings.BASE_DIR.parent / 'mainweb'
    file_path = mainweb_dir / path

    if os.path.exists(file_path) and os.path.isfile(file_path):
        # Determine content type
        if path.endswith('.html'):
            content_type = 'text/html; charset=utf-8'
        elif path.endswith('.css'):
            content_type = 'text/css'
        elif path.endswith('.js'):
            content_type = 'application/javascript'
        else:
            content_type = None

        return FileResponse(open(file_path, 'rb'), content_type=content_type)
    
    raise Http404("Page not found")
