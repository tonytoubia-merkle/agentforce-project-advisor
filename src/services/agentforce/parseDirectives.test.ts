import { describe, it, expect } from 'vitest';
import { parseUIDirective } from './parseDirectives';

describe('parseUIDirective', () => {
  it('returns null directive for plain text', () => {
    const result = parseUIDirective('Hello, how can I help?');
    expect(result.directive).toBeNull();
    expect(result.cleanText).toBe('Hello, how can I help?');
  });

  it('extracts a JSON directive from text', () => {
    const raw = 'Here are some products {"action":"SHOW_PRODUCTS","payload":{"products":[]}}';
    const result = parseUIDirective(raw);
    expect(result.directive).not.toBeNull();
    expect(result.directive!.action).toBe('SHOW_PRODUCTS');
    expect(result.cleanText).toBe('Here are some products');
  });

  it('handles code-fenced JSON', () => {
    const raw = '```json\n{"action":"CHANGE_SCENE","payload":{"sceneContext":{"setting":"kitchen"}}}\n```';
    const result = parseUIDirective(raw);
    expect(result.directive).not.toBeNull();
    expect(result.directive!.action).toBe('CHANGE_SCENE');
  });

  it('repairs unclosed braces', () => {
    const raw = '{"action":"RESET_SCENE","payload":{}';
    const result = parseUIDirective(raw);
    expect(result.directive).not.toBeNull();
    expect(result.directive!.action).toBe('RESET_SCENE');
  });
});
