import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "Hack");

const SOURCES = [
  "apps/api/src",
  "packages/validation/src",
  "packages/shared-types/src",
  "packages/business-logic/src",
  "packages/api-client/src",
];

const IGNORE_DIRS = ["node_modules", "dist", ".turbo", ".git"];

let sourceFileCount = 0;

// tracking
const expectedTxtFiles = new Map(); // txtName -> sourcePath
const collisions = new Map(); // txtName -> [sourcePath]

function walk(dir, base, prefix) {
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const relPath = path.relative(base, fullPath);

    if (IGNORE_DIRS.some((d) => fullPath.includes(d))) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, base, prefix);
    } else {
      sourceFileCount++;

      const content = fs.readFileSync(fullPath, "utf8");

      // 👇 UNIQUE & TRACEABLE NAME
      const txtName =
        `${prefix}__${relPath}`.replace(/[\/\\]/g, "__").replace(/\./g, "_") +
        ".txt";

      const outPath = path.join(OUTPUT_DIR, txtName);

      // collision detection
      if (expectedTxtFiles.has(txtName)) {
        collisions.set(txtName, [...(collisions.get(txtName) ?? []), fullPath]);
      } else {
        expectedTxtFiles.set(txtName, fullPath);
      }

      fs.writeFileSync(outPath, content);
    }
  }
}

// reset output
fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// export
for (const src of SOURCES) {
  const absSrc = path.join(ROOT, src);
  const prefix = src.replace(/[\/\\]/g, "_");
  walk(absSrc, absSrc, prefix);
}

// count hack files
const hackFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".txt"));
const hackFileCount = hackFiles.length;

// CHECK
console.log("\n📊 FILE COUNT CHECK");
console.log("Source files :", sourceFileCount);
console.log("Hack files   :", hackFileCount);

if (sourceFileCount === hackFileCount) {
  console.log("✅ OK: File count matches");
} else {
  console.log("⚠️ WARNING: File count mismatch!");
}

// collision report
if (collisions.size > 0) {
  console.log("\n⚠️ COLLISIONS DETECTED:");
  for (const [txt, sources] of collisions.entries()) {
    console.log(`\n- ${txt}`);
    sources.forEach((s) => console.log(`   ↳ ${s}`));
  }
} else {
  console.log("\n✅ No filename collisions");
}

console.log("\n✅ Done. All source files exported to Hack/");