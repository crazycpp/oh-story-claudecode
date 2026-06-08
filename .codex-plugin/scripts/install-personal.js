#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { build } = require("./build-codex-package");

const home = process.env.USERPROFILE || process.env.HOME;
if (!home) {
  console.error("install failed: USERPROFILE/HOME is not set");
  process.exit(1);
}

const pluginName = "oh-story-skills";
const pluginDir = path.join(home, "plugins", pluginName);
const marketplaceDir = path.join(home, ".agents", "plugins");
const marketplacePath = path.join(marketplaceDir, "marketplace.json");
const codexConfigPath = path.join(home, ".codex", "config.toml");
const codexCacheDir = path.join(home, ".codex", "plugins", "cache", "personal", pluginName);
const legacyWrongPluginDir = path.join(home, ".agents", "plugins", "plugins", pluginName);

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function isWithinHome(target) {
  const relative = path.relative(home, target);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function removeSafe(target, label, requiredSuffix = pluginName) {
  const resolved = path.resolve(target);
  if (!isWithinHome(resolved) || path.basename(resolved) !== requiredSuffix) {
    throw new Error(`refusing to remove unsafe ${label} path: ${resolved}`);
  }
  if (!fs.existsSync(resolved)) return false;
  fs.rmSync(resolved, { recursive: true, force: true });
  return true;
}

function cleanupOldInstall() {
  const removed = [];
  for (const item of [
    [pluginDir, "plugin install"],
    [codexCacheDir, "Codex plugin cache"],
    [legacyWrongPluginDir, "legacy misplaced junction"],
  ]) {
    const [target, label] = item;
    try {
      if (removeSafe(target, label)) removed.push(target);
    } catch (error) {
      throw new Error(`could not clean ${label}: ${error.message}`);
    }
  }
  return removed;
}

function readMarketplace() {
  if (!fs.existsSync(marketplacePath)) {
    return {
      name: "personal",
      interface: { displayName: "Personal" },
      plugins: [],
    };
  }
  const text = fs.readFileSync(marketplacePath, "utf8").replace(/^\uFEFF/, "");
  const root = JSON.parse(text);
  if (!Array.isArray(root.plugins)) root.plugins = [];
  if (!root.name) root.name = "personal";
  if (!root.interface) root.interface = { displayName: "Personal" };
  return root;
}

function writeMarketplace(root) {
  ensureDir(marketplaceDir);
  fs.writeFileSync(marketplacePath, `${JSON.stringify(root, null, 2)}\n`, "utf8");
}

function updateMarketplace() {
  const root = readMarketplace();
  const entry = {
    name: pluginName,
    source: {
      source: "local",
      path: `./plugins/${pluginName}`,
    },
    policy: {
      installation: "INSTALLED_BY_DEFAULT",
      authentication: "ON_USE",
    },
    category: "Writing",
  };

  root.plugins = root.plugins.filter((plugin) => plugin.name !== pluginName);
  root.plugins.push(entry);
  writeMarketplace(root);
}

function escapeTomlLiteral(value) {
  return value.replaceAll("'", "''");
}

function ensureSection(text, header, body) {
  const headerPattern = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sectionPattern = new RegExp(`(^|\\r?\\n)${headerPattern}\\r?\\n[\\s\\S]*?(?=\\r?\\n\\[|$)`);

  if (!sectionPattern.test(text)) {
    const prefix = text.trimEnd();
    return `${prefix}${prefix ? "\n\n" : ""}${header}\n${body}\n`;
  }

  return text.replace(sectionPattern, (section, leading) => {
    const normalized = body
      .split("\n")
      .filter(Boolean)
      .reduce((current, line) => {
        const key = line.slice(0, line.indexOf("=")).trim();
        const keyPattern = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=.*$`, "m");
        return keyPattern.test(current)
          ? current.replace(keyPattern, line)
          : `${current.trimEnd()}\n${line}\n`;
      }, section.trimEnd());
    return `${leading || ""}${normalized}\n`;
  });
}

function updateCodexConfig() {
  ensureDir(path.dirname(codexConfigPath));
  const existing = fs.existsSync(codexConfigPath)
    ? fs.readFileSync(codexConfigPath, "utf8").replace(/^\uFEFF/, "")
    : "";
  const source = escapeTomlLiteral(home);
  let updated = ensureSection(
    existing,
    `[plugins."${pluginName}@personal"]`,
    "enabled = true",
  );
  updated = ensureSection(
    updated,
    "[marketplaces.personal]",
    `source_type = "local"\nsource = '${source}'`,
  );
  fs.writeFileSync(codexConfigPath, updated, "utf8");
}

try {
  const removed = cleanupOldInstall();
  ensureDir(path.dirname(pluginDir));
  build(pluginDir);
  updateMarketplace();
  updateCodexConfig();

  for (const target of removed) {
    console.log(`Removed old path: ${target}`);
  }
  console.log(`Installed clean Codex package: ${pluginDir}`);
  console.log(`Updated marketplace: ${marketplacePath}`);
  console.log(`Updated Codex config: ${codexConfigPath}`);
} catch (error) {
  console.error(`install failed: ${error.message}`);
  process.exit(1);
}
