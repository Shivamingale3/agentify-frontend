import { describe, it, expect } from 'vitest';
import { parseAIResponse } from '../../src/utils/ai.utils.js';

describe('parseAIResponse', () => {
  it('parses plain JSON object', () => {
    const result = parseAIResponse<{ a: number }>('{"a":1}');
    expect(result).toEqual({ a: 1 });
  });

  it('parses plain JSON array', () => {
    const result = parseAIResponse<number[]>('[1,2,3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('strips ```json fenced blocks', () => {
    const result = parseAIResponse<{ x: number }>('```json\n{"x":42}\n```');
    expect(result).toEqual({ x: 42 });
  });

  it('strips plain ``` fenced blocks', () => {
    const result = parseAIResponse<{ y: string }>('```\n{"y":"hi"}\n```');
    expect(result).toEqual({ y: 'hi' });
  });

  it('strips fences with surrounding whitespace', () => {
    const result = parseAIResponse<{ z: number }>('  ```json\n{"z":7}\n```  ');
    expect(result).toEqual({ z: 7 });
  });

  it('throws "Invalid AI response." for non-JSON input', () => {
    expect(() => parseAIResponse('not json')).toThrow('Invalid AI response.');
  });

  it('throws for partially fenced malformed input', () => {
    expect(() => parseAIResponse('```json{"a":}')).toThrow('Invalid AI response.');
  });

  it('throws for empty input', () => {
    expect(() => parseAIResponse('')).toThrow('Invalid AI response.');
  });
});
