"""Tiny parser for the Ruby hash literals used in Reborn/Rejuv/Deso field data files.
Research helper only (not part of the sim implementation)."""
import re, json, sys

TOK = re.compile(r'''
 (?P<ws>\s+)|
 (?P<comment>\#[^\n]*)|
 (?P<str>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|
 (?P<arrow>=>)|
 (?P<num>-?\d+\.\d+|-?\d+)|
 (?P<const>[A-Z][A-Za-z0-9_]*(?:::[A-Za-z0-9_]+)+)|
 (?P<sym>:[A-Za-z_][A-Za-z0-9_]*[?!]?)|
 (?P<ident>[A-Za-z_][A-Za-z0-9_]*[?!]?)|
 (?P<punct>[{}\[\],()+=])
''', re.X)

def tokenize(s):
    out = []
    i = 0
    while i < len(s):
        m = TOK.match(s, i)
        if not m:
            out.append(('other', s[i])); i += 1; continue
        k = m.lastgroup
        if k not in ('ws', 'comment'):
            out.append((k, m.group()))
        i = m.end()
    return out

class P:
    def __init__(self, toks, consts=None):
        self.t = toks; self.i = 0; self.consts = consts or {}
    def peek(self, o=0):
        return self.t[self.i+o] if self.i+o < len(self.t) else ('eof', '')
    def next(self):
        tok = self.peek(); self.i += 1; return tok
    def expect(self, v):
        tok = self.next()
        if tok[1] != v:
            raise SyntaxError(f'expected {v} got {tok} at {self.i} ctx={self.t[self.i-5:self.i+5]}')
    def expr(self):
        v = self.atom()
        while self.peek()[1] == '+':
            self.next(); r = self.atom()
            if isinstance(v, list) and isinstance(r, list): v = v + r
            else: v = f'{v} + {r}'
        return v
    def atom(self):
        k, v = self.next()
        if v == '{':
            d = {}
            while self.peek()[1] != '}':
                key = self.expr()
                self.expect('=>')
                val = self.expr()
                if isinstance(key, list): key = tuple(key)
                d[key] = val
                if self.peek()[1] == ',': self.next()
            self.next(); return d
        if v == '[':
            a = []
            while self.peek()[1] != ']':
                a.append(self.expr())
                if self.peek()[1] == ',': self.next()
            self.next(); return a
        if k == 'str':
            body = v[1:-1]
            return bytes(body, 'utf-8').decode('unicode_escape').encode('latin-1').decode('utf-8', 'replace') if '\\' in body else body
        if k == 'num':
            return float(v) if '.' in v else int(v)
        if k == 'sym':
            return v[1:]
        if k == 'const':
            if v in self.consts: return self.consts[v]
            parts = v.split('::')
            if parts[0] in ('PBMoves', 'PBTypes', 'PBItems', 'PBStats', 'PBEffects', 'PBAbilities', 'PBFields'):
                return parts[-1]
            return v
        if k == 'ident':
            if v == 'nil': return None
            if v == 'true': return True
            if v == 'false': return False
            if v == 'arrayToConstant' and self.peek()[1] == '(':
                self.next(); self.expr(); self.expect(','); arr = self.expr(); self.expect(')'); return arr
            # generic call / identifier -> raw
            if self.peek()[1] == '(':
                depth = 0; raw = v
                while True:
                    tk = self.next(); raw += tk[1]
                    if tk[1] == '(': depth += 1
                    elif tk[1] == ')':
                        depth -= 1
                        if depth == 0: break
                return raw
            return v
        raise SyntaxError(f'unexpected {k} {v} at {self.i} ctx={self.t[self.i-8:self.i+5]}')

def parse_assignment(src, name, consts=None):
    idx = src.index(name + ' =')
    toks = tokenize(src[idx + len(name) + 2:])
    p = P(toks, consts)
    return p.expr()

def parse_consts(src, prefix):
    consts = {}
    for m in re.finditer(r'\n\s*([A-Z][A-Z0-9_]*)\s*=\s*(arrayToConstant\(PBMoves,\s*\[.*?\]\)(?:\s*\+\s*[^\n]+)?|\d+)', src, re.S):
        nm, expr = m.group(1), m.group(2)
        try:
            toks = tokenize(expr)
            consts[prefix + '::' + nm] = P(toks, consts).expr()
        except Exception as e:
            pass
    return consts

def keystr(o):
    if isinstance(o, dict):
        return {str(k): keystr(v) for k, v in o.items()}
    if isinstance(o, list):
        return [keystr(x) for x in o]
    return o

if __name__ == '__main__':
    pass
