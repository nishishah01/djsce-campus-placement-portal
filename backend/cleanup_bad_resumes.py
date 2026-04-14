"""
Run this once to clear out application customResume entries that point to
non-existent Cloudinary files (i.e. they were saved with a plain filename,
not a real Cloudinary public_id).

Run with:
    python cleanup_bad_resumes.py
from inside the `backend/` folder.
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from placements.models import Application

# A real Cloudinary public_id will start with the folder name and have no spaces.
# Bad ones look like just a filename e.g. "ge_aerospace.pdf" or a path that
# produces a 404 (where the URL version is /v1/ not a real timestamp like /v1776094598/).
# We identify bad records: customResume is non-empty but the stored string
# does NOT contain "res.cloudinary.com" (it's a raw public_id that maps to a broken URL).

fixed = 0
for app in Application.objects.exclude(customResume='').exclude(customResume=None):
    val = str(app.customResume)
    # If the value is just a plain filename or path (no URL structure), clear it
    # Valid ones stored by cloudinary will have their real public_id like "raw/upload/..."
    # We'll check: if calling .url gives us a /v1/ (not a real version timestamp), clear it
    try:
        url = app.customResume.url
        # Real Cloudinary uploads have a version like v1776094598 (10 digits after v)
        # Corrupted ones have /v1/ (just v1, one digit)
        import re
        if re.search(r'/v1/', url) and not re.search(r'/v1\d{9,}/', url):
            print(f"Clearing bad customResume for app {app.id}: {url}")
            app.customResume = None
            app.save(update_fields=['customResume'])
            fixed += 1
        else:
            print(f"OK: app {app.id}: {url}")
    except Exception as e:
        print(f"Error for app {app.id}: {e}")

print(f"\nDone. Cleared {fixed} bad resume entries.")
