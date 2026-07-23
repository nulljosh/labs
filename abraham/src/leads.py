"""Load leads from a CSV. Exact columns TBD once Abraham shares his lead list format."""
import csv


def load_leads(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))
