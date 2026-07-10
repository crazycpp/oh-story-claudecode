#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");
const {
  build,
  discoverSkillNames,
  validatePackage,
} = require("./build-codex-package");

const root = path.resolve(__dirname, "..", "..");
const expectedSkills = discoverSkillNames(root);
const allowedTopLevel = [
  ".codex-plugin/",
  "codex-skills/",
  "CODEX_GUIDE.md",
  "docs/",
  "install-codex-plugin.ps1",
];

function fail(message) {
  console.error(`overlay check failed: ${message}`);
  process.exitCode = 1;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

try {
  const manifest = JSON.parse(read(".codex-plugin/plugin.json"));
  if (manifest.skills !== "./codex-skills/") {
    fail("manifest skills must point to ./codex-skills/");
  }

  const upstreamMarketplace = JSON.parse(read(".claude-plugin/marketplace.json"));
  const upstreamVersion = upstreamMarketplace.metadata?.version;
  if (!upstreamVersion) {
    fail("upstream marketplace version is missing");
  } else if (!manifest.version.startsWith(`${upstreamVersion}-codex.`)) {
    fail(
      `manifest version ${manifest.version} must track upstream ${upstreamVersion}`,
    );
  }
} catch (error) {
  fail(`manifest validation failed: ${error.message}`);
}

const installer = read("install-codex-plugin.ps1");
if (!installer.includes("codex plugin add oh-story-skills@personal")) {
  fail("PowerShell installer must register the plugin through codex plugin add");
}
if (!installer.includes("installed,\\s+enabled")) {
  fail("PowerShell installer must verify the installed, enabled status");
}

if (expectedSkills.length === 0) {
  fail("no upstream skills with SKILL.md were found");
}

const wrapperRoot = path.join(root, "codex-skills");
const actualSkills = fs
  .readdirSync(wrapperRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => fs.existsSync(path.join(wrapperRoot, entry.name, "SKILL.md")))
  .map((entry) => entry.name)
  .sort();
if (JSON.stringify(actualSkills) !== JSON.stringify(expectedSkills)) {
  fail(
    `wrapper set does not match upstream skills: expected ${expectedSkills.join(", ")}; got ${actualSkills.join(", ")}`,
  );
}

for (const skill of expectedSkills) {
  const skillPath = path.join(wrapperRoot, skill, "SKILL.md");
  const agentPath = path.join(wrapperRoot, skill, "agents", "openai.yaml");
  if (!fs.existsSync(skillPath)) {
    fail(`missing wrapper ${path.relative(root, skillPath)}`);
    continue;
  }
  if (!fs.existsSync(agentPath)) {
    fail(`missing metadata ${path.relative(root, agentPath)}`);
  }

  const text = fs.readFileSync(skillPath, "utf8");
  const upstreamRef = `../../skills/${skill}/SKILL.md`;
  if (!text.includes(upstreamRef)) {
    fail(`${skill} wrapper must reference upstream skill path`);
  }
  const resolvedUpstream = path.resolve(path.dirname(skillPath), upstreamRef);
  if (!fs.existsSync(resolvedUpstream)) {
    fail(`${skill} upstream reference does not resolve: ${upstreamRef}`);
  }
  if (!text.includes("## Source Of Truth")) {
    fail(`${skill} wrapper must declare the upstream source of truth`);
  }

  const forbidden = [
    ".claude/agents",
    ".claude/hooks",
    "Agent(subagent_type",
    "agent-browser",
    "GPT_IMAGE_API_KEY",
  ];
  for (const token of forbidden) {
    const badLines = text
      .split(/\r?\n/)
      .map((line, index) => ({ line, index: index + 1 }))
      .filter(({ line }) => line.includes(token))
      .filter(
        ({ line }) =>
          !/(legacy|compatib|upstream|only when|explicit|do not|not require|fallback)/i.test(
            line,
          ),
      );
    for (const hit of badLines) {
      fail(`${skill} has default-looking forbidden token ${token} on line ${hit.index}`);
    }
  }
}

try {
  const diff = cp
    .execFileSync("git", ["diff", "--name-only", "main..HEAD"], {
      cwd: root,
      encoding: "utf8",
    })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  for (const file of diff) {
    if (
      !allowedTopLevel.some(
        (prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix),
      )
    ) {
      fail(`unexpected non-overlay diff file: ${file}`);
    }
  }
} catch (error) {
  fail(`could not inspect git diff main..HEAD: ${error.message}`);
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "oh-story-codex-package-"));
try {
  const outDir = path.join(tmpDir, "oh-story-skills");
  build(outDir);
  validatePackage(outDir);
} catch (error) {
  fail(`clean package validation failed: ${error.message}`);
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

if (!process.exitCode) {
  console.log(
    `Codex overlay check passed (${expectedSkills.length} wrappers, upstream-aligned)`,
  );
}
