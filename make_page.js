const fs = require("fs");
const html = fs.readFileSync("legacy_prototype/public/index.html", "utf8");
const start = html.indexOf("<body>") + 6;
const end = html.indexOf("<script src=\"/js/app.js\"></script>");
const body = html.slice(start, end).trim();
const code = ["\x27use client\x27;", "import React from \x27react\x27;", "import Script from \x27next/script\x27;", "export default function Home() {", "  return (", "    <>", "      <link rel=\x27stylesheet\x27 href=\x27/style.css\x27 />", "      <link rel=\x27stylesheet\x27 href=\x27https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap\x27 />", "      <div dangerouslySetInnerHTML={{ __html: " + JSON.stringify(body) + " }} />", "      <Script src=\x27/app.js\x27 strategy=\x27afterInteractive\x27 />", "    </>", "  );", "}"].join("\n");
fs.writeFileSync("frontend/src/app/page.tsx", code);
console.log("PAGE_BUILT_SUCCESS");
