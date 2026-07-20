import mammoth from "mammoth";
import { HttpError } from "../../middleware/errorHandler.js";

// pdf-parse has no ESM types and its index.js runs a debug code path when
// required directly under some bundlers, so import the internal lib entry.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function parseDocument(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case "application/pdf": {
      const result = await pdfParse(buffer);
      return result.text.trim();
    }
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }
    case "text/plain":
      return buffer.toString("utf-8").trim();
    default:
      throw new HttpError(415, `Unsupported file type: ${mimeType}`);
  }
}
