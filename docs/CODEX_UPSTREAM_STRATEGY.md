# Codex Overlay 与上游同步策略

本仓库采用“上游主体 + Codex overlay”的维护方式。

## 分支

```text
main                跟随 worldwonderer/oh-story-claudecode 的 upstream/main
backup/*           保存历史可运行实现
codex/main          Codex overlay 分支
```

`upstream` 只用于 fetch，push URL 应保持 `DISABLED`。

## Overlay 边界

Codex 分支只维护这些路径：

```text
.codex-plugin/
codex-skills/
CODEX_GUIDE.md
docs/
install-codex-plugin.ps1
```

上游主体路径保持原样：

```text
skills/
README.md
README_EN.md
scripts/
.claude-plugin/
```

如果必须调整上游主体，应先判断是否属于平台无关修复；平台无关修复优先反向贡献给 upstream。

## 同步流程

```powershell
git checkout main
git fetch upstream
git reset --hard upstream/main
git push --force-with-lease origin main

git checkout codex/main
git rebase main
node .codex-plugin/scripts/check-overlay.js
git push --force-with-lease origin codex/main
```

常规上游更新不应与 `codex/main` 冲突。只有上游未来新增 `.codex-plugin/`、`codex-skills/`、`CODEX_GUIDE.md` 或 `docs/` 同名文件时，才需要人工处理。

## Codex 安装策略

不要把仓库根目录直接作为正式 Codex Desktop 插件目录。仓库根目录包含上游标准 `.agents/skills` 和 `skills/`，直接安装会让 Desktop 同时发现 wrapper 与上游原生 skill。

正式本地验证使用干净发布包：

```powershell
.\install-codex-plugin.ps1
```

该 PowerShell 入口依赖 `node` 和可执行的 `codex` CLI；自动更新分支时还需要 `git`，但安装本身不依赖 Python。核心构建与本地 marketplace 更新逻辑仍在：

```powershell
node .codex-plugin\scripts\install-personal.js
```

构建完成后，入口脚本必须执行 `codex plugin add oh-story-skills@personal`，再通过 `codex plugin list` 确认状态为 `installed, enabled`。这是新版 Codex 的正式插件注册步骤，不能只依赖手工写入 `config.toml`。

如需跳过 git 更新，使用：

```powershell
.\install-codex-plugin.ps1 -SkipGitUpdate
```

安装脚本会先清理旧安装、旧缓存和早期误建的旧 junction，再安装最新包：

```text
%USERPROFILE%\plugins\oh-story-skills
%USERPROFILE%\.codex\plugins\cache\personal\oh-story-skills
%USERPROFILE%\.agents\plugins\plugins\oh-story-skills
```

安装目标：

```text
%USERPROFILE%\plugins\oh-story-skills
```

该目录由脚本生成，不是仓库根目录的 junction。发布包根目录的标准 `skills/` 只包含 Desktop wrapper；上游资料会被复制到：

```text
.codex-plugin/upstream-skills/
```

构建时源码 `codex-skills/` 会映射为发布包标准 `skills/`。这样 Codex UI 只会展示 Desktop wrapper；上游原生 Codex skill 会作为隐藏的执行资料源随包提供。

个人 marketplace 文件位于：

```text
%USERPROFILE%\.agents\plugins\marketplace.json
```

该 JSON 必须使用无 BOM UTF-8。若 Codex 日志出现 `invalid marketplace file ... expected value at line 1 column 1`，优先检查文件是否带 BOM。安装脚本会用 Node 写入 UTF-8，无 BOM。

Codex 配置中还需要注册：

```toml
[plugins."oh-story-skills@personal"]
enabled = true

[marketplaces.personal]
source_type = "local"
source = 'C:\Users\<your-user>'
```

具体安装命令见仓库根目录的 `CODEX_GUIDE.md`。

## 验证

```powershell
node .codex-plugin\scripts\check-overlay.js
```

检查内容包括：

- 上游 skill 与 Codex wrapper 集合完全一致
- 所有 wrapper 的 `agents/openai.yaml` 完整
- 源码仓库中的上游引用路径可解析
- 可生成顶层 `skills/` 仅包含 Desktop wrapper 的标准发布包
- 上游 Codex agents、hooks 和 references 已打包
- 插件版本与上游版本一致
- overlay 没有污染上游主体路径

## 设计原则

- Codex wrapper 是 Desktop 入口，不复制或重写上游工作流。
- 上游 `skills/` 是 Claude Code、OpenCode、Codex CLI 和 OpenClaw 的共同事实来源。
- wrapper 完整执行上游 Codex 路径，只补充 Codex Browser/web、`image_gen` 和 Desktop UI 元数据。
- `story-setup` 默认选择 `target_cli=codex`，部署上游 `.codex/agents`、hooks、`AGENTS.md` 和 references。
