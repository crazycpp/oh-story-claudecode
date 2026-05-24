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

try {
  const removed = cleanupOldInstall();
  ensureDir(path.dirname(pluginDir));
  build(pluginDir);
  updateMarketplace();

  for (const target of removed) {
    console.log(`Removed old path: ${target}`);
  }
  console.log(`Installed clean Codex package: ${pluginDir}`);
  console.log(`Updated marketplace: ${marketplacePath}`);
  console.log("");
  console.log("Ensure Codex config contains:");
  console.log("");
  console.log(`[plugins."${pluginName}@personal"]`);
  console.log("enabled = true");
  console.log("");
  console.log("[marketplaces.personal]");
  console.log('source_type = "local"');
  console.log(`source = '${home.replaceAll("\\", "\\\\")}'`);
} catch (error) {
  console.error(`install failed: ${error.message}`);
  process.exit(1);
}
