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

不要把仓库根目录直接作为正式 Codex 插件目录。仓库根目录保留了上游 `skills/`，Codex 当前版本可能会自动扫描该目录，导致 UI 同时出现 Codex wrapper 和上游 legacy skill。

正式本地验证使用干净发布包：

```powershell
node .codex-plugin\scripts\install-personal.js
```

该脚本会先清理旧安装、旧缓存和早期误建的旧 junction，再安装最新包：

```text
%USERPROFILE%\plugins\oh-story-skills
%USERPROFILE%\.codex\plugins\cache\personal\oh-story-skills
%USERPROFILE%\.agents\plugins\plugins\oh-story-skills
```

安装目标：

```text
%USERPROFILE%\plugins\oh-story-skills
```

该目录由脚本生成，不是仓库根目录的 junction。发布包根目录不包含 `skills/`；上游资料会被复制到：

```text
.codex-plugin/upstream-skills/
```

这样 Codex UI 只会展示 `codex-skills/` 中的 Codex-native wrapper。

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

- Codex wrapper 完整
- `agents/openai.yaml` 完整
- 源码仓库中的上游引用路径可解析
- 可生成不含顶层 `skills/` 的干净发布包
- overlay 没有污染上游主体路径

## 设计原则

- Codex wrapper 是入口和执行策略，不复制上游 reference 内容。
- 上游 `skills/` 仍是 Claude/OpenClaw 原生实现和资料源。
- Codex 默认使用当前会话、Codex Browser/web、`image_gen`。
- 兼容路径只作为说明，不作为 Codex 默认执行要求。
