import { describe, expect, it } from 'vitest';
import { splitWords, toCase } from './logic';

describe('case logic', () => {
  it('splitWords handles camelCase / PascalCase', () => {
    expect(splitWords('helloWorld')).toEqual(['hello', 'World']);
    expect(splitWords('HelloWorld')).toEqual(['Hello', 'World']);
  });

  it('splitWords handles acronyms', () => {
    expect(splitWords('HTTPRequest')).toEqual(['HTTP', 'Request']);
    expect(splitWords('parseURL')).toEqual(['parse', 'URL']);
  });

  it('splitWords handles snake/kebab/path/dot', () => {
    expect(splitWords('hello_world')).toEqual(['hello', 'world']);
    expect(splitWords('hello-world')).toEqual(['hello', 'world']);
    expect(splitWords('hello/world')).toEqual(['hello', 'world']);
    expect(splitWords('hello.world')).toEqual(['hello', 'world']);
  });

  it('splitWords ignores leading/trailing separators', () => {
    expect(splitWords('__hello__world__')).toEqual(['hello', 'world']);
  });

  it('toCase camel/pascal/snake/kebab', () => {
    expect(toCase('Hello World', 'camel')).toBe('helloWorld');
    expect(toCase('hello world', 'pascal')).toBe('HelloWorld');
    expect(toCase('Hello World', 'snake')).toBe('hello_world');
    expect(toCase('Hello World', 'screamingSnake')).toBe('HELLO_WORLD');
    expect(toCase('Hello World', 'kebab')).toBe('hello-world');
    expect(toCase('Hello World', 'screamingKebab')).toBe('HELLO-WORLD');
    expect(toCase('Hello World', 'dot')).toBe('hello.world');
    expect(toCase('Hello World', 'path')).toBe('hello/world');
    expect(toCase('hello world', 'title')).toBe('Hello World');
    expect(toCase('hello world', 'sentence')).toBe('Hello world');
    expect(toCase('Hello World', 'lower')).toBe('hello world');
    expect(toCase('Hello World', 'upper')).toBe('HELLO WORLD');
  });

  it('round-trip: camel → kebab → camel preserves words', () => {
    const camel = 'helloThereFriend';
    const kebab = toCase(camel, 'kebab');
    expect(kebab).toBe('hello-there-friend');
    expect(toCase(kebab, 'camel')).toBe(camel);
  });

  it('empty input → empty output', () => {
    expect(toCase('', 'camel')).toBe('');
  });
});
