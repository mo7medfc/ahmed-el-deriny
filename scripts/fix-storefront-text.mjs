/**
 * One-shot: remap leftover dark-theme text/input classes to light-theme readable colors.
 * Skips admin + hero overlay (text-white on dark media stays).
 */
import fs from "fs";
import path from "path";

const roots = [
  "src/app/[locale]",
  "src/components/home",
  "src/components/layout",
  "src/components/products",
  "src/components/ui",
];

const skipFiles = new Set([
  "ProductHeroSliderClient.tsx", // white text on video is intentional
  "HeroSection.tsx",
]);

/** Order matters — longer / more specific first */
const replacements = [
  ["placeholder:text-heritage-200/30", "placeholder:text-brand-400"],
  ["placeholder:text-dark-400", "placeholder:text-brand-400"],
  ["text-heritage-200/80", "text-brand-700"],
  ["text-heritage-200/70", "text-brand-600"],
  ["text-heritage-200/60", "text-brand-500"],
  ["text-heritage-200/50", "text-brand-500"],
  ["text-heritage-200", "text-brand-700"],
  ["text-heritage-100", "text-brand-800"],
  ["text-heritage-50", "text-brand-900"],
  ["bg-heritage-900/80", "bg-brand-50"],
  ["bg-heritage-900/60", "bg-brand-50"],
  ["bg-heritage-900/50", "bg-brand-50"],
  ["bg-heritage-900/40", "bg-brand-50"],
  ["bg-heritage-950/50", "bg-brand-50"],
  ["bg-heritage-900", "bg-white"],
  ["bg-heritage-950", "bg-brand-50"],
  ["bg-heritage-800", "bg-brand-100"],
  ["border-gold-500/15", "border-brand-200"],
  ["border-gold-500/10", "border-brand-200"],
  ["border-gold-500/20", "border-brand-200"],
  ["border-gold-500/30", "border-brand-300"],
  ["border-dark-600", "border-brand-200"],
  ["border-dark-500", "border-brand-300"],
  ["bg-dark-800", "bg-white"],
  ["text-dark-200", "text-brand-700"],
  ["text-dark-300", "text-brand-600"],
  ["text-dark-400", "text-brand-500"],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|css)$/.test(name)) files.push(full);
  }
  return files;
}

let changedFiles = 0;
let totalHits = 0;

for (const root of roots) {
  const abs = path.join(process.cwd(), root);
  for (const file of walk(abs)) {
    if (skipFiles.has(path.basename(file))) continue;
    let src = fs.readFileSync(file, "utf8");
    let hits = 0;
    for (const [from, to] of replacements) {
      if (!src.includes(from)) continue;
      const count = src.split(from).length - 1;
      src = src.split(from).join(to);
      hits += count;
    }

    // Checkout / forms: white headings on light pages → brand
    if (file.includes(`${path.sep}checkout${path.sep}`) || file.includes(`${path.sep}cart${path.sep}`)) {
      const before = src;
      src = src.replaceAll("text-white", "text-brand-900");
      // restore intentional white on brand buttons if any became wrong - primary buttons use gradient-bg text-white via Button
      hits += before === src ? 0 : 1;
    }

    if (hits > 0) {
      fs.writeFileSync(file, src);
      changedFiles++;
      totalHits += hits;
      console.log(`✓ ${path.relative(process.cwd(), file)} (${hits})`);
    }
  }
}

console.log(`\nDone: ${changedFiles} files, ${totalHits} replacements`);
