# Demand-weighted complement to Q4: of REAL answered searches, how many still get a price
# after both changes. Read-only, inside the prod container.
import sqlite3, sys, json
sys.path.insert(0, "/app")
from engine.listing_identity import match_verdict_signal, publishable_opportunity
con = sqlite3.connect("file:/app/data/demand_intel.db?mode=ro", uri=True, timeout=120)
con.row_factory = sqlite3.Row

raw = con.execute("SELECT * FROM model_signals ORDER BY COALESCE(opportunity_score,0) DESC, sold_7d DESC").fetchall()
board = [dict(r) for r in raw]
board = [d for d in board if publishable_opportunity(d)]

# after-arm comparable_n comes from the joint measurement, keyed by (brand,model)
AFTER_JSON = r"""{"Adidas\u001fCampus": 11, "Adidas\u001fCampus 00s": 21, "Adidas\u001fForum Low": 3, "Adidas\u001fGazelle": 13, "Adidas\u001fHandball Spezial": 9, "Adidas\u001fPredator": 6, "Adidas\u001fSamba": 36, "Adidas\u001fSamba OG": 9, "Adidas\u001fSpezial": 7, "Adidas\u001fStan Smith": 5, "Adidas\u001fSuperstar": 10, "Balenciaga\u001fArena": 25, "Balenciaga\u001fCity Bag": 23, "Balenciaga\u001fDefender": 4, "Balenciaga\u001fHourglass": 8, "Balenciaga\u001fLe Cagole": 10, "Balenciaga\u001fRunner": 41, "Balenciaga\u001fSpeed Trainer": 25, "Balenciaga\u001fTrack": 82, "Balenciaga\u001fTriple S": 30, "Carhartt\u001fActive Jacket": 6, "Carhartt\u001fDetroit Jacket": 6, "Carhartt\u001fDouble Knee": 19, "Diesel\u001fBelther": 4, "Diesel\u001fKrooley": 4, "Diesel\u001fLarkee": 13, "Diesel\u001fSafado": 8, "Fred Perry\u001fHarrington": 12, "Fred Perry\u001fLaurel Wreath": 7, "Fred Perry\u001fM3600": 4, "Fred Perry\u001fTwin Tipped": 20, "Gucci\u001fAce": 13, "Gucci\u001fBamboo": 14, "Gucci\u001fDionysus": 7, "Gucci\u001fGG Marmont": 8, "Gucci\u001fHorsebit": 20, "Gucci\u001fJackie": 12, "Gucci\u001fOphidia": 14, "Gucci\u001fRhyton": 9, "Gucci\u001fSoho Disco": 3, "Jordan\u001fJordan 1": 6, "Jordan\u001fJordan 1 Low": 3, "Jordan\u001fJordan 1 Mid": 8, "Jordan\u001fJordan 3": 6, "Jordan\u001fJordan 4": 10, "Levi's\u001f501": 10, "Levi's\u001f501 Original": 3, "Levi's\u001f512": 10, "Levi's\u001fEngineered": 3, "Levi's\u001fTrucker": 5, "New Balance\u001f1906R": 10, "New Balance\u001f2002R": 14, "New Balance\u001f327": 9, "New Balance\u001f530": 176, "New Balance\u001f550": 9, "New Balance\u001f574": 9, "New Balance\u001f740": 9, "New Balance\u001f9060": 59, "Nike\u001fAir Force 1": 10, "Nike\u001fAir Force 1 Low": 11, "Nike\u001fAir Force 1 Mid": 6, "Nike\u001fAir Max 1": 10, "Nike\u001fAir Max 90": 4, "Nike\u001fAir Max 95": 7, "Nike\u001fBlazer Mid": 4, "Nike\u001fCortez": 3, "Nike\u001fDunk": 11, "Nike\u001fDunk Low": 13, "Nike\u001fDunk Low SB": 6, "Nike\u001fTech Fleece": 14, "Nike\u001fVapormax": 4, "Off-White\u001fArrows": 32, "Off-White\u001fCaravaggio": 3, "Off-White\u001fOut Of Office": 4, "Patagonia\u001fBaggies": 7, "Patagonia\u001fBetter Sweater": 30, "Patagonia\u001fBlack Hole": 25, "Patagonia\u001fCapilene": 19, "Patagonia\u001fHoudini": 5, "Patagonia\u001fNano Puff": 11, "Patagonia\u001fR1": 11, "Patagonia\u001fRefugio": 26, "Patagonia\u001fRetro-X": 15, "Patagonia\u001fSnap-T": 9, "Patagonia\u001fSynchilla": 27, "Patagonia\u001fTorrentshell": 11, "Puma\u001fSpeedcat": 20, "Puma\u001fSpeedcat OG": 5, "Ralph Lauren\u001fBig Pony": 3, "Ralph Lauren\u001fClassic Fit": 9, "Reebok\u001fClub C": 8, "Reebok\u001fInstapump Fury": 3, "Stone Island\u001fCompass Badge": 14, "Stone Island\u001fGarment Dyed": 8, "Stone Island\u001fGhost": 16, "Stone Island\u001fMarina": 7, "Stone Island\u001fPoly": 4, "Supreme\u001f6-Panel Cap": 4, "Supreme\u001fBox Logo": 11, "The North Face\u001fNuptse": 5}"""

SQL = """SELECT COALESCE(q_norm, query) AS q, verdict, created_at FROM verdict_logs
          WHERE verdict IS NOT NULL AND verdict NOT IN ('LIMIT_REACHED','PENDING')"""
def tally(rows, nmap):
    band = thin = nomatch = 0; ns = []
    for r in rows:
        q = (r["q"] or "").strip()
        if not q:
            nomatch += 1; continue
        try:
            hit, _ = match_verdict_signal(q, board)
        except Exception:
            hit = None
        if not hit:
            nomatch += 1; continue
        k = (hit.get("brand"), hit.get("model"))
        n = nmap.get("%s\x1f%s" % k)
        if n is None:
            n = hit.get("comparable_n")
        if n is not None and int(n) >= 8:
            band += 1; ns.append(int(n))
        else: thin += 1
    ns.sort()
    p50 = (ns[len(ns)//2] if len(ns)%2 else (ns[len(ns)//2-1]+ns[len(ns)//2])/2) if ns else None
    return {"band": band, "thin": thin, "nomatch": nomatch, "n": len(rows), "band_evidence_p50": p50}

all_rows = con.execute(SQL).fetchall()
w7 = con.execute(SQL + " AND created_at >= datetime('now','-7 days')").fetchall()
stored = {"%s\x1f%s" % (d.get("brand"), d.get("model")): d.get("comparable_n") for d in board}
after = json.loads(AFTER_JSON)
print(json.dumps({
  "history_range": [con.execute("SELECT MIN(created_at),MAX(created_at) FROM verdict_logs").fetchone()[0],
                    con.execute("SELECT MAX(created_at) FROM verdict_logs").fetchone()[0]],
  "board_rows_publishable": len(board),
  "all_time_answered": {"BEFORE_stored": tally(all_rows, stored), "AFTER_a13": tally(all_rows, after)},
  "last_7d_answered":   {"BEFORE_stored": tally(w7, stored),      "AFTER_a13": tally(w7, after)},
}, indent=1))
