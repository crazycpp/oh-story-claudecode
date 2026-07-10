#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const defaultOut = path.join(repoRoot, "dist", "oh-story-skills-codex");

function discoverSkillNames(rootDir = repoRoot) {
  const candidates = [
    path.join(rootDir, ".codex-plugin", "upstream-skills"),
    path.join(rootDir, "skills"),
  ];
  const skillsRoot = candidates.find((candidate) => fs.existsSync(candidate));
  if (!skillsRoot) return [];

  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(skillsRoot, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
}

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
    path.join(outDir, "skills"),
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

  const manifestPath = path.join(outDir, ".codex-plugin", "plugin.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.skills = "./skills/";
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function validatePackage(outDir) {
  const rootSkills = path.join(outDir, "skills");
  if (!fs.existsSync(rootSkills)) {
    throw new Error("package must contain the canonical top-level skills/ directory");
  }

  const manifestPath = path.join(outDir, ".codex-plugin", "plugin.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.skills !== "./skills/") {
    throw new Error("package manifest skills must point to ./skills/");
  }

  const expectedSkills = discoverSkillNames(outDir);
  if (expectedSkills.length === 0) {
    throw new Error("package contains no upstream skills");
  }
  const wrapperRoot = rootSkills;
  const actualSkills = fs
    .readdirSync(wrapperRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(wrapperRoot, entry.name, "SKILL.md")))
    .map((entry) => entry.name)
    .sort();
  if (JSON.stringify(actualSkills) !== JSON.stringify(expectedSkills)) {
    throw new Error(
      `wrapper set does not match upstream skills: expected ${expectedSkills.join(", ")}; got ${actualSkills.join(", ")}`,
    );
  }

  for (const skill of expectedSkills) {
    const wrapper = path.join(wrapperRoot, skill, "SKILL.md");
    const metadata = path.join(wrapperRoot, skill, "agents", "openai.yaml");
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

  const codexSetupRoot = path.join(
    outDir,
    ".codex-plugin",
    "upstream-skills",
    "story-setup",
    "references",
    "codex",
  );
  const requiredCodexAssets = [
    "AGENTS.md.tmpl",
    path.join("hooks", "hooks.json"),
    path.join("hooks", "story_codex_hook.py"),
  ];
  for (const asset of requiredCodexAssets) {
    if (!fs.existsSync(path.join(codexSetupRoot, asset))) {
      throw new Error(`missing upstream Codex setup asset: ${asset}`);
    }
  }
  const agentRoot = path.join(codexSetupRoot, "agents");
  const agents = fs
    .readdirSync(agentRoot)
    .filter((file) => file.endsWith(".toml"));
  if (agents.length < 7) {
    throw new Error(`expected at least 7 Codex agents, found ${agents.length}`);
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

module.exports = { build, discoverSkillNames, validatePackage };
