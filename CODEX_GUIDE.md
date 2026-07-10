# Codex 使用指南

本分支通过非侵入式 overlay 支持 Codex Desktop。上游 `skills/` 是 Claude Code、OpenCode、Codex CLI 和 OpenClaw 共用的事实来源；`codex-skills/` 只提供 Desktop 插件入口、UI 元数据和工具能力补充。

## 1. 推荐安装方式

推荐安装“干净 Codex 包”，不要把仓库根目录直接作为 Codex 插件目录。仓库根目录包含上游 `skills/`，Codex 当前版本可能会自动扫描它，从而在 UI 中同时显示 Codex wrapper 和 legacy skill。

在仓库根目录运行：

```powershell
.\install-codex-plugin.ps1
```

该 PowerShell 脚本只依赖 `node` 和 `git`，不依赖 Python。它会先更新本地 `codex/main`，再调用：

```powershell
node .codex-plugin\scripts\install-personal.js
```

如果只想安装当前工作区内容，不自动拉取远程分支：

```powershell
.\install-codex-plugin.ps1 -SkipGitUpdate
```

安装器会先清理旧安装和旧缓存，然后生成并安装最新干净包。会清理的路径包括：

```text
%USERPROFILE%\plugins\oh-story-skills
%USERPROFILE%\.codex\plugins\cache\personal\oh-story-skills
%USERPROFILE%\.agents\plugins\plugins\oh-story-skills
```

然后安装到：

```text
%USERPROFILE%\plugins\oh-story-skills
```

这个目录是一个干净发布包，主要包含：

```text
.codex-plugin/
skills/
CODEX_GUIDE.md
docs/
LICENSE
```

上游资料会被复制到：

```text
.codex-plugin/upstream-skills/
```

发布包根目录的标准 `skills/` 只包含 Desktop wrapper；上游原始 skills 隐藏在 `.codex-plugin/upstream-skills/`。因此 Codex UI 只显示一套 wrapper，同时 wrapper 会完整执行上游原生 Codex 流程。

## 2. Codex 配置

安装脚本会更新个人 marketplace：

```text
%USERPROFILE%\.agents\plugins\marketplace.json
```

还需要确认 `%USERPROFILE%\.codex\config.toml` 中包含：

```toml
[plugins."oh-story-skills@personal"]
enabled = true

[marketplaces.personal]
source_type = "local"
source = 'C:\Users\<your-user>'
```

其中 `source` 指向你的用户目录，因为 Codex 会从这里读取：

```text
%USERPROFILE%\.agents\plugins\marketplace.json
%USERPROFILE%\plugins\oh-story-skills
```

安装后重启 Codex，或刷新个人插件列表。

如果 Codex 已经打开，建议完整退出后重新启动。这样可以确保旧版本缓存被释放，并读取新生成的干净包。

## 3. 验证

在仓库根目录运行：

```powershell
node .codex-plugin\scripts\check-overlay.js
```

预期输出：

```text
Codex overlay check passed
```

这个检查会验证：

- `.codex-plugin/plugin.json` 指向 `./codex-skills/`
- 所有上游 skill 都有同名 Codex wrapper
- 所有 wrapper 都有 `agents/openai.yaml`
- wrapper 在源码仓库中引用的上游 `skills/<skill>/SKILL.md` 路径可解析
- 插件版本与上游版本一致
- 上游 Codex agents、hooks 和 references 已进入干净包
- 可生成仅以顶层 `skills/` 暴露 Desktop wrapper 的标准 Codex 包
- `codex/main` 相对 `main` 只改动 overlay 路径

如果只想生成发布包而不安装：

```powershell
node .codex-plugin\scripts\build-codex-package.js --out .\dist\oh-story-skills-codex
```

`dist/` 是临时构建产物，不需要提交。

## 4. 常用入口

```text
$story 帮我规划一本网文
$story-setup 为《暗线》部署 Codex 项目结构、agents 和 hooks
$story-long-scan 看看最近起点的流行长篇小说
$story-long-write 帮我开一本长篇玄幻
$story-short-write 写一篇知乎盐言风格短篇
$story-review 审查下面几章的问题
$story-cover 给这本书生成封面
```

也可以直接用自然语言描述需求。如果 Codex 没有自动识别到正确 skill，建议显式写 `$story` 或具体 `$story-*` 入口。

## 5. 默认路径

- 写作、拆文、审查、导入和去 AI 味：由当前 Codex 会话分阶段完成。
- 扫榜和网页数据：优先使用 Codex Browser 或 web 能力。
- 封面：优先使用 Codex `image_gen`。
- 项目初始化：默认执行上游 `target_cli=codex`，合并部署 `AGENTS.md`、`.codex/agents/`、`.codex/hooks.json`、Python hook 和项目 references；不会写入 Claude 专属基础设施，除非用户明确选择多端部署。

## 6. 开发调试说明

源码仓库仍保留：

```text
.codex-plugin/plugin.json
codex-skills/
skills/
```

`.codex-plugin/plugin.json` 指向 `./codex-skills/`。每个 wrapper 必须完整读取上游 `skills/<skill>/SKILL.md`，执行其中的 Codex 路径，并按需加载 references/scripts；wrapper 不再维护独立写作流程。

不要把源码仓库根目录长期作为 Codex 插件安装目录。源码根目录的 `skills/` 是上游原生实现，正式发布包会把 `codex-skills/` 映射成标准 `skills/`，并隐藏上游资料，从而只显示一套入口。日常使用请运行 `install-codex-plugin.ps1` 安装干净包。

## 7. 维护原则

- 不在 overlay 中复制上游工作流；上游 `skills/` 是 Codex 执行逻辑的事实来源。
- Codex 专属说明放在 `codex-skills/`、`CODEX_GUIDE.md` 和 `docs/`。
- 上游更新时先更新 `main`，再把 `codex/main` rebase 到 `main`。
- 如果需要平台无关修复，优先提交给 upstream，减少 fork 长期差异。
