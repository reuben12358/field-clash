"""Render per-field research digests from parsed field data + in-game Field Notes (manual) text.
Research helper only."""
import json, re, sys
sys.path.insert(0, '/home/antigravity/pokefield/research/tools')
from rbparse import tokenize, P

RAW = '/home/antigravity/pokefield/research/raw/'
OUT = '/home/antigravity/pokefield/research/'

# ---------- move / ability display names ----------
NAMES = {}
for f in [RAW + 'deso_patch/Scripts/Pokemon Desolation/movetext.rb', RAW + 'rejuv/vanilla/movetext.rb',
          RAW + 'deso_patch/Scripts/Pokemon Desolation/abiltext.rb', RAW + 'rejuv/vanilla/abiltext.rb']:
    s = open(f, encoding='utf-8', errors='replace').read()
    for m in re.finditer(r'\n:([A-Z0-9_]+) => \{\s*\n(?:\s*:ID => \d+,\s*\n)?\s*:name => "([^"]*)"', s):
        NAMES.setdefault(m.group(1), m.group(2))

def nm(x):
    if isinstance(x, str):
        return NAMES.get(x, x.title() if x.isupper() else x)
    return str(x)

TYPES = ['NORMAL','FIGHTING','FLYING','POISON','GROUND','ROCK','BUG','GHOST','STEEL','QMARKS','FIRE','WATER','GRASS','ELECTRIC','PSYCHIC','ICE','DRAGON','DARK','FAIRY','SHADOW']

def lst(a):
    if isinstance(a, list):
        return ', '.join(sorted(set(nm(x) for x in a)))
    return nm(a)

# ---------- icon / markup ----------
ICON = {
 'fieldUp': '▲', 'fieldDown': '▼', 'fieldPlus': '+type', 'fieldplus': '+type', 'fieldChange': '→', 'field': '[field]',
 'fieldRedUp': '▲(bad)', 'fieldNoSleep': 'cannot sleep', 'fieldSleep': 'sleep', 'fieldBurn': 'burn', 'fieldParalyze': 'paralysis',
 'fieldFreeze': 'freeze', 'fieldPoisonStatus': 'poison(status)', 'fieldAllStat': 'all stats', 'fieldFaint': 'faint', 'fieldfaint': 'faint',
 'fieldQmark': '???-type', 'typeQMARK': '???-type',
}
def icon(m):
    k = m.group(1)
    if k in ICON: return ICON[k]
    if k.startswith('type'): return k[4:].capitalize() + '-type'
    if k.startswith('field'): return k[5:].capitalize() + '-type'
    return k

def clean(t):
    t = re.sub(r'<icon=([A-Za-z]+)>', icon, t)
    t = re.sub(r'</?c(=[a-z]+)?>', '', t)
    t = t.replace('. . .', '...').replace('\\"', '"')
    return re.sub(r'\s+', ' ', t).strip()

# ---------- note parsing ----------
def skip_str(s, i):
    """s[i] is a quote; return index just past the closing quote (handles escapes and #{...} with nested strings)."""
    q = s[i]; i += 1
    while i < len(s):
        c = s[i]
        if c == '\\': i += 2; continue
        if c == q: return i + 1
        if q == '"' and s.startswith('#{', i):
            i = skip_code(s, i + 2, '}'); continue
        i += 1
    return i

def skip_code(s, i, close):
    depth = 1
    while i < len(s):
        c = s[i]
        if c in '"\'': i = skip_str(s, i); continue
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0 and close == '}': return i + 1
        i += 1
    return i

def split_top(s, sep):
    out = []; depth = 0; cur_start = 0; i = 0
    while i < len(s):
        c = s[i]
        if c in '"\'':
            i = skip_str(s, i); continue
        if c in '([{': depth += 1
        elif c in ')]}': depth -= 1
        elif c == sep and depth == 0:
            out.append(s[cur_start:i].strip()); cur_start = i + 1
        i += 1
    out.append(s[cur_start:].strip())
    return [x for x in out if x != ''] if sep == ',' else out

def split_calls(src, start_pat='PBFieldNote.new('):
    calls = []
    i = 0
    while True:
        j = src.find(start_pat, i)
        if j < 0: break
        # skip commented lines
        ls = src.rfind('\n', 0, j) + 1
        if src[ls:j].lstrip().startswith('#'):
            i = j + 1; continue
        k = j + len(start_pat); depth = 1
        while depth:
            c = src[k]
            if c in '"\'':
                k = skip_str(src, k); continue
            if c == '(': depth += 1
            elif c == ')': depth -= 1
            k += 1
        calls.append(src[j + len(start_pat):k - 1])
        i = k
    return calls

def split_args(s):
    return split_top(s, ',')
def _old_split_args(s):
    args = []; depth = 0; instr = None; esc = False; cur = ''
    for c in s:
        if instr:
            cur += c
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == instr: instr = None
            continue
        if c in '"\'': instr = c; cur += c; continue
        if c in '([{': depth += 1
        if c in ')]}': depth -= 1
        if c == ',' and depth == 0:
            args.append(cur.strip()); cur = ''; continue
        cur += c
    if cur.strip(): args.append(cur.strip())
    return args

class Ctx:
    def __init__(self, fields, consts, style):
        self.F = fields; self.C = consts; self.style = style
    def fkey(self, tok):
        tok = tok.strip()
        if tok.startswith('PBFields::'): return tok.split('::')[1]
        if tok.startswith(':'): return tok[1:]
        return tok
    def subkey(self, tok):
        tok = tok.strip()
        if '::' in tok: return tok.split('::')[1]
        if tok.startswith(':'): return tok[1:]
        if re.fullmatch(r'-?\d+\.\d+', tok): return str(float(tok))
        return tok
    def dig(self, args):
        f = self.F.get(self.fkey(args[0]), {})
        v = f
        for a in args[1:]:
            if not isinstance(v, dict): return None
            k = self.subkey(a)
            if k in v: v = v[k]
            elif k.upper() in v: v = v[k.upper()]
            else:
                return None
        return v
    def evalexpr(self, e):
        e = e.strip()
        m = re.fullmatch(r'feToStringName\((.*)\)', e, re.S)
        if m:
            a = split_args(m.group(1))
            v = self.dig(a)
            return lst(v) if v is not None else f'?{e}?'
        m = re.fullmatch(r'FIELDEFFECTS\.dig\((.*?)\)(\[0\])?', e, re.S)
        if m:
            v = self.dig(split_args(m.group(1)))
            if m.group(2) and isinstance(v, list): v = v[0]
            return lst(v) if isinstance(v, list) else (str(v) if v is not None else f'?{e}?')
        m = re.fullmatch(r'(?:PBTypes\.getName|getTypeName)\((.*)\)', e, re.S)
        if m:
            return self.evalexpr(m.group(1)).capitalize()
        m = re.fullmatch(r'(PBFields::[A-Z_]+|PBStuff::[A-Z_]+)\.map.*', e, re.S)
        if m:
            v = self.C.get(m.group(1))
            return lst(v) if v else f'?{e}?'
        if (e.startswith('"') and e.endswith('"')) or (e.startswith("'") and e.endswith("'")):
            return self.interp(e[1:-1])
        if '+' in e:
            parts = split_plus(e)
            if len(parts) > 1:
                return ''.join(self.evalexpr(p) for p in parts)
        return f'?{e}?'
    def interp(self, s):
        out = ''; i = 0
        while i < len(s):
            if s.startswith('#{', i):
                k = skip_code(s, i + 2, '}')
                out += self.evalexpr(s[i + 2:k - 1]); i = k
            else:
                out += s[i]; i += 1
        return out

def split_plus(e):
    return split_top(e, '+')
def _old_split_plus(e):
    parts = []; depth = 0; instr = None; esc = False; cur = ''
    for c in e:
        if instr:
            cur += c
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == instr: instr = None
            continue
        if c in '"\'': instr = c; cur += c; continue
        if c in '([{': depth += 1
        if c in ')]}': depth -= 1
        if c == '+' and depth == 0: parts.append(cur); cur = ''; continue
        cur += c
    parts.append(cur)
    return [p.strip() for p in parts]

def notes(path, ctx):
    src = open(path, encoding='utf-8', errors='replace').read()
    res = {}
    for call in split_calls(src):
        a = split_args(call)
        try:
            num = int(a[0])
        except ValueError:
            continue
        text = clean(ctx.evalexpr(a[1])) if len(a) > 1 else ''
        elab = clean(ctx.evalexpr(a[2])) if len(a) > 2 else ''
        cog = clean(ctx.evalexpr(a[3])) if len(a) > 3 else ''
        line = text
        if elab:
            if text.endswith('...') and elab.startswith('...'):
                line = text[:-3].rstrip() + ' ' + elab[3:].lstrip()
            else:
                line = f'{text} {elab}'
        if cog: line += f' [{cog}]'
        res.setdefault(num, []).append(line)
    return res

# ---------- data digest ----------
def digest_new(f):
    """For Rejuv/Deso fieldtxt.rb format."""
    L = []
    if f.get('fieldMessage'): L.append('Intro: ' + ' / '.join(x for x in f['fieldMessage'] if x))
    L.append(f"Nature Power: {nm(f.get('naturePower'))} | Secret Power anim: {nm(f.get('secretPower'))} | Camouflage/Mimicry: {str(f.get('mimicry')).capitalize()}")
    for mult, types in sorted((f.get('typeBoosts') or {}).items(), key=lambda x: -float(x[0])):
        L.append(f"Type x{mult}: {lst([t.capitalize() for t in types])}")
    if f.get('typeCondition'):
        L.append('Type-boost conditions: ' + '; '.join(f'{k.capitalize()}: `{v}`' for k, v in f['typeCondition'].items()))
    for mult, mv in sorted((f.get('damageMods') or {}).items(), key=lambda x: -float(x[0])):
        if float(mult) == 0: L.append(f"FAIL: {lst(mv)}")
        else: L.append(f"Moves x{mult}: {lst(mv)}")
    for acc, mv in (f.get('accuracyMods') or {}).items():
        L.append(f"Accuracy {'never-miss' if str(acc) == '0' else acc}: {lst(mv)}")
    for t, mv in (f.get('typeMods') or {}).items():
        L.append(f"Gain {t.capitalize()} type: {lst(mv)}")
    for t, ts in (f.get('typeAddOns') or {}).items():
        L.append(f"All {lst([x.capitalize() for x in ts])} moves gain {t.capitalize()} type")
    for code, mv in (f.get('moveEffects') or {}).items():
        L.append(f"Move effect `{code}`: {lst(mv)}")
    for t, code in (f.get('typeEffects') or {}).items():
        L.append(f"Type effect {t}: `{code}`")
    if f.get('statusMods'): L.append('Status moves modified (see notes): ' + lst(f['statusMods']))
    for to, mv in (f.get('fieldChange') or {}).items():
        cond = (f.get('changeCondition') or {}).get(to)
        L.append(f"CHANGE → {to}: {lst(mv)}" + (f' (cond: `{cond}`)' if cond else ''))
    if f.get('changeMessage'):
        L.append('Change msgs: ' + ' | '.join(f'"{k.strip()}"' for k in f['changeMessage']))
    for k, v in (f.get('changeEffects') or {}).items():
        L.append(f"Change effect `{k}`: {lst(v)}")
    s = f.get('seed') or {}
    if s.get('seedtype'):
        st = ', '.join(f'{k} {"+" if v > 0 else ""}{v}' for k, v in (s.get('stats') or {}).items())
        L.append(f"Seed: {nm(s['seedtype'])} → stats [{st}]; effect {s.get('effect')}={s.get('duration')}; msg \"{s.get('message')}\"")
    return L

def digest_old(f):
    """Reborn E19 PBFieldEffects.rb format."""
    L = []
    if f.get('INTROMESSAGE'): L.append('Intro: ' + str(f['INTROMESSAGE']))
    L.append(f"Nature Power: {nm(f.get('NATUREMOVES'))} | Secret Power anim: {nm(f.get('SECRETPOWERANIM'))} | Camouflage/Mimicry: {str(f.get('MIMICRY')).capitalize()}")
    for mult, types in sorted((f.get('TYPEDAMAGEBOOST') or {}).items(), key=lambda x: -float(x[0])):
        L.append(f"Type x{mult}: {lst([t.capitalize() for t in types])}")
    if f.get('TYPECONDITION'):
        L.append('Type-boost conditions: ' + '; '.join(f'{k.capitalize()}: `{v}`' for k, v in f['TYPECONDITION'].items()))
    for mult, mv in sorted((f.get('MOVEDAMAGEBOOST') or {}).items(), key=lambda x: -float(x[0])):
        if float(mult) == 0: L.append(f"FAIL: {lst(mv)}")
        else: L.append(f"Moves x{mult}: {lst(mv)}")
    for acc, mv in (f.get('MOVEACCURACYBOOST') or {}).items():
        L.append(f"Accuracy {'never-miss' if str(acc) == '0' else acc}: {lst(mv)}")
    for t, mv in (f.get('MOVETYPEMOD') or {}).items():
        L.append(f"Gain {t.capitalize()} type: {lst(mv)}")
    for t, mv in (f.get('MOVETYPECHANGE') or {}).items():
        L.append(f"Become {t.capitalize()} type: {lst(mv)}")
    for t, ts in (f.get('TYPETYPEMOD') or {}).items():
        L.append(f"All {lst([x.capitalize() for x in ts])} moves gain {t.capitalize()} type")
    for t, ts in (f.get('TYPETYPECHANGE') or {}).items():
        L.append(f"All {lst([x.capitalize() for x in ts])} moves become {t.capitalize()} type")
    if f.get('STATUSMOVEBOOST'): L.append('Status moves modified (see notes): ' + lst(f['STATUSMOVEBOOST']))
    for to, mv in (f.get('FIELDCHANGE') or {}).items():
        cond = (f.get('CHANGECONDITION') or {}).get(to)
        L.append(f"CHANGE → {'NONE(base field)' if str(to) == '0' else to}: {lst(mv)}" + (f' (cond: `{cond}`)' if cond else ''))
    if f.get('CHANGEMESSAGE'):
        L.append('Change msgs: ' + ' | '.join(f'"{k.strip()}"' for k in f['CHANGEMESSAGE']))
    for k, v in (f.get('CHANGEEFFECTS') or {}).items():
        L.append(f"Change effect `{k}`: {lst(v)}")
    if f.get('SEED'):
        st = ', '.join(f'{k} {"+" if v > 0 else ""}{v}' for k, v in (f.get('SEEDSTATS') or {}).items())
        L.append(f"Seed: {nm(f['SEED'])} → stats [{st}]; effect {f.get('SEEDEFFECT')}={f.get('SEEDEFFECTVAL')}; msg \"{f.get('SEEDEFFECTSTR')}\"")
    return L

if __name__ == '__main__':
    reb = json.load(open(OUT + 'reborn_fields.json'))
    rc = json.load(open(OUT + 'reborn_consts.json'))
    idname = {int(k): v for k, v in rc['idname'].items()}
    rnotes = notes(RAW + 'reborn_patch/Scripts/PBFieldNotes.rb', Ctx(reb, rc['consts'], 'old'))
    with open(OUT + 'digest_reborn.md', 'w') as o:
        for num in sorted(idname):
            key = idname[num]
            if key not in reb or key == 'NONE': continue
            f = reb[key]
            o.write(f"\n## [{num}] {key} — {f.get('FIELDNAME')}\n### data\n")
            for l in digest_old(f): o.write('- ' + l + '\n')
            if num in rnotes:
                o.write('### manual\n')
                for l in rnotes[num]: o.write('- ' + l + '\n')
    deso = json.load(open(OUT + 'deso_fields.json'))
    dsrc = open(RAW + 'deso_patch/Scripts/Pokemon Desolation/FieldNoteCompiler.rb', encoding='utf-8', errors='replace').read()
    dnotes = notes(RAW + 'deso_patch/Scripts/Pokemon Desolation/FieldNoteCompiler.rb', Ctx(deso, {'PBFields::QUAKEMOVES': rc['consts'].get('PBFields::QUAKEMOVES')}, 'new'))
    # map note numbers to field keys via intro line references
    numkey = {}
    for call in split_calls(dsrc):
        a = split_args(call)
        m = re.search(r'FIELDEFFECTS\.dig\(:([A-Z0-9_]+)', call)
        if m and a[0].isdigit(): numkey.setdefault(int(a[0]), m.group(1))
    with open(OUT + 'digest_deso.md', 'w') as o:
        o.write('note-number→key: ' + json.dumps(numkey) + '\n')
        for key, f in deso.items():
            if key == 'INDOOR': continue
            o.write(f"\n## {key} — {f.get('name')}\n### data\n")
            for l in digest_new(f): o.write('- ' + l + '\n')
            nums = [n for n, k in numkey.items() if k == key]
            for n in nums:
                o.write(f'### manual (note #{n})\n')
                for l in dnotes[n]: o.write('- ' + l + '\n')
    rej = json.load(open(OUT + 'rejuv_fields.json'))
    with open(OUT + 'digest_rejuv.md', 'w') as o:
        for key, f in rej.items():
            if key == 'INDOOR': continue
            o.write(f"\n## {key} — {f.get('name')}\n### data\n")
            for l in digest_new(f): o.write('- ' + l + '\n')
    print('ok', len(rnotes), len(dnotes))
