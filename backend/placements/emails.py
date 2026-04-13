"""
Email notification utilities for the Placement Portal.
Sends job posting alerts to eligible students via SMTP.
"""

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import threading


def _build_email_body(job) -> tuple:
    """
    Returns (plain_text_body, html_body) for a job notification email.
    """
    eligible_depts = ", ".join(job.eligibleDepartments) if job.eligibleDepartments else "All Departments"
    description_plain = ("Description: " + job.description) if job.description else ""
    description_html = (
        f"<p style='color:#94a3b8;font-size:14px;'>{job.description}</p>"
        if job.description else ""
    )

    try:
        year = job.postedAt.year
    except AttributeError:
        year = 2026

    plain = f"""Dear Student,

A new job opportunity has been posted on the DJSCE Placement Portal!

Company   : {job.companyName}
Role      : {job.role}
Type      : {job.type}
Location  : {job.location}
Stipend   : {job.stipend}
Deadline  : {job.deadline}
Eligible  : {eligible_depts}

{description_plain}

Log in to the Placement Portal to view full details and apply before the deadline.

Regards,
DJSCE Placement Cell
"""

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; margin: 0; padding: 0; }}
    .wrapper {{ max-width: 600px; margin: 40px auto; background: #1e293b; border-radius: 16px; overflow: hidden; }}
    .header {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; }}
    .header h1 {{ color: #fff; margin: 0; font-size: 22px; letter-spacing: 1px; }}
    .header p {{ color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }}
    .body {{ padding: 28px 32px; color: #e2e8f0; }}
    .body h2 {{ color: #a5b4fc; font-size: 18px; margin-top: 0; }}
    .card {{ background: #0f172a; border-radius: 10px; padding: 18px 22px; margin: 16px 0; }}
    .row {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }}
    .row:last-child {{ border-bottom: none; }}
    .label {{ color: #94a3b8; min-width: 110px; }}
    .value {{ color: #f8fafc; font-weight: 500; text-align: right; }}
    .btn-wrap {{ text-align: center; margin: 24px 0 8px; }}
    .btn {{ background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none;
            padding: 12px 32px; border-radius: 50px; font-weight: 600; font-size: 15px; display: inline-block; }}
    .footer {{ background: #0f172a; text-align: center; padding: 18px; color: #475569; font-size: 12px; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>&#127891; DJSCE Placement Portal</h1>
      <p>New Job Opportunity Just Posted!</p>
    </div>
    <div class="body">
      <h2>{job.companyName} is hiring!</h2>
      <div class="card">
        <div class="row"><span class="label">Role</span><span class="value">{job.role}</span></div>
        <div class="row"><span class="label">Type</span><span class="value">{job.type}</span></div>
        <div class="row"><span class="label">Location</span><span class="value">{job.location}</span></div>
        <div class="row"><span class="label">Stipend / CTC</span><span class="value">{job.stipend}</span></div>
        <div class="row"><span class="label">Deadline</span><span class="value">{job.deadline}</span></div>
        <div class="row"><span class="label">Eligible Depts</span><span class="value">{eligible_depts}</span></div>
      </div>
      {description_html}
      <div class="btn-wrap">
        <a class="btn" href="http://localhost:5173">View &amp; Apply Now</a>
      </div>
    </div>
    <div class="footer">
      You are receiving this email because you are a registered student on the DJSCE Placement Portal.<br/>
      &copy; {year} DJSCE Placement Cell
    </div>
  </div>
</body>
</html>"""

    return plain.strip(), html.strip()


def send_job_notification_to_students(job, students_queryset):
    """
    Sends job notification emails to all eligible students.
    Runs in a background thread so the API response is not delayed.

    The student email list is resolved to a plain Python list BEFORE spawning
    the thread — Django closes the DB connection when a thread ends, so a lazy
    QuerySet evaluated inside a new thread can silently return empty results.
    """

    # ✅ Evaluate QuerySet eagerly in the main (request) thread
    recipient_emails = list(students_queryset.values_list('email', flat=True))

    if not recipient_emails:
        print("[EMAIL] No eligible students found — skipping notification.")
        return

    # ✅ Pre-compute everything needed in the thread (no DB / ORM access inside)
    subject = f"[Placement Portal] New Opportunity at {job.companyName} — {job.role}"
    plain_body, html_body = _build_email_body(job)
    from_email = settings.DEFAULT_FROM_EMAIL

    def _send():
        # Send one email, BCC all recipients — avoids exposing addresses to each other
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_body,
            from_email=from_email,
            to=[from_email],          # "To" shows the placement cell address
            bcc=recipient_emails,     # actual recipients hidden via BCC
        )
        email.attach_alternative(html_body, "text/html")

        try:
            email.send(fail_silently=False)
            print(
                f"[EMAIL] Notification sent for '{job.role}' at "
                f"{job.companyName} to {len(recipient_emails)} student(s)."
            )
        except Exception as exc:
            print(f"[EMAIL ERROR] Failed to send job notification: {exc}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
