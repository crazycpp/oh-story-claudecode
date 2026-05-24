#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const defaultOut = path.join(repoRoot, "dist", "oh-story-skills-codex");

const expectedSkills = [
  "browser-cdp",
  "story",
  "story-cover",
  "story-deslop",
  "story-import",
  "story-long-analyze",
  "story-long-scan",
  "story-long-write",
  "story-review",
  "story-setup",
  "story-short-analyze",
  "story-short-scan",
  "story-short-write",
];

function parseArgs(argv) {
  const args = { out: defaultOut };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out") {
      args.out = path.resolve(argv[index + 1]);
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return args;
}

function usage() {
  console.log(`Usage: node .codex-plugin/scripts/build-codex-package.js [--out <dir>]

Builds a clean Codex plugin package that does not expose the upstream skills/
directory at plugin root. Upstream skill materials are copied under
.codex-plugin/upstream-skills/ and wrapper references are rewritten.`);
}

function removeDir(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyRecursive(source, target, transform) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    ensureDir(target);
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      copyRecursive(
        path.join(source, entry.name),
        path.join(target, entry.name),
        transform,
      );
    }
    return;
  }

  ensureDir(path.dirname(target));
  const transformed = transform ? transform(source, target) : null;
  if (typeof transformed === "string") {
    fs.writeFileSync(target, transformed, "utf8");
  } else {
    fs.copyFileSync(source, target);
  }
}

function rewriteWrapper(source) {
  if (!source.endsWith(path.join("SKILL.md"))) return null;
  const relative = path.relative(repoRoot, source).replaceAll(path.sep, "/");
  if (!relative.startsWith("codex-skills/")) return null;
  return fs
    .readFileSync(source, "utf8")
    .replaceAll("../../skills/", "../../.codex-plugin/upstream-skills/");
}

function copyPackage(outDir) {
  removeDir(outDir);
  ensureDir(outDir);

  copyRecursive(
    path.join(repoRoot, ".codex-plugin"),
    path.join(outDir, ".codex-plugin"),
  );
  copyRecursive(
    path.join(repoRoot, "codex-skills"),
    path.join(outDir, "codex-skills"),
    rewriteWrapper,
  );
  copyRecursive(
    path.join(repoRoot, "skills"),
    path.join(outDir, ".codex-plugin", "upstream-skills"),
  );

  for (const file of ["CODEX_GUIDE.md", "LICENSE"]) {
    const source = path.join(repoRoot, file);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(outDir, file));
  }
  if (fs.existsSync(path.join(repoRoot, "docs"))) {
    copyRecursive(path.join(repoRoot, "docs"), path.join(outDir, "docs"));
  }
}

function validatePackage(outDir) {
  const rootSkills = path.join(outDir, "skills");
  if (fs.existsSync(rootSkills)) {
    throw new Error("package must not contain a top-level skills/ directory");
  }

  const manifestPath = path.join(outDir, ".codex-plugin", "plugin.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.skills !== "./codex-skills/") {
    throw new Error("package manifest skills must point to ./codex-skills/");
  }

  for (const skill of expectedSkills) {
    const wrapper = path.join(outDir, "codex-skills", skill, "SKILL.md");
    const metadata = path.join(outDir, "codex-skills", skill, "agents", "openai.yaml");
    if (!fs.existsSync(wrapper)) throw new Error(`missing wrapper: ${skill}`);
    if (!fs.existsSync(metadata)) throw new Error(`missing openai.yaml: ${skill}`);

    const text = fs.readFileSync(wrapper, "utf8");
    const upstreamRef = `../../.codex-plugin/upstream-skills/${skill}/SKILL.md`;
    if (!text.includes(upstreamRef)) {
      throw new Error(`${skill} wrapper did not rewrite upstream reference`);
    }
    const resolved = path.resolve(path.dirname(wrapper), upstreamRef);
    if (!fs.existsSync(resolved)) {
      throw new Error(`${skill} rewritten upstream reference does not resolve`);
    }
  }
}

function build(outDir) {
  copyPackage(outDir);
  validatePackage(outDir);
  return outDir;
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      usage();
      process.exit(0);
    }
    const outDir = build(args.out);
    console.log(`Codex package built: ${outDir}`);
  } catch (error) {
    console.error(`build failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { build, validatePackage };
