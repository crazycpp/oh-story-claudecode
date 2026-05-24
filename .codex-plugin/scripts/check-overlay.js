#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");
const { build, validatePackage } = require("./build-codex-package");

const root = path.resolve(__dirname, "..", "..");
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

const allowedTopLevel = [
  ".codex-plugin/",
  "codex-skills/",
  "CODEX_GUIDE.md",
  "docs/",
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
} catch (error) {
  fail(`manifest is not valid JSON: ${error.message}`);
}

for (const skill of expectedSkills) {
  const skillPath = path.join(root, "codex-skills", skill, "SKILL.md");
  const agentPath = path.join(root, "codex-skills", skill, "agents", "openai.yaml");
  if (!fs.existsSync(skillPath)) fail(`missing wrapper ${path.relative(root, skillPath)}`);
  if (!fs.existsSync(agentPath)) fail(`missing metadata ${path.relative(root, agentPath)}`);

  if (fs.existsSync(skillPath)) {
    const text = fs.readFileSync(skillPath, "utf8");
    const upstreamRef = `../../skills/${skill}/SKILL.md`;
    if (!text.includes(upstreamRef)) {
      fail(`${skill} wrapper must reference upstream skill path`);
    }
    const resolvedUpstream = path.resolve(path.dirname(skillPath), upstreamRef);
    if (!fs.existsSync(resolvedUpstream)) {
      fail(`${skill} upstream reference does not resolve: ${upstreamRef}`);
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
        .filter(({ line }) => !/(legacy|Legacy|兼容|可选|不是默认|明确要求)/.test(line));
      for (const hit of badLines) {
        fail(`${skill} has default-looking forbidden token ${token} on line ${hit.index}`);
      }
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
    if (!allowedTopLevel.some((prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix))) {
      fail(`unexpected non-overlay diff file: ${file}`);
    }
  }
} catch (error) {
  fail(`could not inspect git diff main..HEAD: ${error.message}`);
}

try {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "oh-story-codex-package-"));
  const outDir = path.join(tmpDir, "oh-story-skills");
  build(outDir);
  validatePackage(outDir);
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch (error) {
  fail(`clean package validation failed: ${error.message}`);
}

if (!process.exitCode) {
  console.log("Codex overlay check passed");
}
