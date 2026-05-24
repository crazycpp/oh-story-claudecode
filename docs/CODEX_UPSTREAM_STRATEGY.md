# Codex 适配层与上游同步策略

本文是维护者手册，用来保证当前 fork 既能保持 Codex skill 可用，又能持续合并 `worldwonderer/oh-story-claudecode` 的更新。

## 当前判断

当前仓库已经配置：

```text
origin   https://github.com/crazycpp/oh-story-claudecode.git
upstream https://github.com/worldwonderer/oh-story-claudecode.git
```

截至 2026-05-24，本地 `main` 包含 Codex 原生化提交 `f915256 feat: add codex native story skills`。上游 `upstream/main` 已推进到 `v0.6.8`。

`git merge-tree HEAD upstream/main` 预演显示，直接合并上游会在以下文件产生内容冲突：

```text
README.md
skills/story-import/SKILL.md
skills/story-long-analyze/SKILL.md
skills/story-long-scan/SKILL.md
skills/story-review/SKILL.md
skills/story-setup/SKILL.md
```

这些文件都是上游高频演进的核心 skill 文件，也是当前 Codex 改造写入较深的地方。后续策略应从“直接改上游文件”调整为“上游主体 + Codex overlay”。

## 分支模型

推荐长期使用三层分支：

```text
upstream/main       原作者仓库，只读跟踪
main                尽量贴近 upstream/main，可作为同步基线
codex/main          Codex 可用分支，叠加 Codex overlay
```

如果暂时不想重置 `main`，也可以先保守使用：

```text
main                当前可用 Codex 分支
backup/*           合并前快照
sync/upstream-*     每次上游同步试验分支
```

最终目标仍建议把 Codex 适配放到 `codex/main`，让 `main` 尽量靠近上游。

## 日常同步流程

每次同步上游前先备份：

```powershell
git fetch upstream
git branch backup/codex-before-upstream-YYYYMMDD
git checkout -b sync/upstream-YYYYMMDD
```

优先用 rebase 预演：

```powershell
git rebase upstream/main
```

如果冲突集中在少数核心文件，按本文的 overlay 规则解决。若冲突过多，不要硬解，改用“以上游为底，重新应用 Codex overlay”的方式：

```powershell
git checkout -b codex/rebase-v0.6.8 upstream/main
git cherry-pick f915256
```

如果 cherry-pick 冲突很大，应拆分 `f915256`，把 manifest、agents 元数据、文档、核心 skill 文案改造拆成多个小提交。

## Overlay 边界

### A. Codex 专属文件

这些文件可以由 fork 维护，通常不会和上游冲突：

```text
.codex-plugin/plugin.json
CODEX_GUIDE.md
docs/CODEX_UPSTREAM_STRATEGY.md
skills/*/agents/openai.yaml
```

后续新增 Codex 元数据、Codex UI 默认 prompt、Codex 安装说明，优先写入这些文件。

### B. 上游主体文件

这些文件应尽量跟随上游，Codex 改动要少而窄：

```text
README.md
README_EN.md
skills/*/SKILL.md
skills/*/references/*.md
skills/*/scripts/*.js
```

如果必须修改 `SKILL.md`，只做两类改动：

1. 增加短小的平台选择说明，例如“Codex 默认当前会话执行，Claude/OpenClaw 使用 legacy agent”。
2. 修复平台无关的 bug，并优先考虑向 upstream 提 PR。

避免在 `SKILL.md` 中大段重写上游流程。大段 Codex 说明应放入 `CODEX_GUIDE.md` 或未来的 `references/codex-*.md`。

### C. Legacy/Claude 文件

这些文件保持上游语义，不为了 Codex 删除：

```text
.claude-plugin/marketplace.json
skills/story-setup/references/templates/agents/*.md
skills/story-setup/references/templates/hooks/*.sh
skills/story-setup/references/templates/settings-hooks.json
skills/story-setup/UPGRADING.md
```

Codex 默认不调用它们，但它们是 Claude/OpenClaw 兼容层的一部分。

## 架构调整建议

### 1. 将 Codex 适配从核心 SKILL.md 拆薄

当前冲突说明 `story-import`、`story-review`、`story-setup` 等核心文件被改得较深。下一轮重构应把 Codex 逻辑变成小段入口说明，而不是重写整段执行流程。

推荐模式：

```text
skills/story-review/SKILL.md
  保留上游主流程
  增加短段：Codex 默认单会话四维审查

skills/story-review/references/codex-review-flow.md
  放 Codex 详细审查流程、输出格式、降级策略
```

这样以后上游更新 `SKILL.md` 时，只需要保留短段或重新插入短段。

### 2. 把 Codex 文件生成成可重复脚本

`skills/*/agents/openai.yaml` 是机械性元数据，适合用脚本生成，减少手改。

建议新增：

```text
scripts/generate-codex-overlay.js
scripts/check-codex-overlay.js
```

用途：

- 根据 `skills/*/SKILL.md` 生成缺失的 `agents/openai.yaml`
- 校验 `.codex-plugin/plugin.json`
- 校验 13 个 skill 是否都有 Codex 元数据
- 校验 Codex 默认路径没有强依赖 `.claude/*`、`agent-browser`、`GPT_IMAGE_API_KEY`

### 3. 将上游可接受改动反向贡献

以下改动不必长期留在 fork：

- JS 脚本 `--outdir` 自动创建
- 扫榜脚本 CAPTCHA 诊断
- reference 文件路径修复
- 平台无关的格式校验增强

这些应尽量提交给 upstream。一旦 upstream 接收，fork 的 overlay 就会变薄。

### 4. 保留双平台，但明确默认路径

每个 skill 只需要一个稳定规则：

```text
Codex 默认：当前会话 + Codex Browser/web/image_gen
Claude/OpenClaw 兼容：legacy agent/hooks/CLI 后端
```

不要在同一段流程里交错写两套路径。先写默认路径，再写兼容路径。

## 本次合并 v0.6.8 的推荐步骤

1. 新建工作分支：

```powershell
git fetch upstream
git checkout -b sync/upstream-v0.6.8
```

2. 以 `upstream/main` 为底重新应用 Codex overlay，而不是直接硬合：

```powershell
git reset --hard upstream/main
git cherry-pick f915256
```

注意：这一步会重写工作分支，必须只在 `sync/upstream-v0.6.8` 这类临时分支上执行。

3. 解决冲突时采用优先级：

```text
上游新版业务逻辑优先
Codex manifest/openai.yaml 必须保留
Codex 默认路径说明保留为短段
大段 Codex 说明迁移到 CODEX_GUIDE.md 或 references/codex-*.md
```

4. 合并后跑检查：

```powershell
node -e "JSON.parse(require('fs').readFileSync('.codex-plugin/plugin.json','utf8')); console.log('plugin json ok')"
Get-ChildItem -Recurse -Filter *.js skills | ForEach-Object { node --check $_.FullName }
rg -n 'Agent\(subagent_type|Skill\("|\.claude/agents|\.claude/hooks|agent-browser|GPT_IMAGE_API_KEY' skills README.md CODEX_GUIDE.md
```

检查命中不一定是错误，但必须确认它们只出现在 legacy/compatibility/optional backend 段落。

## 决策摘要

短期：保留当前能跑的 Codex 分支，先不要直接合并 `upstream/main` 到主分支。

中期：基于 `upstream/main` 新建同步分支，把 `f915256` 拆成可维护 overlay，解决 `v0.6.8` 冲突。

长期：让 `main` 贴近 upstream，让 `codex/main` 只叠加最小 Codex overlay；将平台无关修复尽量反向贡献给 upstream。
