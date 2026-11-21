"""Research helper: render field_transforms.md tables from scratch_trans.json (output of build_spec.py)."""
import json, re
OUT = '/home/antigravity/pokefield/research/'
d = json.load(open(OUT + 'scratch_trans.json'))

NAMES = [("Burning Field", 'burning'), ("Volcanic Top", 'volcanictop'), ("Volcanic field", 'burning'), ("Volcanic Field", 'burning'),
         ("volcanic field", 'burning'), ("Corrosive Mist", 'corrosivemist'), ("Corrosive Field", 'corrosive'), ("Crystal Cavern", 'crystalcavern'),
         ("Dark Crystal", 'darkcrystalcavern'), ("Short-Circuit", 'shortcircuit'), ("Factory Field", 'factory'), ("Underwater", 'underwater'),
         ("Murkwater", 'murkwatersurface'), ("Water Surface", 'watersurface'), ("Icy Field", 'icy'), ("icy field", 'icy'), ("Snowy Mountain", 'snowymountain'),
         ("Mountain", 'mountain'), ("Starlight Arena", 'starlight'), ("Grassy Terrain", 'grassyterrain'), ("Misty Terrain", 'mistyterrain'),
         ("Haunted Field", 'haunted'), ("Blessed Field", 'holy'), ("Sky field", 'sky'), ("Angie's Field", 'frozendimensional'),
         ("dimensional field", 'dimensional'), ("normal cave", 'cave'), ("Dragons Den", 'dragonsden'), ("Forest Field", 'forest'),
         ("Cave", 'cave'), ("Corrupted Cave", 'corruptedcave')]
SKIP = re.compile(r"(type becomes|Weather Ball|Refrigerate|Spikes|weather is terminated|Hail is terminated)", re.I)

def target(cid, txt):
    if re.match(r'\s*Created by', txt): return cid
    if re.search(r'^(Destroyed|Terminated)', txt.strip()): return 'none (revert)'
    if re.search(r'Stage', txt): return f'{re.sub(r"[0-9]+$", "", cid)} (stage change)'
    m = re.search(r'(Becomes|into|to) (.*)', txt)
    seg = m.group(2) if m else txt
    best = None
    for n, i in NAMES:
        p = seg.find(n)
        if p >= 0 and (best is None or p < best[0] or (p == best[0] and len(n) > best[2])): best = (p, i, len(n))
    return best[1] if best else '?'

o = open(OUT + 'field_transforms.md', 'w')
o.write(open(OUT + 'tools/transforms_header.md').read())
o.write('\n## A. Data-driven move transitions (from game field tables)\n\n')
o.write('Each row: when one of the trigger moves is used (successfully, unless noted) on `from_field`, the field becomes `to_field`. '
        '`none` = field removed (Reborn `FIELDCHANGE 0`; engine then restores the backup/base field if one exists). '
        'Conditions are raw engine expressions (see legend in header). Rows identical across games are merged.\n\n')
o.write('| from_field | trigger moves | to_field | notes (games; condition) |\n|---|---|---|---|\n')
merged = {}
for frm, mv, to, notes in d['data']:
    parts = notes.split('; ', 1)
    g, cond = parts[0], (parts[1] if len(parts) > 1 else '')
    merged.setdefault((frm, mv, to, cond), []).append(g)
for (frm, mv, to, cond), gs in merged.items():
    o.write(f"| `{frm}` | {mv} | `{to}` | {', '.join(gs)}{'; ' + cond if cond else ''} |\n")
o.write('\n## B. Hardcoded / manual-described transitions (creation, weather, counters, stages)\n\n')
o.write('Extracted from in-game Field Manual text (Reborn E19 `PBFieldNotes.rb`, Desolation Ep6 `FieldNoteCompiler.rb`) and the Rejuvenation v11 '
        'manual (older; v13 data in table A supersedes where they conflict). `to_field` is a best-effort parse of the text.\n\n')
o.write('| from_field | trigger (manual text) | to_field | notes |\n|---|---|---|---|\n')
seen = set()
for cid, g, txt in d['manual']:
    txt = txt.replace('\\n', ' ').replace('|', '/').strip()
    if SKIP.search(txt): continue
    key = (cid.rstrip('0123456789'), txt)
    frm = 'any' if txt.startswith('Created by') else cid
    if key in seen:
        continue
    seen.add(key)
    games = [gg for (c, gg, t) in d['manual'] if c.rstrip('0123456789') == cid.rstrip('0123456789') and t.replace('\\n', ' ').replace('|', '/').strip() == txt]
    o.write(f"| `{frm}` | {txt} | `{target(cid, txt)}` | {', '.join(dict.fromkeys(games))} |\n")
extra = open(OUT + 'tools/transforms_extra.md').read() if __import__('os').path.exists(OUT + 'tools/transforms_extra.md') else ''
o.write(extra)
o.close()
print('rows A', len(merged), 'rows B', len(seen))
