#!/usr/bin/env python3
"""Generate fixtures.js RAW rows from the official 2026/27 PL list."""

# gw, date, uk_time, home, away
M = []

def add(gw, date, time, home, away):
    M.append((gw, date, time, home, away))

def sat(gw, date, pairs, default="15:00"):
    for item in pairs:
        if len(item) == 3:
            time, home, away = item
        else:
            home, away = item
            time = default
        add(gw, date, time, home, away)

# GW1
add(1, "2026-08-21", "20:00", "Arsenal", "Coventry")
sat(1, "2026-08-22", [
    ("12:30", "Hull", "Man Utd"),
    ("Everton", "Crystal Palace"),
    ("Ipswich", "Sunderland"),
    ("Nott'm Forest", "Leeds"),
    ("17:30", "Brentford", "Spurs"),
])
sat(1, "2026-08-23", [
    ("14:00", "Brighton", "Aston Villa"),
    ("14:00", "Man City", "Bournemouth"),
    ("16:30", "Newcastle", "Liverpool"),
])
add(1, "2026-08-24", "20:00", "Fulham", "Chelsea")

# GW2
add(2, "2026-08-28", "20:00", "Crystal Palace", "Man City")
sat(2, "2026-08-29", [
    ("12:30", "Liverpool", "Nott'm Forest"),
    ("Bournemouth", "Everton"),
    ("Coventry", "Hull"),
    ("17:30", "Spurs", "Newcastle"),
])
sat(2, "2026-08-30", [
    ("14:00", "Chelsea", "Brighton"),
    ("14:00", "Leeds", "Brentford"),
    ("14:00", "Sunderland", "Fulham"),
    ("16:30", "Man Utd", "Ipswich"),
])
add(2, "2026-08-31", "20:00", "Aston Villa", "Arsenal")

# GW3
add(3, "2026-09-04", "20:00", "Ipswich", "Liverpool")
sat(3, "2026-09-05", [
    ("12:30", "Newcastle", "Bournemouth"),
    ("Brentford", "Sunderland"),
    ("Brighton", "Leeds"),
    ("Fulham", "Crystal Palace"),
    ("Man City", "Coventry"),
    ("Nott'm Forest", "Spurs"),
    ("17:30", "Hull", "Aston Villa"),
])
sat(3, "2026-09-06", [
    ("14:00", "Everton", "Man Utd"),
    ("16:30", "Arsenal", "Chelsea"),
])

# GW4
sat(4, "2026-09-12", [
    ("Bournemouth", "Brentford"),
    ("Aston Villa", "Nott'm Forest"),
    ("Chelsea", "Hull"),
    ("Crystal Palace", "Ipswich"),
    ("Liverpool", "Fulham"),
    ("17:30", "Spurs", "Everton"),
    ("20:00", "Sunderland", "Arsenal"),
])
sat(4, "2026-09-13", [
    ("14:00", "Coventry", "Brighton"),
    ("16:30", "Man Utd", "Man City"),
])
add(4, "2026-09-14", "20:00", "Leeds", "Newcastle")

# GW5
add(5, "2026-09-18", "20:00", "Brentford", "Chelsea")
sat(5, "2026-09-19", [
    ("12:30", "Spurs", "Aston Villa"),
    ("Brighton", "Arsenal"),
    ("Everton", "Ipswich"),
    ("Leeds", "Crystal Palace"),
    ("Man City", "Sunderland"),
    ("Newcastle", "Hull"),
    ("17:30", "Nott'm Forest", "Coventry"),
])
sat(5, "2026-09-20", [
    ("14:00", "Bournemouth", "Liverpool"),
    ("16:30", "Fulham", "Man Utd"),
])

# GW6
sat(6, "2026-10-10", [
    ("12:30", "Arsenal", "Leeds"),
    ("Aston Villa", "Brentford"),
    ("Chelsea", "Bournemouth"),
    ("Ipswich", "Fulham"),
    ("Sunderland", "Brighton"),
    ("17:30", "Man Utd", "Spurs"),
])
sat(6, "2026-10-11", [
    ("14:00", "Crystal Palace", "Nott'm Forest"),
    ("14:00", "Hull", "Everton"),
    ("16:30", "Liverpool", "Man City"),
])
add(6, "2026-10-12", "20:00", "Coventry", "Newcastle")

# GW7
sat(7, "2026-10-17", [
    ("12:30", "Everton", "Chelsea"),
    ("Brentford", "Liverpool"),
    ("Fulham", "Hull"),
    ("Man City", "Ipswich"),
    ("17:30", "Newcastle", "Aston Villa"),
])
sat(7, "2026-10-18", [
    ("14:00", "Bournemouth", "Sunderland"),
    ("14:00", "Brighton", "Crystal Palace"),
    ("14:00", "Leeds", "Man Utd"),
    ("16:30", "Nott'm Forest", "Arsenal"),
])
add(7, "2026-10-19", "20:00", "Spurs", "Coventry")

# GW8
add(8, "2026-10-23", "20:00", "Ipswich", "Nott'm Forest")
sat(8, "2026-10-24", [
    ("12:30", "Aston Villa", "Man City"),
    ("Arsenal", "Everton"),
    ("Coventry", "Fulham"),
    ("Liverpool", "Brighton"),
    ("17:30", "Chelsea", "Spurs"),
])
sat(8, "2026-10-25", [
    ("14:00", "Crystal Palace", "Newcastle"),
    ("14:00", "Hull", "Brentford"),
    ("14:00", "Man Utd", "Bournemouth"),
    ("16:30", "Sunderland", "Leeds"),
])

# GW9
sat(9, "2026-10-31", [
    ("12:30", "Chelsea", "Man Utd"),
    ("Bournemouth", "Leeds"),
    ("Brentford", "Nott'm Forest"),
    ("Coventry", "Sunderland"),
    ("Hull", "Ipswich"),
    ("Man City", "Brighton"),
    ("17:30", "Spurs", "Crystal Palace"),
])
sat(9, "2026-11-01", [
    ("14:00", "Aston Villa", "Fulham"),
    ("16:30", "Liverpool", "Arsenal"),
])
add(9, "2026-11-02", "20:00", "Newcastle", "Everton")

# GW10
sat(10, "2026-11-07", [
    ("Arsenal", "Hull"),
    ("Brighton", "Brentford"),
    ("Crystal Palace", "Liverpool"),
    ("Everton", "Coventry"),
    ("Fulham", "Newcastle"),
    ("Ipswich", "Bournemouth"),
    ("Leeds", "Spurs"),
    ("Man Utd", "Aston Villa"),
    ("Nott'm Forest", "Man City"),
    ("Sunderland", "Chelsea"),
])

# GW11
sat(11, "2026-11-21", [
    ("Bournemouth", "Nott'm Forest"),
    ("Aston Villa", "Sunderland"),
    ("Brentford", "Everton"),
    ("Chelsea", "Leeds"),
    ("Coventry", "Crystal Palace"),
    ("Hull", "Brighton"),
    ("Liverpool", "Man Utd"),
    ("Man City", "Fulham"),
    ("Newcastle", "Arsenal"),
    ("Spurs", "Ipswich"),
])

# GW12
sat(12, "2026-11-28", [
    ("Arsenal", "Man City"),
    ("Brighton", "Newcastle"),
    ("Crystal Palace", "Hull"),
    ("Everton", "Liverpool"),
    ("Fulham", "Bournemouth"),
    ("Ipswich", "Aston Villa"),
    ("Leeds", "Coventry"),
    ("Man Utd", "Brentford"),
    ("Nott'm Forest", "Chelsea"),
    ("Sunderland", "Spurs"),
])

# GW13
for h, a in [
    ("Bournemouth", "Brighton"),
    ("Aston Villa", "Everton"),
    ("Brentford", "Arsenal"),
    ("Chelsea", "Crystal Palace"),
    ("Coventry", "Ipswich"),
    ("Hull", "Nott'm Forest"),
    ("Liverpool", "Sunderland"),
    ("Man City", "Leeds"),
    ("Newcastle", "Man Utd"),
    ("Spurs", "Fulham"),
]:
    add(13, "2026-12-02", "20:00", h, a)

# GW14
sat(14, "2026-12-05", [
    ("Bournemouth", "Hull"),
    ("Aston Villa", "Crystal Palace"),
    ("Brentford", "Man City"),
    ("Chelsea", "Liverpool"),
    ("Everton", "Fulham"),
    ("Leeds", "Ipswich"),
    ("Man Utd", "Coventry"),
    ("Newcastle", "Sunderland"),
    ("Nott'm Forest", "Brighton"),
    ("Spurs", "Arsenal"),
])

# GW15
sat(15, "2026-12-12", [
    ("Arsenal", "Bournemouth"),
    ("Brighton", "Everton"),
    ("Coventry", "Aston Villa"),
    ("Crystal Palace", "Man Utd"),
    ("Fulham", "Brentford"),
    ("Hull", "Spurs"),
    ("Ipswich", "Newcastle"),
    ("Liverpool", "Leeds"),
    ("Man City", "Chelsea"),
    ("Sunderland", "Nott'm Forest"),
])

# GW16
sat(16, "2026-12-19", [
    ("Bournemouth", "Coventry"),
    ("Arsenal", "Man Utd"),
    ("Brentford", "Newcastle"),
    ("Brighton", "Ipswich"),
    ("Chelsea", "Aston Villa"),
    ("Leeds", "Fulham"),
    ("Liverpool", "Spurs"),
    ("Man City", "Hull"),
    ("Nott'm Forest", "Everton"),
    ("Sunderland", "Crystal Palace"),
])

# GW17
sat(17, "2026-12-26", [
    ("Aston Villa", "Leeds"),
    ("Coventry", "Chelsea"),
    ("Crystal Palace", "Arsenal"),
    ("Everton", "Sunderland"),
    ("Fulham", "Brighton"),
    ("Hull", "Liverpool"),
    ("Ipswich", "Brentford"),
    ("Man Utd", "Nott'm Forest"),
    ("Newcastle", "Man City"),
    ("Spurs", "Bournemouth"),
])

# GW18
for h, a in [
    ("Aston Villa", "Liverpool"),
    ("Coventry", "Brentford"),
    ("Crystal Palace", "Bournemouth"),
    ("Everton", "Man City"),
    ("Fulham", "Arsenal"),
    ("Hull", "Leeds"),
    ("Ipswich", "Chelsea"),
    ("Man Utd", "Sunderland"),
    ("Newcastle", "Nott'm Forest"),
    ("Spurs", "Brighton"),
]:
    add(18, "2026-12-30", "20:00", h, a)

# GW19
sat(19, "2027-01-02", [
    ("Bournemouth", "Aston Villa"),
    ("Arsenal", "Ipswich"),
    ("Brentford", "Crystal Palace"),
    ("Brighton", "Man Utd"),
    ("Chelsea", "Newcastle"),
    ("Leeds", "Everton"),
    ("Liverpool", "Coventry"),
    ("Man City", "Spurs"),
    ("Nott'm Forest", "Fulham"),
    ("Sunderland", "Hull"),
])

# GW20
for h, a in [
    ("Arsenal", "Brentford"),
    ("Brighton", "Bournemouth"),
    ("Crystal Palace", "Chelsea"),
    ("Everton", "Aston Villa"),
    ("Fulham", "Spurs"),
    ("Ipswich", "Coventry"),
    ("Leeds", "Man City"),
    ("Man Utd", "Newcastle"),
    ("Nott'm Forest", "Hull"),
    ("Sunderland", "Liverpool"),
]:
    add(20, "2027-01-06", "20:00", h, a)

# GW21
sat(21, "2027-01-16", [
    ("Bournemouth", "Ipswich"),
    ("Aston Villa", "Man Utd"),
    ("Brentford", "Brighton"),
    ("Chelsea", "Sunderland"),
    ("Coventry", "Everton"),
    ("Hull", "Arsenal"),
    ("Liverpool", "Crystal Palace"),
    ("Man City", "Nott'm Forest"),
    ("Newcastle", "Fulham"),
    ("Spurs", "Leeds"),
])

# GW22
sat(22, "2027-01-23", [
    ("Arsenal", "Newcastle"),
    ("Brighton", "Man City"),
    ("Crystal Palace", "Spurs"),
    ("Everton", "Brentford"),
    ("Fulham", "Aston Villa"),
    ("Ipswich", "Hull"),
    ("Leeds", "Chelsea"),
    ("Man Utd", "Liverpool"),
    ("Nott'm Forest", "Bournemouth"),
    ("Sunderland", "Coventry"),
])

# GW23
sat(23, "2027-01-30", [
    ("Bournemouth", "Fulham"),
    ("Aston Villa", "Ipswich"),
    ("Brentford", "Man Utd"),
    ("Chelsea", "Nott'm Forest"),
    ("Coventry", "Leeds"),
    ("Hull", "Crystal Palace"),
    ("Liverpool", "Everton"),
    ("Man City", "Arsenal"),
    ("Newcastle", "Brighton"),
    ("Spurs", "Sunderland"),
])

# GW24
sat(24, "2027-02-06", [
    ("Arsenal", "Liverpool"),
    ("Brighton", "Hull"),
    ("Crystal Palace", "Coventry"),
    ("Everton", "Newcastle"),
    ("Fulham", "Man City"),
    ("Ipswich", "Spurs"),
    ("Leeds", "Bournemouth"),
    ("Man Utd", "Chelsea"),
    ("Nott'm Forest", "Brentford"),
    ("Sunderland", "Aston Villa"),
])

# GW25
for h, a in [
    ("Aston Villa", "Bournemouth"),
    ("Coventry", "Liverpool"),
    ("Crystal Palace", "Brentford"),
    ("Everton", "Leeds"),
    ("Fulham", "Nott'm Forest"),
    ("Hull", "Sunderland"),
    ("Ipswich", "Arsenal"),
    ("Man Utd", "Brighton"),
    ("Newcastle", "Chelsea"),
    ("Spurs", "Man City"),
]:
    add(25, "2027-02-10", "20:00", h, a)

# GW26
sat(26, "2027-02-20", [
    ("Bournemouth", "Crystal Palace"),
    ("Arsenal", "Fulham"),
    ("Brentford", "Coventry"),
    ("Brighton", "Spurs"),
    ("Chelsea", "Ipswich"),
    ("Leeds", "Aston Villa"),
    ("Liverpool", "Hull"),
    ("Man City", "Newcastle"),
    ("Nott'm Forest", "Man Utd"),
    ("Sunderland", "Everton"),
])

# GW27
sat(27, "2027-02-27", [
    ("Aston Villa", "Chelsea"),
    ("Coventry", "Bournemouth"),
    ("Crystal Palace", "Sunderland"),
    ("Everton", "Nott'm Forest"),
    ("Fulham", "Leeds"),
    ("Hull", "Man City"),
    ("Ipswich", "Brighton"),
    ("Man Utd", "Arsenal"),
    ("Newcastle", "Brentford"),
    ("Spurs", "Liverpool"),
])

# GW28
for h, a in [
    ("Bournemouth", "Spurs"),
    ("Arsenal", "Crystal Palace"),
    ("Brentford", "Ipswich"),
    ("Brighton", "Fulham"),
    ("Chelsea", "Coventry"),
    ("Leeds", "Hull"),
    ("Liverpool", "Aston Villa"),
    ("Man City", "Everton"),
    ("Nott'm Forest", "Newcastle"),
    ("Sunderland", "Man Utd"),
]:
    add(28, "2027-03-03", "20:00", h, a)

# GW29
sat(29, "2027-03-13", [
    ("Bournemouth", "Newcastle"),
    ("Aston Villa", "Hull"),
    ("Chelsea", "Arsenal"),
    ("Coventry", "Man City"),
    ("Crystal Palace", "Fulham"),
    ("Leeds", "Brighton"),
    ("Liverpool", "Ipswich"),
    ("Man Utd", "Everton"),
    ("Sunderland", "Brentford"),
    ("Spurs", "Nott'm Forest"),
])

# GW30
sat(30, "2027-03-20", [
    ("Arsenal", "Sunderland"),
    ("Brentford", "Bournemouth"),
    ("Brighton", "Coventry"),
    ("Everton", "Spurs"),
    ("Fulham", "Liverpool"),
    ("Hull", "Chelsea"),
    ("Ipswich", "Crystal Palace"),
    ("Man City", "Man Utd"),
    ("Newcastle", "Leeds"),
    ("Nott'm Forest", "Aston Villa"),
])

# GW31
sat(31, "2027-04-10", [
    ("Bournemouth", "Man City"),
    ("Aston Villa", "Brighton"),
    ("Chelsea", "Fulham"),
    ("Coventry", "Arsenal"),
    ("Crystal Palace", "Everton"),
    ("Leeds", "Nott'm Forest"),
    ("Liverpool", "Newcastle"),
    ("Man Utd", "Hull"),
    ("Sunderland", "Ipswich"),
    ("Spurs", "Brentford"),
])

# GW32
sat(32, "2027-04-17", [
    ("Arsenal", "Aston Villa"),
    ("Brentford", "Leeds"),
    ("Brighton", "Chelsea"),
    ("Everton", "Bournemouth"),
    ("Fulham", "Sunderland"),
    ("Hull", "Coventry"),
    ("Ipswich", "Man Utd"),
    ("Man City", "Crystal Palace"),
    ("Newcastle", "Spurs"),
    ("Nott'm Forest", "Liverpool"),
])

# GW33
sat(33, "2027-04-24", [
    ("Bournemouth", "Arsenal"),
    ("Aston Villa", "Coventry"),
    ("Brentford", "Fulham"),
    ("Chelsea", "Man City"),
    ("Everton", "Brighton"),
    ("Leeds", "Liverpool"),
    ("Man Utd", "Crystal Palace"),
    ("Newcastle", "Ipswich"),
    ("Nott'm Forest", "Sunderland"),
    ("Spurs", "Hull"),
])

# GW34
sat(34, "2027-05-01", [
    ("Arsenal", "Spurs"),
    ("Brighton", "Nott'm Forest"),
    ("Coventry", "Man Utd"),
    ("Crystal Palace", "Aston Villa"),
    ("Fulham", "Everton"),
    ("Hull", "Bournemouth"),
    ("Ipswich", "Leeds"),
    ("Liverpool", "Chelsea"),
    ("Man City", "Brentford"),
    ("Sunderland", "Newcastle"),
])

# GW35
sat(35, "2027-05-08", [
    ("Bournemouth", "Man Utd"),
    ("Brentford", "Aston Villa"),
    ("Brighton", "Sunderland"),
    ("Everton", "Hull"),
    ("Fulham", "Ipswich"),
    ("Leeds", "Arsenal"),
    ("Man City", "Liverpool"),
    ("Newcastle", "Coventry"),
    ("Nott'm Forest", "Crystal Palace"),
    ("Spurs", "Chelsea"),
])

# GW36
sat(36, "2027-05-15", [
    ("Arsenal", "Nott'm Forest"),
    ("Aston Villa", "Newcastle"),
    ("Chelsea", "Everton"),
    ("Coventry", "Spurs"),
    ("Crystal Palace", "Brighton"),
    ("Hull", "Fulham"),
    ("Ipswich", "Man City"),
    ("Liverpool", "Brentford"),
    ("Man Utd", "Leeds"),
    ("Sunderland", "Bournemouth"),
])

# GW37
sat(37, "2027-05-23", [
    ("Bournemouth", "Chelsea"),
    ("Brentford", "Hull"),
    ("Brighton", "Liverpool"),
    ("Everton", "Arsenal"),
    ("Fulham", "Coventry"),
    ("Leeds", "Sunderland"),
    ("Man City", "Aston Villa"),
    ("Newcastle", "Crystal Palace"),
    ("Nott'm Forest", "Ipswich"),
    ("Spurs", "Man Utd"),
])

# GW38
sat(38, "2027-05-30", [
    ("Arsenal", "Brighton"),
    ("Aston Villa", "Spurs"),
    ("Chelsea", "Brentford"),
    ("Coventry", "Nott'm Forest"),
    ("Crystal Palace", "Leeds"),
    ("Hull", "Newcastle"),
    ("Ipswich", "Everton"),
    ("Liverpool", "Bournemouth"),
    ("Man Utd", "Fulham"),
    ("Sunderland", "Man City"),
])

from collections import Counter

assert len(M) == 380, len(M)
gws = Counter(g for g, *_ in M)
assert all(gws[g] == 10 for g in range(1, 39)), dict(gws)
homes = Counter(h for *_, h, a in M)
aways = Counter(a for *_, h, a in M)
teams = set(homes) | set(aways)
assert len(teams) == 20, teams
for t in teams:
    assert homes[t] == 19 and aways[t] == 19, (t, homes[t], aways[t])

print("OK", len(M), "matches", len(teams), "teams")
for row in M:
    print("|".join(str(x) for x in row))
