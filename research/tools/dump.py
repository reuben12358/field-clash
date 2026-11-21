import json, sys
sys.path.insert(0, '.')
from rbparse import *
R='/home/antigravity/pokefield/research/raw/'
stuff = open(R+'reborn_patch/Scripts/PBStuff.rb', encoding='utf-8', errors='replace').read()
# PBStuff consts (POWDERMOVES etc) then PBFields
c1 = parse_consts(stuff[:stuff.index('class PBFields')], 'PBStuff')
c2 = parse_consts(stuff[stuff.index('class PBFields'):], 'PBFields')
consts = {**c1}
for k,v in c2.items():
    consts[k]=v
# re-parse PBFields with PBStuff consts available
c2 = {}
sec = stuff[stuff.index('class PBFields'):]
import re
for m in re.finditer(r'\n\s*([A-Z][A-Z0-9_]*)\s*=\s*([^\n]+(?:\n\s+[^\n=]+)*)', sec):
    try:
        consts['PBFields::'+m.group(1)] = P(tokenize(m.group(2)), consts).expr()
    except Exception as e: pass
# numeric field ids -> names
src = open(R+'reborn_patch/Scripts/PBFieldEffects.rb', encoding='utf-8', errors='replace').read()
numconsts = {k:v for k,v in consts.items() if k.startswith('PBFields::') and isinstance(v,int)}
idname = {v:k.split('::')[1] for k,v in numconsts.items()}
# keep PBFields:: names symbolic for field ids in data
consts2 = {k:v for k,v in consts.items() if not isinstance(v,int)}
d = parse_assignment(src, 'FIELDEFFECTS', consts2)
json.dump(keystr(d), open(R+'../reborn_fields.json','w'), indent=1)
json.dump({'idname':idname, 'consts':{k:v for k,v in consts2.items()}}, open(R+'../reborn_consts.json','w'), indent=1)
print('reborn', len(d), list(d.keys()))
for name, path in [('rejuv', R+'rejuv/vanilla/fieldtxt.rb'), ('deso', R+'deso_patch/Scripts/Pokemon Desolation/fieldtxt.rb')]:
    s = open(path, encoding='utf-8', errors='replace').read()
    d = parse_assignment(s, 'FIELDEFFECTS', {})
    json.dump(keystr(d), open(R+f'../{name}_fields.json','w'), indent=1)
    print(name, len(d), list(d.keys()))
