'use client';

import * as mammoth from 'mammoth';

export async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value.trim();
}
