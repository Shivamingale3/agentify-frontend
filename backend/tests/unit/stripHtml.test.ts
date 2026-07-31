import { describe, it, expect } from 'vitest';
import stripHtml from '../../src/utils/stripHtml.js';

describe('stripHtml', () => {
  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('');
  });

  it('strips simple tags', () => {
    expect(stripHtml('<p>hello</p>')).toBe('hello');
  });

  it('strips nested tags', () => {
    expect(stripHtml('<div><p>hello <b>world</b></p></div>')).toBe('hello world');
  });

  it('strips self-closing tags', () => {
    expect(stripHtml('a<br/>b')).toBe('ab');
  });

  it('strips tags with attributes', () => {
    expect(stripHtml('<a href="x">link</a>')).toBe('link');
  });

  it('decodes &nbsp; to space', () => {
    expect(stripHtml('a&nbsp;b')).toBe('a b');
  });

  it('decodes &amp; to &', () => {
    expect(stripHtml('a&amp;b')).toBe('a&b');
  });

  it('decodes &lt; to <', () => {
    expect(stripHtml('a&lt;b')).toBe('a<b');
  });

  it('decodes &gt; to >', () => {
    expect(stripHtml('a&gt;b')).toBe('a>b');
  });

  it('decodes &quot; to "', () => {
    expect(stripHtml('a&quot;b')).toBe('a"b');
  });

  it('decodes &#39; to single quote', () => {
    expect(stripHtml('a&#39;b')).toBe("a'b");
  });

  it('trims leading and trailing whitespace', () => {
    expect(stripHtml('  <p>hi</p>  ')).toBe('hi');
  });

  it('handles plain text without tags', () => {
    expect(stripHtml('just text')).toBe('just text');
  });

  it('decodes multiple entities in one pass', () => {
    expect(stripHtml('<p>&nbsp;hi&nbsp;&amp;&nbsp;</p>')).toBe('hi &');
  });
});
