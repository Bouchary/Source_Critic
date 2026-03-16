import "pdf-parse/worker";
import { getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getData());

export async function extractTextFromPdfBuffer(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const info = await parser.getInfo();
    const textResult = await parser.getText();

    return {
      text: textResult.text?.trim() ?? "",
      pages: info.total ?? 0,
      info: info.info ?? {},
      metadata: info.metadata ?? null,
    };
  } finally {
    await parser.destroy();
  }
}