import type { UIDirective } from '@/types/agent';
import type { Product } from '@/types/product';
import { MOCK_PRODUCTS } from '@/mocks/products';

function sanitize(text: string): string {
  return text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
}

function normalizeProducts(directive: UIDirective): UIDirective {
  if (!directive.payload?.products?.length) return directive;

  directive.payload.products = directive.payload.products.map((p: Product | { productId?: string; id?: string }) => {
    const id = ('productId' in p ? p.productId : p.id) as string;
    const catalogProduct = MOCK_PRODUCTS.find((m) => m.id === id);
    if (catalogProduct) return catalogProduct;
    return p as Product;
  });

  return directive;
}

function extractDirective(text: string): { directive: UIDirective | null; cleanText: string } {
  const jsonMatch = text.match(/\{[\s\S]*"action"\s*:\s*"[A-Z_]+"[\s\S]*\}/);
  if (!jsonMatch) return { directive: null, cleanText: text };

  const jsonStr = jsonMatch[0];
  const cleanText = text.replace(jsonStr, '').trim();

  const parsed = tryParseJSON(jsonStr);
  if (parsed && parsed.action) {
    return { directive: normalizeProducts(parsed as unknown as UIDirective), cleanText };
  }

  return { directive: null, cleanText: text };
}

function tryParseJSON(str: string): Record<string, unknown> | null {
  try {
    return JSON.parse(str);
  } catch {
    // Try to repair common JSON issues (unclosed braces)
    let repaired = str;
    const opens = (repaired.match(/\{/g) || []).length;
    const closes = (repaired.match(/\}/g) || []).length;
    if (opens > closes) {
      repaired += '}'.repeat(opens - closes);
      try {
        return JSON.parse(repaired);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function parseUIDirective(rawText: string): { directive: UIDirective | null; cleanText: string } {
  const sanitized = sanitize(rawText);
  return extractDirective(sanitized);
}
