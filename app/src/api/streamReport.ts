import type { PrepReportSections } from "@interviewiq/shared";
import { getToken } from "./authToken";
import { API_URL } from "./client";

interface StreamHandlers {
  onChunk: (text: string) => void;
  onReset: () => void;
  onDone: (sections: PrepReportSections) => void;
  onError: (message: string) => void;
}

/**
 * Consumes the report generation SSE stream. Uses XMLHttpRequest rather
 * than fetch()'s ReadableStream body or the browser-only EventSource API —
 * XHR's incrementally-growing `responseText` via onreadystatechange is the
 * one streaming-read mechanism that works consistently across React
 * Native (iOS/Android) and web, and (unlike EventSource) lets us attach an
 * Authorization header.
 */
export async function streamReport(reportId: string, handlers: StreamHandlers): Promise<() => void> {
  const token = await getToken();
  const xhr = new XMLHttpRequest();
  let processedUpTo = 0;

  function processBuffer() {
    const fullText = xhr.responseText;
    while (true) {
      const boundary = fullText.indexOf("\n\n", processedUpTo);
      if (boundary === -1) break;
      const rawEvent = fullText.slice(processedUpTo, boundary);
      processedUpTo = boundary + 2;

      const match = rawEvent.match(/^event: (\w+)\ndata: (.*)$/s);
      if (!match) continue;
      const [, eventName, dataStr] = match;
      let data: any;
      try {
        data = JSON.parse(dataStr);
      } catch {
        continue;
      }

      if (eventName === "chunk") handlers.onChunk(data.text);
      else if (eventName === "reset") handlers.onReset();
      else if (eventName === "done") handlers.onDone(data.sections);
      else if (eventName === "error") handlers.onError(data.message);
    }
  }

  xhr.open("GET", `${API_URL}/reports/${reportId}/stream`, true);
  if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
  xhr.onreadystatechange = () => {
    if (xhr.readyState >= 3) processBuffer();
  };
  xhr.onerror = () => handlers.onError("Lost connection while generating the report.");
  xhr.send();

  return () => xhr.abort();
}
