import { EventEmitter } from "node:events";
import type { PrepReportSections } from "@interviewiq/shared";

interface ReportStreamState {
  emitter: EventEmitter;
  buffer: string;
}

const streams = new Map<string, ReportStreamState>();

function getState(reportId: string): ReportStreamState {
  let state = streams.get(reportId);
  if (!state) {
    state = { emitter: new EventEmitter(), buffer: "" };
    state.emitter.setMaxListeners(20);
    streams.set(reportId, state);
  }
  return state;
}

export function publishChunk(reportId: string, text: string): void {
  const state = getState(reportId);
  state.buffer += text;
  state.emitter.emit("chunk", text);
}

/** Signals a fresh generation attempt is starting (e.g. the one automatic retry) — subscribers should discard any partial text shown so far. */
export function publishReset(reportId: string): void {
  const state = getState(reportId);
  state.buffer = "";
  state.emitter.emit("reset");
}

export function publishDone(reportId: string, sections: PrepReportSections): void {
  getState(reportId).emitter.emit("done", sections);
  streams.delete(reportId);
}

export function publishError(reportId: string, message: string): void {
  getState(reportId).emitter.emit("error", message);
  streams.delete(reportId);
}

interface StreamHandlers {
  onChunk: (text: string) => void;
  onReset: () => void;
  onDone: (sections: PrepReportSections) => void;
  onError: (message: string) => void;
}

/**
 * Subscribes to a report's in-progress generation. Returns the text
 * generated so far (so a subscriber connecting slightly after generation
 * started doesn't miss anything) plus an unsubscribe function.
 */
export function subscribeToReportStream(
  reportId: string,
  handlers: StreamHandlers
): { initialBuffer: string; unsubscribe: () => void } {
  const state = getState(reportId);
  state.emitter.on("chunk", handlers.onChunk);
  state.emitter.on("reset", handlers.onReset);
  state.emitter.on("done", handlers.onDone);
  state.emitter.on("error", handlers.onError);

  return {
    initialBuffer: state.buffer,
    unsubscribe: () => {
      state.emitter.off("chunk", handlers.onChunk);
      state.emitter.off("reset", handlers.onReset);
      state.emitter.off("done", handlers.onDone);
      state.emitter.off("error", handlers.onError);
    },
  };
}
