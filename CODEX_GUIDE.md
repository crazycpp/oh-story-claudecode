# Codex 使用指南

本分支通过非侵入式 overlay 支持 Codex。上游 `skills/` 目录保持原样，用于同步 upstream 和兼容 Claude/OpenClaw；Codex 默认只加载 `codex-skills/` 下的 wrapper。

## 1. 推荐安装方式

推荐安装“干净 Codex 包”，不要把仓库根目录直接作为 Codex 插件目录。仓库根目录包含上游 `skills/`，Codex 当前版本可能会自动扫描它，从而在 UI 中同时显示 Codex wrapper 和 legacy skill。

在仓库根目录运行：

```powershell
node .codex-plugin\scripts\install-personal.js
```

脚本会先清理旧安装和旧缓存，然后生成并安装最新干净包。会清理的路径包括：

```text
%USERPROFILE%\plugins\oh-story-skills
%USERPROFILE%\.codex\plugins\cache\personal\oh-story-skills
%USERPROFILE%\.agents\plugins\plugins\oh-story-skills
```

然后安装到：

```text
%USERPROFILE%\plugins\oh-story-skills
```

这个目录是一个干净发布包，只包含：

```text
.codex-plugin/
codex-skills/
CODEX_GUIDE.md
docs/
LICENSE
```

上游资料会被复制到：

```text
.codex-plugin/upstream-skills/
```

因此发布包根目录不会出现 `skills/`，Codex UI 只会显示 Codex-native 那套 skill。

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
- 13 个 Codex wrapper 都存在
- 13 个 `agents/openai.yaml` 都存在
- wrapper 在源码仓库中引用的上游 `skills/<skill>/SKILL.md` 路径可解析
- 可生成不含顶层 `skills/` 的干净 Codex 包
- `codex/main` 相对 `main` 只改动 overlay 路径

如果只想生成发布包而不安装：

```powershell
node .codex-plugin\scripts\build-codex-package.js --out .\dist\oh-story-skills-codex
```

`dist/` 是临时构建产物，不需要提交。

## 4. 常用入口

```text
$story 帮我规划一本网文
$story-setup 为《暗线》创建 Codex 默认项目结构
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
- 项目初始化：默认只创建通用小说项目结构、追踪文件和写作规则，不写 Claude 专属基础设施。

## 6. 开发调试说明

源码仓库仍保留：

```text
.codex-plugin/plugin.json
codex-skills/
skills/
```

`.codex-plugin/plugin.json` 指向 `./codex-skills/`。每个 wrapper 会按需读取上游 `skills/<skill>/SKILL.md` 和 `skills/<skill>/references/`，但不会改写上游 skill 主体。

不要把源码仓库根目录长期作为 Codex 插件安装目录。这样虽然方便开发，但 Codex 可能会扫描顶层 `skills/`，导致 UI 出现两套 skill。日常使用请运行 `install-personal.js` 安装干净包。

## 7. 维护原则

- 不在上游 `skills/` 中写入大段 Codex 逻辑。
- Codex 专属说明放在 `codex-skills/`、`CODEX_GUIDE.md` 和 `docs/`。
- 上游更新时先更新 `main`，再把 `codex/main` rebase 到 `main`。
- 如果需要平台无关修复，优先提交给 upstream，减少 fork 长期差异。
