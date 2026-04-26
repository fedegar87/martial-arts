import { readFileSync, writeFileSync } from "node:fs";
import { argv } from "node:process";

const [, , inputPath, outputPath] = argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node clean-landing-svg.mjs <input.svg> <output.svg>");
  process.exit(1);
}

const DROP_FILLS = new Set([
  "#1e0807",
  "#250707",
  "#320708",
  "#760d0d",
  "#831f16",
  "#941d19",
  "#a4281f",
  "#9d3c20",
  "#ab5125",
]);

const source = readFileSync(inputPath, "utf8");

const cleaned = source.replace(
  /<g\s+fill="(#[0-9a-fA-F]+)">[\s\S]*?<\/g>/g,
  (match, fill) => (DROP_FILLS.has(fill.toLowerCase()) ? "" : match),
);

writeFileSync(outputPath, cleaned, "utf8");
console.log(`Cleaned SVG written to ${outputPath}`);
