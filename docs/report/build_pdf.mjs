import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

// Import playwright from frontend
const playwrightUrl = pathToFileURL(path.join(rootDir, 'frontend', 'node_modules', 'playwright', 'index.mjs')).href;
const { chromium } = await import(playwrightUrl);

const reportMdPath = path.join(rootDir, 'docs', 'report', 'report.md');
const reportHtmlPath = path.join(rootDir, 'docs', 'report', 'report.html');
const reportPdfPath = path.join(rootDir, 'docs', 'report', 'HIJAB_GRIP_Project_Report.pdf');

// Read markdown
const mdContent = fs.readFileSync(reportMdPath, 'utf8');

// Simple, clean Markdown to HTML parser for documentation
function parseMarkdown(md) {
  let html = md;

  // Escape HTML tags in code blocks
  const codeBlocks = [];
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `___CODE_BLOCK_${codeBlocks.length}___`;
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeBlocks.push(`<pre class="code-block ${lang}"><code>${escapedCode}</code></pre>`);
    return placeholder;
  });

  // Callout Alerts
  html = html.replace(/> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n> (.*?)(?=\n\n|\n[^\s>])/gs, (m, type, text) => {
    return `<div class="callout callout-${type.toLowerCase()}"><strong>${type}:</strong> ${text.replace(/> /g, '')}</div>`;
  });

  // Headers with page break styling
  html = html.replace(/^# (.*$)/gim, '<h1 class="doc-title">$1</h1>');
  html = html.replace(/^## Chapter ([0-9]+): (.*$)/gim, '<div class="chapter-break"></div><h2 id="chapter-$1" class="chapter-title"><span class="chap-badge">Chapter $1</span> $2</h2>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="section-title">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="subsection-title">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="minor-title">$1</h4>');

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)\n\*(.*?)\*/g, (m, alt, src, caption) => {
    const resolvedSrc = src.startsWith('./') ? src.replace('./', '') : src;
    return `<figure class="report-figure"><img src="${resolvedSrc}" alt="${alt}" /><figcaption>${caption}</figcaption></figure>`;
  });
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, (m, alt, src) => {
    const resolvedSrc = src.startsWith('./') ? src.replace('./', '') : src;
    return `<figure class="report-figure"><img src="${resolvedSrc}" alt="${alt}" /></figure>`;
  });

  // Tables
  html = html.replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (match, header, body) => {
    const headers = header.split('|').filter(h => h.trim().length > 0).map(h => `<th>${h.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cols = row.split('|').filter(c => c.trim().length > 0).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cols}</tr>`;
    }).join('\n');
    return `<div class="table-container"><table class="report-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Inline formatting
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs
  html = html.split('\n\n').map(p => {
    if (p.trim().startsWith('<') || p.trim().startsWith('___CODE_BLOCK_')) return p;
    return `<p>${p.trim()}</p>`;
  }).join('\n\n');

  // Restore code blocks
  codeBlocks.forEach((cb, idx) => {
    html = html.replace(`___CODE_BLOCK_${idx}___`, cb);
  });

  return html;
}

const parsedBody = parseMarkdown(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HIJAB GRIP™ by HIJAB WORLD — Technical Project Report</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 9pt;
        color: #7D6B60;
      }
      @top-right {
        content: "HIJAB GRIP™ — Project Report";
        font-family: 'Inter', sans-serif;
        font-size: 8.5pt;
        color: #8C786E;
      }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #2D2521;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
    }

    .chapter-break {
      page-break-before: always;
      break-before: page;
      height: 1px;
    }

    .doc-title {
      font-size: 24pt;
      font-weight: 800;
      color: #2F4D36; /* Brand Forest Green */
      margin-top: 40px;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .chap-badge {
      display: inline-block;
      background: #E8F0EA;
      color: #2F4D36;
      font-size: 10pt;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .chapter-title {
      font-size: 16pt;
      font-weight: 700;
      color: #2F4D36;
      border-bottom: 2px solid #2F4D36;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 14px;
      page-break-after: avoid;
    }

    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: #7D493E; /* Brand Terracotta Accent */
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    .subsection-title {
      font-size: 11pt;
      font-weight: 700;
      color: #332B27;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
    }

    .callout {
      background: #F8F5F2;
      border-left: 4px solid #2F4D36;
      padding: 10px 14px;
      margin: 14px 0;
      font-size: 9.5pt;
      border-radius: 0 4px 4px 0;
    }

    .callout-warning {
      border-left-color: #B24C36;
      background: #FDF5F3;
    }

    .callout-note {
      border-left-color: #A47C3B;
      background: #FAF8F4;
    }

    .table-container {
      width: 100%;
      margin: 14px 0;
      overflow-x: auto;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    .report-table th, .report-table td {
      border: 1px solid #D9CEC7;
      padding: 6px 10px;
      text-align: left;
    }

    .report-table th {
      background-color: #F2ECE7;
      color: #2F4D36;
      font-weight: 700;
    }

    .report-table tr:nth-child(even) {
      background-color: #FAF8F5;
    }

    .code-block {
      background: #25282A;
      color: #F1F1F1;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 8pt;
      line-height: 1.4;
      padding: 10px 14px;
      border-radius: 6px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 12px 0;
      page-break-inside: avoid;
    }

    .inline-code {
      background: #EFE9E4;
      color: #7D493E;
      font-family: monospace;
      font-size: 8.5pt;
      padding: 2px 5px;
      border-radius: 3px;
    }

    .report-figure {
      margin: 16px 0;
      text-align: center;
      page-break-inside: avoid;
    }

    .report-figure img {
      max-width: 95%;
      height: auto;
      border-radius: 6px;
      border: 1px solid #E2D9D2;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }

    .report-figure figcaption {
      font-size: 8.5pt;
      font-style: italic;
      color: #6C5D53;
      margin-top: 6px;
    }

    ul, ol {
      margin-top: 4px;
      margin-bottom: 12px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
${parsedBody}
</body>
</html>`;

fs.writeFileSync(reportHtmlPath, fullHtml, 'utf8');
console.log('HTML written to:', reportHtmlPath);

// Generate PDF using Playwright Chromium
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///' + reportHtmlPath.replace(/\\\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  await page.pdf({
    path: reportPdfPath,
    format: 'A4',
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '20mm',
      right: '20mm',
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 8pt; color: #8C786E; width: 100%; text-align: right; padding-right: 20mm;">HIJAB GRIP™ by HIJAB WORLD — Technical Project Report</div>',
    footerTemplate: '<div style="font-size: 8pt; color: #8C786E; width: 100%; text-align: right; padding-right: 20mm;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });

  console.log('PDF generated at:', reportPdfPath);
  await browser.close();
})().catch(console.error);
