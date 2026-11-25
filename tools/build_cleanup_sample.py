"""Builds the spreadsheet-cleanup practice sample (data-cleanup.html + CSV downloads).

All records are invented sample data (example.com emails, 555 numbers).
The cleanup rules below run on the messy file, so every count on the page
comes from this script, not from hand-typed numbers.
Run from the site root:  python3 tools/build_cleanup_sample.py
"""
import csv, html, re
from datetime import datetime

E = html.escape

# ---- 1. Messy "before" data (invented) ----
RAW = [
    # name, email, phone, company, signup date, status
    ("  maria santos", "Maria.Santos@Example.com ", "0917 555 0101", "Bloom Bakery", "03/02/2026", "active"),
    ("JOHN REYES", "john.reyes@example.com", "+63-917-555-0102", "reyes print shop", "2026-02-14", "Active"),
    ("Ana Cruz", "ana.cruz@example", "09175550103", "Cruz Consulting", "Feb 20, 2026", "ACTIVE"),
    ("Maria Santos", "maria.santos@example.com", "(0917) 555-0101", "Bloom Bakery", "2026-03-02", "active"),
    ("leo  garcia", "", "0917-555-0104", "Garcia Hardware", "2026/03/05", "inactive"),
    ("Grace Lim", "grace.lim@example.com", "917 555 0105", "lim & co", "5 Mar 2026", "Pending"),
    ("Paolo Mendoza", "PAOLO.MENDOZA@EXAMPLE.COM", "09175550106", "Mendoza Farms", "2026-03-09", "active "),
    ("Ella Tan", "ella.tan@example.com", "0917 555 0107", "  Tan Travel", "03/12/2026", "inactive"),
    ("john reyes", "John.Reyes@example.com", "0917-555-0102", "Reyes Print Shop", "02/14/2026", "active"),
    ("Mark Villanueva", "mark.v@example.com", "", "Villanueva Auto", "2026-03-15", "pending"),
    ("Joy Navarro", "joy.navarro@example.com", "0917 555 0109", "navarro events", "Mar 18, 2026", "Active"),
    ("Carlo Bautista", "carlo.bautista@example.com", "+639175550110", "Bautista Builders", "2026-03-20", "actve"),
]
COLS = ["Name", "Email", "Phone", "Company", "Signup date", "Status"]

# ---- 2. Cleanup rules ----
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$")
SMALL = {"&", "and", "of"}
STATUS = {"active": "Active", "actve": "Active", "inactive": "Inactive", "pending": "Pending"}
DATE_FORMATS = ["%m/%d/%Y", "%Y-%m-%d", "%b %d, %Y", "%Y/%m/%d", "%d %b %Y"]


def title(s):
    words = re.sub(r"\s+", " ", s.strip()).split(" ")
    return " ".join(w.lower() if (i and w.lower() in SMALL) else w[:1].upper() + w[1:].lower() for i, w in enumerate(words))


def phone(s):
    digits = re.sub(r"\D", "", s)
    if digits.startswith("63"):
        digits = "0" + digits[2:]
    if len(digits) == 10 and digits.startswith("9"):
        digits = "0" + digits
    if len(digits) != 11:
        return ""
    return f"+63 {digits[1:4]} {digits[4:7]} {digits[7:]}"


def date(s):
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(s.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return ""


clean, log, seen = [], [], {}
counts = {"fixes": 0, "duplicate": 0, "needs review": 0}
REASON = {"Name": "Trimmed spaces, fixed capitals", "Email": "Trimmed, lowercased",
          "Phone": "One phone format", "Company": "Trimmed spaces, fixed capitals",
          "Signup date": "One date format (YYYY-MM-DD)", "Status": "Consistent status values"}
for i, raw in enumerate(RAW, start=2):  # row 1 = header
    n, em, ph, co, dt, stt = raw
    row = {
        "Name": title(n),
        "Email": em.strip().lower(),
        "Phone": phone(ph) if ph.strip() else "",
        "Company": title(co),
        "Signup date": date(dt),
        "Status": STATUS.get(stt.strip().lower(), stt.strip()),
    }
    key = row["Email"] or row["Name"].lower()
    if key in seen:
        counts["duplicate"] += 1
        log.append((i, row["Name"], "Whole row", f"Duplicate of row {seen[key]}", "Removed", "Same email as an earlier row"))
        continue
    seen[key] = i
    for col, before in zip(COLS, raw):
        if row[col] != before and before.strip():
            counts["fixes"] += 1
            reason = "Fixed typo" if col == "Status" and before.strip().lower() == "actve" else REASON[col]
            log.append((i, row["Name"], col, before, row[col], reason))
    notes = []
    if not row["Email"]:
        notes.append("Missing email")
    elif not EMAIL_RE.match(row["Email"]):
        notes.append("Email looks incomplete")
    if not row["Phone"]:
        notes.append("Missing phone")
    row["Notes"] = "; ".join(notes)
    if notes:
        counts["needs review"] += 1
        log.append((i, row["Name"], "Notes", "", row["Notes"], "Flagged for client to confirm (not guessed)"))
    clean.append(row)

# ---- 3. Write downloads ----
with open("downloads--contacts-before.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(COLS); w.writerows(RAW)
with open("downloads--contacts-after.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=COLS + ["Notes"]); w.writeheader(); w.writerows(clean)
with open("downloads--contacts-change-log.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["Original row", "Contact", "Field", "Before", "After", "Reason"]); w.writerows(log)


# ---- 4. Page ----
def table(rows, cols, flag=None):
    head = "".join(f"<th>{E(c)}</th>" for c in cols)
    body = []
    for r in rows:
        vals = r if isinstance(r, (list, tuple)) else [r[c] for c in cols]
        cls = ' class="flag"' if flag and flag(r) else ""
        body.append(f"<tr{cls}>" + "".join(f"<td>{E(str(v)) if str(v).strip() else '<span class=empty>(blank)</span>'}</td>" for v in vals) + "</tr>")
    return f'<div class="table-scroll" tabindex="0" role="region"><table class="data"><thead><tr>{head}</tr></thead><tbody>{"".join(body)}</tbody></table></div>'


before_tbl = table(RAW, COLS)
after_tbl = table(clean, COLS + ["Notes"], flag=lambda r: r["Notes"])
fixes = counts["fixes"]

page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Spreadsheet cleanup practice | Joseph Berin</title><meta name="description" content="A practice data-cleanup project: a messy contact list cleaned, de-duplicated, and flagged for review, with a full change log."><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="research.css?v=6"></head><body class="research-page"><header class="research-nav"><a class="research-brand" href="index.html" aria-label="Joseph Berin, home"><span class="brand-mark">JB</span><span class="brand-name">Joseph Berin</span></a><a href="index.html#work">← All projects</a><a href="index.html#contact">Discuss a project ↗</a></header><main>
<div class="case-intro"><p class="case-kicker">Practice project / Admin &amp; data cleanup</p><h1>A messy contact list,<br>made ready to use.</h1><p class="case-lead">A practice spreadsheet with the problems I often see in real lists: extra spaces, mixed capitals, five date formats, inconsistent phone numbers, typos, and duplicates. Cleaned, checked, and handed back with a change log.</p><div class="case-meta"><span>Joseph Berin</span><span>November 2026</span><span>Practice project · sample data</span></div></div>
<section class="case-block"><div class="section-line"><span>01 / The result</span><h2>{len(RAW)} rows in. {len(clean)} clean contacts out.</h2></div>
<div class="metric-row"><div><strong>{fixes}</strong><span>formatting fixes</span></div><div><strong>{counts["duplicate"]}</strong><span>duplicates removed</span></div><div><strong>{counts["needs review"]}</strong><span>contacts flagged for review</span></div><div><strong>{len(log)}</strong><span>entries in the change log</span></div></div>
<div class="deliverable-bar"><a class="case-button" href="downloads--contacts-after.csv" download>Download clean list ↓</a><a href="downloads--contacts-before.csv" download>Original file ↓</a><a href="downloads--contacts-change-log.csv" download>Change log ↓</a></div>
<p class="caption">All names, emails, and numbers are invented for practice. Emails use example.com and phone numbers use 555.</p></section>
<section class="case-block" id="compare"><div class="section-line"><span>02 / Before &amp; after</span><h2>See every change.</h2></div>
<div class="tabs" role="tablist" aria-label="Choose a version"><button role="tab" id="tab-before" aria-controls="panel-before" aria-selected="false" tabindex="-1">Before</button><button role="tab" id="tab-after" aria-controls="panel-after" aria-selected="true">After</button></div>
<div id="panel-before" role="tabpanel" aria-labelledby="tab-before" hidden>{before_tbl}</div>
<div id="panel-after" role="tabpanel" aria-labelledby="tab-after">{after_tbl}<p class="caption">Highlighted rows have a note for the client to confirm.</p></div></section>
<section class="case-block"><div class="section-line"><span>03 / The rules I followed</span><h2>Fix what is clear. Ask about what is not.</h2></div><div class="note-grid">
<article><h3>Standardize</h3><p>Trim extra spaces. Use proper capitals for names and companies. Lowercase emails. One phone format (+63 917 555 0101) and one date format (YYYY-MM-DD).</p></article>
<article><h3>De-duplicate</h3><p>Two rows with the same email are the same contact. Keep the first, remove the repeat, and record it in the change log.</p></article>
<article><h3>Never guess</h3><p>A missing email or an incomplete address like "ana.cruz@example" is flagged, not invented. The client decides what the right value is.</p></article>
</div></section>
<section class="case-block"><div class="section-line"><span>04 / The handoff</span><h2>What the client receives.</h2></div><p>The clean file, the untouched original, and a change log that lists every edited field, removed duplicate, and flagged contact with a reason. Nothing is deleted without a record, so any change can be checked or undone.</p></section>
</main><footer><span>Joseph Berin · Virtual Assistant · Iloilo City, Philippines</span><a href="index.html#contact">Let’s talk →</a></footer>
<script>
(() => {{
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const show = (t) => tabs.forEach(b => {{
    const on = b === t;
    b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
    document.getElementById(b.getAttribute('aria-controls')).hidden = !on;
  }});
  tabs.forEach((t, i) => {{
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', e => {{
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {{
        const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        show(n); n.focus();
      }}
    }});
  }});
}})();
</script>
</body></html>'''
open("data-cleanup.html", "w").write(page)
print("rows", len(RAW), "clean", len(clean), "fixes", fixes, counts, "log", len(log))
