#!/usr/bin/env python3
"""Writes demo shop data (Saved JSON) for App Store screenshots. Prints the JSON to stdout.
Load it into a booted simulator with ../shots.sh. Every name and address here is made up."""
import json, uuid, datetime as dt

ref = dt.datetime(2001, 1, 1, tzinfo=dt.timezone.utc)
now = dt.datetime.now(dt.timezone.utc)
def at(days=0, hour=None):
    d = now + dt.timedelta(days=days)
    if hour is not None: d = d.replace(hour=hour + 8, minute=0, second=0, microsecond=0)  # PST shown as local morning
    return (d - ref).total_seconds()
U = lambda: str(uuid.uuid4()).upper()

def part(name, cat, qty, cost, low=2, **spring):
    p = {"id": U(), "name": name, "category": cat, "quantity": qty, "lowStockThreshold": low, "costCents": cost}
    p.update(spring); return p

parts = [
    part("Torsion spring .225 x 2\" x 24\"", "Springs", 6, 4250, wire=0.225, insideDiameter=2, length=24, wind="LH"),
    part("Torsion spring .225 x 2\" x 24\"", "Springs", 5, 4250, wire=0.225, insideDiameter=2, length=24, wind="RH"),
    part("Torsion spring .250 x 2\" x 30\"", "Springs", 1, 5600, wire=0.25, insideDiameter=2, length=30, wind="LH"),
    part("Torsion spring .243 x 1.75\" x 27\"", "Springs", 4, 4900, wire=0.243, insideDiameter=1.75, length=27, wind="RH"),
    part("Extension spring 120 lb", "Springs", 3, 1800),
    part("Cable 8' door", "Cables", 10, 900),
    part("Cable 7' door", "Cables", 8, 850),
    part("Roller 2\" nylon, 13-ball", "Rollers", 40, 350, low=10),
    part("Roller 3\" steel", "Rollers", 12, 280, low=6),
    part("Hinge #1", "Hardware", 15, 420),
    part("Hinge #2", "Hardware", 15, 420),
    part("Bottom bracket pair", "Hardware", 5, 1650),
    part("LiftMaster 87504-267", "Openers", 1, 52900),
    part("LiftMaster 84602", "Openers", 2, 41900),
    part("LiftMaster remote 893MAX", "Openers", 8, 4500),
    part("Weather seal 9'", "Seals", 6, 2200),
    part("Weather seal 16'", "Seals", 4, 3400),
]
pid = {p["name"] + p.get("wind", ""): p["id"] for p in parts}

def job(customer, address, detail, status, created, scheduled=None, used=(), completed=None):
    j = {"id": U(), "customer": customer, "address": address, "detail": detail, "status": status,
         "created": created, "parts": [{"partID": pid[k], "quantity": q} for k, q in used],
         "stockDeducted": status in ("Complete", "Paid")}
    if scheduled is not None: j["scheduled"] = scheduled
    if completed is not None: j["completed"] = completed
    return j

jobs = [
    job("Halvorsen residence", "20418 Cedar Ridge Way", "Broken spring, 16x7 double door", "Scheduled", at(-2), at(0, 9),
        [("Torsion spring .225 x 2\" x 24\"LH", 1), ("Torsion spring .225 x 2\" x 24\"RH", 1), ("Cable 7' door", 2)]),
    job("Okafor residence", "7731 Willow Bend Cres", "Opener install, belt drive", "Scheduled", at(-3), at(0, 13),
        [("LiftMaster 87504-267", 1)]),
    job("Ridgeway Self Storage", "4400 Industrial Ave, Unit 12", "Rollers and seal on 4 bays", "Paid", at(-9), at(-4, 10),
        [("Roller 2\" nylon, 13-ball", 20), ("Weather seal 16'", 2)], completed=at(-4)),
    job("Maple Ridge storefront", "118 Main St", "Quote: new insulated door 9x8", "Quote", at(-1)),
    job("Dhillon residence", "3305 Fernwood Pl", "Noisy door, tune-up", "Lead", at(0)),
    job("Bergstrom residence", "9902 Hillview Dr", "Cable snapped, door crooked", "Complete", at(-6), at(-1, 11),
        [("Cable 8' door", 2), ("Bottom bracket pair", 1)], completed=at(-1)),
]
print(json.dumps({"parts": parts, "jobs": jobs, "history": []}))
