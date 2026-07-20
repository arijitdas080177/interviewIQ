import puppeteer from "puppeteer";
import { buildReportHtml, type ReportForExport } from "./template.js";

export async function renderReportPdf(report: ReportForExport): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(buildReportHtml(report), { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
