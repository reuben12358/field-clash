"""Research helper: build per-field spec body + transform table from parsed game scripts."""
import json, re, sys
sys.path.insert(0, '/home/antigravity/pokefield/research/tools')
import render as R
from render import nm, lst, notes, Ctx, split_calls, split_args, digest_old, digest_new

R.ICON['fieldPlus'] = '+'; R.ICON['fieldplus'] = '+'
OUT = '/home/antigravity/pokefield/research/'
RAW = OUT + 'raw/'

REB = {'ELECTRICT': 'electricterrain', 'GRASSYT': 'grassyterrain', 'MISTYT': 'mistyterrain', 'DARKCRYSTALC': 'darkcrystalcavern',
       'CHESSB': 'chessboard', 'BIGTOPA': 'bigtop', 'BURNINGF': 'burning', 'SWAMPF': 'swamp', 'RAINBOWF': 'rainbow',
       'CORROSIVEF': 'corrosive', 'CORROSIVEMISTF': 'corrosivemist', 'DESERTF': 'desert', 'ICYF': 'icy', 'ROCKYF': 'rocky',
       'FORESTF': 'forest', 'SUPERHEATEDF': 'superheated', 'FACTORYF': 'factory', 'SHORTCIRCUITF': 'shortcircuit',
       'WASTELAND': 'wasteland', 'ASHENB': 'ashenbeach', 'WATERS': 'watersurface', 'UNDERWATER': 'underwater', 'CAVE': 'cave',
       'GLITCHF': 'glitch', 'CRYSTALC': 'crystalcavern', 'MURKWATERS': 'murkwatersurface', 'MOUNTAIN': 'mountain',
       'SNOWYM': 'snowymountain', 'HOLYF': 'holy', 'MIRRORA': 'mirror', 'FAIRYTALEF': 'fairytale', 'DRAGONSD': 'dragonsden',
       'FLOWERGARDENF': 'flowergarden', 'STARLIGHTA': 'starlight', 'NEWW': 'newworld', 'INVERSEF': 'inverse',
       'PSYCHICT': 'psychicterrain', '0': 'none', 'NONE': 'none'}
NEW = {'ELECTERRAIN': 'electricterrain', 'GRASSY': 'grassyterrain', 'MISTY': 'mistyterrain', 'DARKCRYSTALCAVERN': 'darkcrystalcavern',
       'CHESS': 'chessboard', 'BIGTOP': 'bigtop', 'VOLCANIC': 'burning', 'BURNING': 'burning', 'SWAMP': 'swamp', 'RAINBOW': 'rainbow',
       'CORROSIVE': 'corrosive', 'CORROSIVEMIST': 'corrosivemist', 'DESERT': 'desert', 'ICY': 'icy', 'ROCKY': 'rocky',
       'FOREST': 'forest', 'VOLCANICTOP': 'volcanictop', 'SUPERHEATED': 'superheated', 'FACTORY': 'factory',
       'SHORTCIRCUIT': 'shortcircuit', 'WASTELAND': 'wasteland', 'ASHENBEACH': 'ashenbeach', 'WATERSURFACE': 'watersurface',
       'UNDERWATER': 'underwater', 'CAVE': 'cave', 'GLITCH': 'glitch', 'CRYSTALCAVERN': 'crystalcavern',
       'MURKWATERSURFACE': 'murkwatersurface', 'MOUNTAIN': 'mountain', 'SNOWYMOUNTAIN': 'snowymountain', 'HOLY': 'holy',
       'MIRROR': 'mirror', 'FAIRYTALE': 'fairytale', 'DRAGONSDEN': 'dragonsden', 'STARLIGHT': 'starlight', 'NEWWORLD': 'newworld',
       'INVERSE': 'inverse', 'PSYTERRAIN': 'psychicterrain', 'DIMENSIONAL': 'dimensional', 'FROZENDIMENSION': 'frozendimensional',
       'HAUNTED': 'haunted', 'CORRUPTED': 'corruptedcave', 'BEWITCHED': 'bewitchedwoods', 'SKY': 'sky', 'COLOSSEUM': 'colosseum',
       'INFERNAL': 'infernal', 'DEEPEARTH': 'deepearth', 'BACKALLEY': 'backalley', 'CITY': 'city', 'CLOUDS': 'cloud',
       'CROWD': 'crowd', 'DANCEFLOOR': 'dancefloor', 'INDOOR': 'none', 'NONE': 'none'}

def canon_new(k):
    k = str(k).lstrip(':')
    for base, cid in [('FLOWERGARDEN', 'flowergarden'), ('CONCERT', 'concertvenue'), ('DARKNESS', 'darkness')]:
        if k.startswith(base) and k[len(base):].isdigit(): return f'{cid}{k[len(base):]}'
    return NEW.get(k, k.lower())

def base_id(cid):
    return re.sub(r'\d+$', '', cid)

# ---------- normalization for diffing ----------
def norm_old(f):
    n = {'name': f.get('FIELDNAME'), 'intro': f.get('INTROMESSAGE'), 'np': f.get('NATUREMOVES'), 'camo': f.get('MIMICRY'),
         'sp': f.get('SECRETPOWERANIM')}
    n['type'] = {t: float(m) for m, ts in (f.get('TYPEDAMAGEBOOST') or {}).items() for t in ts}
    n['move'] = {mv: float(m) for m, ms in (f.get('MOVEDAMAGEBOOST') or {}).items() for mv in ms}
    n['acc'] = {mv: a for a, ms in (f.get('MOVEACCURACYBOOST') or {}).items() for mv in ms}
    n['addtype'] = {mv: t for t, ms in (f.get('MOVETYPEMOD') or {}).items() for mv in ms}
    n['change'] = {mv: REB.get(str(to), str(to)) for to, ms in (f.get('FIELDCHANGE') or {}).items() for mv in ms}
    n['status'] = set(f.get('STATUSMOVEBOOST') or [])
    n['seed'] = (f.get('SEED'), json.dumps(f.get('SEEDSTATS'), sort_keys=True), f.get('SEEDEFFECT'), str(f.get('SEEDEFFECTVAL')))
    n['tcond'] = dict(f.get('TYPECONDITION') or {})
    return n

def norm_new(f):
    n = {'name': f.get('name'), 'intro': ' / '.join(x for x in (f.get('fieldMessage') or []) if x), 'np': f.get('naturePower'),
         'camo': f.get('mimicry'), 'sp': f.get('secretPower')}
    n['type'] = {t: float(m) for m, ts in (f.get('typeBoosts') or {}).items() for t in ts}
    n['move'] = {mv: float(m) for m, ms in (f.get('damageMods') or {}).items() for mv in ms}
    n['acc'] = {mv: a for a, ms in (f.get('accuracyMods') or {}).items() for mv in ms}
    n['addtype'] = {mv: t for t, ms in (f.get('typeMods') or {}).items() for mv in ms}
    n['change'] = {mv: canon_new(to) for to, ms in (f.get('fieldChange') or {}).items() for mv in ms}
    n['status'] = set(f.get('statusMods') or [])
    s = f.get('seed') or {}
    n['seed'] = (s.get('seedtype'), json.dumps(s.get('stats'), sort_keys=True), s.get('effect'), str(s.get('duration')))
    n['tcond'] = dict(f.get('typeCondition') or {})
    return n

def fmtm(m):
    return 'FAIL' if m == 0 else f'x{m:g}'

def diff(a, b):
    """a = Reborn baseline, b = other game. Returns bullet lines."""
    L = []
    for k, lab in [('name', 'Name'), ('intro', 'Intro'), ('np', 'Nature Power'), ('camo', 'Camouflage'), ('sp', 'Secret Power anim')]:
        if str(a[k]).strip().lower() != str(b[k]).strip().lower():
            L.append(f'{lab}: {nm(a[k])} → **{nm(b[k])}**')
    def mapdiff(key, lab, fv):
        A, B = a[key], b[key]
        chg = {}
        for x in sorted(A):
            if x in B and A[x] != B[x]: chg.setdefault((fv(A[x]), fv(B[x])), []).append(nm(x))
        ch = [f'{", ".join(xs)} {p[0]} ⇒ {p[1]}' for p, xs in chg.items()]
        add = {}
        for x in sorted(B):
            if x not in A: add.setdefault(fv(B[x]), []).append(nm(x))
        rem = [nm(x) for x in sorted(A) if x not in B]
        if ch: L.append(f'{lab} changed: ' + '; '.join(ch))
        for v, xs in add.items(): L.append(f'{lab} added {v}: ' + ', '.join(xs))
        if rem: L.append(f'{lab} removed (no longer modified): ' + ', '.join(rem))
    mapdiff('type', 'Type mods', fmtm)
    mapdiff('move', 'Move mods', fmtm)
    mapdiff('acc', 'Accuracy', lambda v: 'never-miss' if str(v) == '0' else str(v))
    mapdiff('addtype', 'Type addition', lambda v: '+' + str(v).capitalize())
    mapdiff('change', 'Field change', lambda v: '→' + v)
    if a['status'] != b['status']:
        ad, rm = b['status'] - a['status'], a['status'] - b['status']
        if ad: L.append('Status moves boosted, added: ' + lst(list(ad)))
        if rm: L.append('Status moves boosted, removed: ' + lst(list(rm)))
    if a['seed'] != b['seed']:
        L.append(f'Seed: {a["seed"]} → **{b["seed"]}**')
    if {k.upper(): v for k, v in a['tcond'].items()} != {k.upper(): v for k, v in b['tcond'].items()}:
        L.append(f'Type-boost conditions: {a["tcond"]} → **{b["tcond"]}**')
    return L

# ---------- manual filtering ----------
DROP = [r'^"', r'^Certain attacks', r'^Nature Power →', r'^Camouflage →', r'^Destroyed by these moves', r"'s Accuracy →",
        r'^[A-Z][a-z]+-type attacks [▲▼] x[\d.]+\.?$']
def fix(l):
    l = re.sub(r'\bwhen when\b', 'when', l)
    l = l.replace('+type', '+')
    l = re.sub(r'<c=[0-9a-fA-F]+>', '', l)
    return l
def filt(lines):
    out = []
    for l in lines:
        l = fix(l)
        if any(re.search(p, l) for p in DROP): continue
        out.append(l)
    return out

def chg_lines(f, newfmt):
    """Field change lines with readable target ids."""
    L = []
    if newfmt:
        for to, mv in (f.get('fieldChange') or {}).items():
            cond = (f.get('changeCondition') or {}).get(to)
            L.append((canon_new(to), lst(mv), cond))
    else:
        for to, mv in (f.get('FIELDCHANGE') or {}).items():
            cond = (f.get('CHANGECONDITION') or {}).get(to)
            L.append((REB.get(str(to), str(to)), lst(mv), cond))
    return L

def data_lines(f, newfmt):
    L = digest_new(f) if newfmt else digest_old(f)
    out = []
    for l in L:
        if l.startswith('CHANGE →'): continue
        out.append(fix(l))
    for to, mv, cond in chg_lines(f, newfmt):
        out.append(f'CHANGE → `{to}`: {mv}' + (f' (cond: `{cond}`)' if cond else ''))
    if newfmt and f.get('overlay'):
        ov = f['overlay']
        parts = []
        for m, ts in (ov.get('typeBoosts') or {}).items(): parts.append(f"types x{m}: {lst([t.capitalize() for t in ts])}")
        for m, ms in (ov.get('damageMods') or {}).items(): parts.append(f"moves x{m}: {lst(ms)}")
        for t, ms in (ov.get('typeMods') or {}).items(): parts.append(f"+{t.capitalize()}: {lst(ms)}")
        if ov.get('typeCondition'): parts.append('cond ' + json.dumps(ov['typeCondition']))
        if ov.get('statusMods'): parts.append('status: ' + lst(ov['statusMods']))
        if parts: out.append('Overlay (effects when this terrain is laid ON TOP of another field): ' + '; '.join(parts))
    return out

if __name__ == '__main__':
    reb = json.load(open(OUT + 'reborn_fields.json'))
    rc = json.load(open(OUT + 'reborn_consts.json'))
    idname = {int(k): v for k, v in rc['idname'].items()}
    rnotes = notes(RAW + 'reborn_patch/Scripts/PBFieldNotes.rb', Ctx(reb, rc['consts'], 'old'))
    rej = json.load(open(OUT + 'rejuv_fields.json'))
    deso = json.load(open(OUT + 'deso_fields.json'))
    dsrc = open(RAW + 'deso_patch/Scripts/Pokemon Desolation/FieldNoteCompiler.rb', encoding='utf-8', errors='replace').read()
    dnotes = notes(RAW + 'deso_patch/Scripts/Pokemon Desolation/FieldNoteCompiler.rb',
                   Ctx(deso, {'PBFields::QUAKEMOVES': rc['consts'].get('PBFields::QUAKEMOVES')}, 'new'))
    numkey = {}
    for call in split_calls(dsrc):
        a = split_args(call)
        m = re.search(r'FIELDEFFECTS\.dig\(:([A-Z0-9_]+)', call)
        if m and a[0].isdigit(): numkey.setdefault(int(a[0]), m.group(1))
    # v11 Rejuv manual sections
    man = open(RAW + 'rejuv_re1_manual.txt', encoding='utf-8', errors='replace').read().replace('\r', '')
    secs = {}
    for m in re.finditer(r'#-+ (\d+)\. ([^\[]+?) \[[A-Z]+\] -+#\n(.*?)(?=\n#-+ \d+\.|\Z)', man, re.S):
        secs[int(m.group(1))] = (m.group(2).strip(), m.group(3).strip())
    V11 = {'burning': 7, 'volcanictop': 16, 'ashenbeach': 20, 'holy': 29, 'dimensional': 38, 'frozendimensional': 39,
           'haunted': 40, 'corruptedcave': 41, 'bewitchedwoods': 42, 'sky': 43}

    rebn = {REB[idname[n]]: (n, idname[n]) for n in sorted(idname) if idname[n] in REB and idname[n] != 'NONE'}
    order = list(rebn) + ['volcanictop']
    rej_ids, deso_ids = {}, {}
    for k in rej:
        if k == 'INDOOR': continue
        rej_ids.setdefault(base_id(canon_new(k)), []).append(k)
    for k in deso:
        if k == 'INDOOR': continue
        deso_ids.setdefault(base_id(canon_new(k)), []).append(k)
    for k in list(rej_ids) + list(deso_ids):
        if k not in order: order.append(k)

    KW = re.compile(r'(Created by|Becomes|Destroyed|Terminated|Grows from|Stage by|resets to|begins on|explod|collapse|turns? (this |the )?field into|transform|into an? |change[sd]? (this |the )?field|Removed by|for as long as)', re.I)
    mtrans = []
    o = open(OUT + 'scratch_body.md', 'w')
    trans = []  # (from, triggers, to, notes)
    for cid in order:
        games = []
        if cid in rebn: games.append('Reborn')
        if cid in rej_ids: games.append('Rejuv')
        if cid in deso_ids: games.append('Deso')
        names = set()
        if cid in rebn: names.add(reb[rebn[cid][1]]['FIELDNAME'])
        for k in rej_ids.get(cid, []): names.add(rej[k]['name'])
        for k in deso_ids.get(cid, []): names.add(deso[k]['name'])
        o.write(f"\n## `{cid}` — {' / '.join(sorted(names))}  [{', '.join(games)}]\n")
        base = None
        if cid in rebn:
            n, key = rebn[cid]
            f = reb[key]; base = norm_old(f)
            o.write(f'**Reborn E19** (field #{n}, `{key}`)\n')
            for l in data_lines(f, False): o.write('- ' + l + '\n')
            for l in rnotes.get(n, []):
                l = fix(l)
                if KW.search(l) and not l.startswith('Nature Power'): mtrans.append((cid, 'Reborn', l))
            ml = filt(rnotes.get(n, []))
            if ml:
                o.write('- *Manual/hardcoded:*\n')
                for l in ml: o.write('  - ' + l + '\n')
            for to, mv, cond in chg_lines(f, False):
                trans.append((cid, mv, to, f'Reborn' + (f'; cond `{cond}`' if cond else '')))
        for game, data, ids in [('Rejuvenation 13', rej, rej_ids), ('Desolation Ep6', deso, deso_ids)]:
            keys = ids.get(cid, [])
            if not keys: continue
            gtag = 'Rejuv' if game.startswith('Rej') else 'Deso'
            for k in keys:
                f = data[k]
                stage = canon_new(k)
                label = f'**{game}** (`{k}`' + (f', stage id `{stage}`' if stage != cid else '') + ')'
                if base is not None:
                    d = diff(base, norm_new(f))
                    o.write(label + ' — differences vs Reborn E19 data:\n')
                    if not d: o.write('- (identical data)\n')
                    for l in d: o.write('- ' + l + '\n')
                    if f.get('overlay'):
                        for l in data_lines(f, True):
                            if l.startswith('Overlay'): o.write('- ' + l + '\n')
                    for l in (data_lines(f, True)):
                        if l.startswith('Seed:') and gtag == 'Rejuv' and base['seed'] != norm_new(f)['seed']: o.write('- ' + l + '\n')
                else:
                    o.write(label + ':\n')
                    for l in data_lines(f, True): o.write('- ' + l + '\n')
                for to, mv, cond in chg_lines(f, True):
                    trans.append((stage, mv, to, gtag + (f'; cond `{cond}`' if cond else '')))
                if gtag == 'Deso':
                    nums = [nn for nn, kk in numkey.items() if kk == k]
                    for nn in nums:
                        for l in dnotes[nn]:
                            l = fix(l)
                            if KW.search(l) and not l.startswith('Nature Power'): mtrans.append((stage, 'Deso', l))
                        ml = filt(dnotes[nn])
                        if base is not None and cid in rebn:
                            rset = set(filt(rnotes.get(rebn[cid][0], [])))
                            ml = [l for l in ml if l not in rset]
                            if ml: o.write(f'- *Deso manual lines not in Reborn manual (note #{nn}):*\n')
                        elif ml: o.write(f'- *Deso manual (note #{nn}):*\n')
                        for l in ml: o.write('  - ' + l + '\n')
            if gtag == 'Rejuv' and cid in V11 and V11[cid] in secs:
                nm11, body = secs[V11[cid]]
                bl = [x.strip() for x in body.split('\n') if x.strip()]
                for i, x in enumerate(bl):
                    if x.startswith('*') and KW.search(x) and 'Nature Power' not in x:
                        j = i + 1; extra = []
                        while j < len(bl) and not bl[j].startswith('*'): extra.append(re.sub(r'\s+', ' ', bl[j])); j += 1
                        mtrans.append((cid, 'Rejuv(v11 manual)', re.sub(r'\s+', ' ', x.lstrip('* ')) + (' ' + ', '.join(extra) if extra else '')))
                body = '\n'.join('  ' + x.strip() for x in body.split('\n') if x.strip())
                o.write(f'- *Rejuv v11 in-game manual text ("{nm11}"; may predate v13 data above):*\n```\n{body}\n```\n')
    o.close()
    with open(OUT + 'scratch_trans.json', 'w') as t: json.dump({'data': trans, 'manual': mtrans}, t)
    print('fields', len(order), 'reb', len(rebn), 'rej', len(rej_ids), 'deso', len(deso_ids), 'trans', len(trans))
