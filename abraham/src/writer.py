"""Draft a personalized cold email for one lead using Claude."""
import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM_PROMPT = """You write short, personalized cold emails. No fluff, no hype,
no generic templates. Reference something specific about the lead. Plain text,
under 150 words, one clear call to action."""


def draft_email(lead: dict, brand_notes: str) -> str:
    prompt = f"Lead info: {lead}\n\nBrand/voice notes: {brand_notes}\n\nWrite the email."
    msg = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text
