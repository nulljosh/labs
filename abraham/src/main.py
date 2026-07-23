"""Leads in, emails out. No CRM, no dashboard."""
from dotenv import load_dotenv

from leads import load_leads
from writer import draft_email
from sender import send_email

load_dotenv()

BRAND_NOTES = ""  # TODO: fill in once Abraham shares brand/voice notes


def main(leads_path: str = "leads.csv") -> None:
    for lead in load_leads(leads_path):
        body = draft_email(lead, BRAND_NOTES)
        send_email(lead["email"], subject="Quick question", body=body)
        print(f"Sent to {lead['email']}")


if __name__ == "__main__":
    main()
