/**
 * Tiny safe expression evaluator. Supports:
 *   - numeric literals (with leading +/- and decimals)
 *   - + - * / % ** parentheses
 *   - unary minus
 *   - common Math functions: sqrt, abs, floor, ceil, round, log, log2, log10, exp, sin, cos, tan, max, min, pow
 *   - constants: pi, e
 *
 * Implemented as a recursive-descent parser → AST → eval. Does NOT use
 * `eval` or `new Function` so we never run arbitrary user JS.
 */

type Node =
  | { type: 'num'; value: number }
  | { type: 'binop'; op: '+' | '-' | '*' | '/' | '%' | '**'; left: Node; right: Node }
  | { type: 'unary'; op: '+' | '-'; arg: Node }
  | { type: 'call'; name: string; args: Node[] };

const FUNCS: Record<string, (...args: number[]) => number> = {
  sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor, ceil: Math.ceil,
  round: Math.round, log: Math.log, log2: Math.log2, log10: Math.log10,
  exp: Math.exp, sin: Math.sin, cos: Math.cos, tan: Math.tan,
  max: Math.max, min: Math.min, pow: Math.pow,
};

const CONSTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

export interface EvalSuccess { readonly ok: true; readonly value: number }
export interface EvalFailure { readonly ok: false; readonly error: string }
export type EvalResult = EvalSuccess | EvalFailure;

export function evaluate(input: string): EvalResult {
  if (!input.trim()) return { ok: true, value: 0 };
  try {
    const ast = parse(input);
    const value = exec(ast);
    if (!Number.isFinite(value)) return { ok: false, error: 'non-finite result' };
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'parse error' };
  }
}

/* ─── parser ─────────────────────────────────────────────────────────── */

class Parser {
  i = 0;
  s: string;
  constructor(s: string) { this.s = s.trim(); }
  peek(): string { return this.s[this.i] ?? ''; }
  eat(): string { return this.s[this.i++] ?? ''; }
  ws(): void { while (/\s/.test(this.peek())) this.i++; }

  parseExpr(): Node { return this.parseAdd(); }
  parseAdd(): Node {
    let left = this.parseMul();
    this.ws();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.eat() as '+' | '-';
      this.ws();
      const right = this.parseMul();
      left = { type: 'binop', op, left, right };
      this.ws();
    }
    return left;
  }
  parseMul(): Node {
    let left = this.parsePow();
    this.ws();
    while (this.peek() === '*' || this.peek() === '/' || this.peek() === '%') {
      const op = this.eat() as '*' | '/' | '%';
      this.ws();
      const right = this.parsePow();
      left = { type: 'binop', op, left, right };
      this.ws();
    }
    return left;
  }
  parsePow(): Node {
    const base = this.parseUnary();
    this.ws();
    if (this.peek() === '*' && this.s[this.i + 1] === '*') {
      this.i += 2;
      this.ws();
      const exp = this.parsePow(); // right-assoc
      return { type: 'binop', op: '**', left: base, right: exp };
    }
    return base;
  }
  parseUnary(): Node {
    this.ws();
    if (this.peek() === '+' || this.peek() === '-') {
      const op = this.eat() as '+' | '-';
      const arg = this.parseUnary();
      return { type: 'unary', op, arg };
    }
    return this.parsePrimary();
  }
  parsePrimary(): Node {
    this.ws();
    const ch = this.peek();
    if (ch === '(') {
      this.eat();
      const e = this.parseExpr();
      this.ws();
      if (this.eat() !== ')') throw new Error("expected ')'");
      return e;
    }
    if (/[0-9.]/.test(ch)) return this.parseNumber();
    if (/[a-zA-Z_]/.test(ch)) return this.parseIdent();
    throw new Error(`unexpected '${ch}'`);
  }
  parseNumber(): Node {
    const start = this.i;
    while (/[0-9.eE+-]/.test(this.peek())) {
      // Stop at + or - if previous char isn't e/E
      const ch = this.peek();
      if ((ch === '+' || ch === '-') && this.i > start) {
        const prev = this.s[this.i - 1] ?? '';
        if (prev !== 'e' && prev !== 'E') break;
      }
      this.i++;
    }
    const slice = this.s.slice(start, this.i);
    const v = Number(slice);
    if (!Number.isFinite(v)) throw new Error(`bad number '${slice}'`);
    return { type: 'num', value: v };
  }
  parseIdent(): Node {
    const start = this.i;
    while (/[a-zA-Z0-9_]/.test(this.peek())) this.i++;
    const name = this.s.slice(start, this.i).toLowerCase();
    this.ws();
    if (this.peek() === '(') {
      this.eat();
      const args: Node[] = [];
      this.ws();
      if (this.peek() !== ')') {
        args.push(this.parseExpr());
        this.ws();
        while (this.peek() === ',') {
          this.eat();
          this.ws();
          args.push(this.parseExpr());
          this.ws();
        }
      }
      if (this.eat() !== ')') throw new Error("expected ')'");
      if (!FUNCS[name]) throw new Error(`unknown function '${name}'`);
      return { type: 'call', name, args };
    }
    const k = CONSTS[name];
    if (k === undefined) throw new Error(`unknown identifier '${name}'`);
    return { type: 'num', value: k };
  }
}

function parse(input: string): Node {
  const p = new Parser(input);
  const ast = p.parseExpr();
  p.ws();
  if (p.i !== p.s.length) throw new Error(`trailing input at position ${p.i}`);
  return ast;
}

function exec(n: Node): number {
  switch (n.type) {
    case 'num':
      return n.value;
    case 'unary': {
      const v = exec(n.arg);
      return n.op === '-' ? -v : v;
    }
    case 'binop': {
      const a = exec(n.left), b = exec(n.right);
      switch (n.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        case '%': return a % b;
        case '**': return a ** b;
      }
      return 0;
    }
    case 'call': {
      const fn = FUNCS[n.name];
      if (!fn) throw new Error(`unknown function '${n.name}'`);
      return fn(...n.args.map(exec));
    }
  }
}
