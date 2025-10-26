'use client';

import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdf: PDFDocumentProxy = await getDocument({ data: arrayBuffer }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    out += (p > 1 ? "\n" : "") + content.items.map((it: any)=> ("str" in it ? it.str : "")).join(" ");
  }
  return out.trim();
}
