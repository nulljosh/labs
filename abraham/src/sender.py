"""Send an email via SMTP. Swap for Abraham's actual sending account/API once shared."""
import os
import smtplib
from email.mime.text import MIMEText


def send_email(to_addr: str, subject: str, body: str) -> None:
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = os.environ["FROM_EMAIL"]
    msg["To"] = to_addr

    with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.environ["SMTP_PORT"])) as server:
        server.starttls()
        server.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
        server.send_message(msg)
