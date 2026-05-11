import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const patterns = [
  {
    id: "gold_fill",
    pattern: "bg-primary text-primary-foreground|border-primary bg-primary",
  },
  {
    id: "large_radius",
    pattern: "rounded-(xl|lg|full)",
  },
  {
    id: "tap_feedback",
    pattern: "tap-feedback",
  },
  {
    id: "native_controls",
    pattern: "<button|<select|<textarea",
  },
  {
    id: "status_tokens",
    pattern: "var\\(--status-success\\)|var\\(--destructive\\)",
  },
  {
    id: "gold_glow",
    pattern: "shadow-\\[0_0_24px_var\\(--gold-glow\\)",
  },
].map((entry) => ({
  ...entry,
  regex: new RegExp(entry.pattern),
}));

const textExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
  ".css",
  ".md",
]);

const domainRoots = ["src/app", "src/components"];
const allowedRoots = [
  "src/components/ui",
  "src/components/primitives",
  "src/lib/ui-classes.ts",
  "src/components/shared/Chip.tsx",
  "src/components/shared/OptionCard.tsx",
  "src/components/shared/SegmentedNav.tsx",
];
const domainExclusions = [
  "src/app/globals.css",
  "src/components/ui/",
  "src/components/primitives/",
  "src/components/shared/Chip.tsx",
  "src/components/shared/OptionCard.tsx",
  "src/components/shared/SegmentedNav.tsx",
];

function normalizePath(path) {
  return path.replaceAll("\\", "/");
}

function extensionOf(path) {
  const index = path.lastIndexOf(".");
  return index === -1 ? "" : path.slice(index);
}

function listFiles(root) {
  if (!existsSync(root)) return [];
  const stat = statSync(root);
  if (stat.isFile()) {
    return textExtensions.has(extensionOf(root)) ? [root] : [];
  }

  const files = [];
  for (const entry of readdirSync(root)) {
    files.push(...listFiles(join(root, entry)));
  }
  return files;
}

function collectFiles(roots, exclusions = []) {
  const normalizedExclusions = exclusions.map(normalizePath);
  const seen = new Set();
  const files = [];

  for (const root of roots) {
    for (const file of listFiles(root)) {
      const rel = normalizePath(relative(process.cwd(), file));
      if (normalizedExclusions.some((excluded) => rel === excluded || rel.startsWith(excluded))) {
        continue;
      }
      if (seen.has(rel)) continue;
      seen.add(rel);
      files.push({ absolute: file, relative: rel });
    }
  }

  return files;
}

function auditFiles(files) {
  return Object.fromEntries(
    patterns.map(({ id, pattern, regex }) => {
      const matches = [];
      for (const file of files) {
        const lines = readFileSync(file.absolute, "utf8").split(/\r?\n/);
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            matches.push(`${file.relative}:${index + 1}:${line.trim()}`);
          }
        });
      }
      return [
        id,
        {
          count: matches.length,
          pattern,
          matches,
        },
      ];
    }),
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  surfaces: {
    domain_surface: auditFiles(collectFiles(domainRoots, domainExclusions)),
    allowed_surface: auditFiles(collectFiles(allowedRoots)),
  },
};

const output = `${JSON.stringify(report, null, 2)}\n`;

if (process.argv.includes("--write-baseline")) {
  const target = join(process.cwd(), "docs", "ui-audit-baseline.json");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, output, "utf8");
  console.log(`Wrote ${target}`);
} else {
  console.log(output);
}
