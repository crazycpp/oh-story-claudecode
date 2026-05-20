# Codex 用户使用指南

本文面向在 Codex 中使用 `oh-story-claudecode` 的用户，说明如何安装、验证和调用本仓库的网文写作技能。

## 1. 这是什么

`oh-story-claudecode` 已改造为 Codex 原生插件/技能包，包含 13 个 skill，覆盖：

- 网文工具箱路由
- 长篇/短篇扫榜
- 长篇/短篇拆文
- 长篇/短篇写作
- 审稿
- 去 AI 味
- 已有小说导入
- 封面生成
- legacy 浏览器 CLI 后端

Codex 默认路径不依赖 `.claude` 目录、Claude subagent、hooks、`agent-browser` 或 `GPT_IMAGE_API_KEY`。

## 2. 安装方式

### 方式 A：作为 Codex plugin 识别

仓库根目录包含：

```text
.codex-plugin/plugin.json
skills/
```

Codex 可通过 `.codex-plugin/plugin.json` 识别该仓库，加载 `./skills/` 下的 13 个 skill。

### 方式 B：复制技能到本机 Codex skills 目录

如果你想直接把当前仓库中的技能安装到本机 Codex：

```powershell
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME 'skills' } else { Join-Path $HOME '.codex\skills' }
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Get-ChildItem -Directory 'skills' | ForEach-Object {
  $target = Join-Path $dest $_.Name
  if (!(Test-Path $target)) {
    Copy-Item -LiteralPath $_.FullName -Destination $target -Recurse
  }
}
```

安装后重启 Codex，使新 skills 生效。

## 3. 安装后验证

确认 13 个 skill 都已安装：

```powershell
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME 'skills' } else { Join-Path $HOME '.codex\skills' }
Get-ChildItem -Directory $dest | Where-Object {
  Test-Path (Join-Path $_.FullName 'SKILL.md')
} | Select-Object -ExpandProperty Name
```

预期能看到：

```text
browser-cdp
story
story-cover
story-deslop
story-import
story-long-analyze
story-long-scan
story-long-write
story-review
story-setup
story-short-analyze
story-short-scan
story-short-write
```

验证插件 manifest：

```powershell
py -3 "C:/Users/windknife/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py" .
```

预期输出：

```text
Plugin validation passed: <仓库路径>
```

验证 JS 脚本语法：

```powershell
$failed = $false
Get-ChildItem -Recurse -Filter *.js skills | ForEach-Object {
  node --check $_.FullName
  if ($LASTEXITCODE -ne 0) { $failed = $true }
}
if ($failed) { exit 1 }
```

无输出且退出码为 0 表示通过。

## 4. 最常用入口

### 总入口

```text
$story 帮我规划一本都市爽文
```

`$story` 会根据你的需求路由到具体能力，例如写长篇、写短篇、拆文、扫榜、审稿或封面。

### 项目初始化

```text
$story-setup 为《暗线》创建 Codex 默认项目结构
```

Codex 默认会创建小说项目目录、追踪文件和写作规则说明，不会创建 `.claude` 目录，也不会注册 hooks。

### 长篇写作

```text
$story-long-write 帮我开一本都市异能爽文，目标平台番茄
```

适合做长篇选题、核心梗、人物、世界观、大纲和章节正文。

### 短篇写作

```text
$story-short-write 写一篇知乎盐言风格短篇，主题是婚姻反转
```

适合做短篇情绪目标、反转设计、小节大纲和完整正文。

### 审稿

```text
$story-review 审查下面这几章的问题，并按严重级别输出修改建议
```

Codex 默认单会话完成四维审查：

- 故事结构
- 角色关系
- 文学表达
- 设定一致性

### 去 AI 味

```text
$story-deslop 帮我去掉这段正文的 AI 味，保持剧情信息不变
```

适合处理套路句、抽象心理描写、句式重复、信息密度低等问题。

### 封面生成

```text
$story-cover 给《剑骨长明》生成一张玄幻封面，作者名是青岚
```

Codex 默认使用 `image_gen` 能力，不要求配置 `GPT_IMAGE_API_KEY`。

### 扫榜

```text
$story-long-scan 分析起点最近适合新人切入的题材
$story-short-scan 分析知乎盐言短篇近期情绪风口
```

Codex 默认优先使用 Browser / web 能力或用户提供的数据。`agent-browser` 只作为 legacy CLI 后端。

### 拆文

```text
$story-long-analyze 拆解这本长篇的黄金三章
$story-short-analyze 拆解这个短篇的情绪曲线和反转结构
```

适合把对标作品拆成可复用的剧情模块、角色功能位和节奏方法。

### 导入已有小说

```text
$story-import 把我已有的小说导入成可继续写作的项目结构
```

适合把半成品或完本反向整理为设定、角色、大纲、追踪文件和正文索引。

## 5. 推荐工作流

### 从零开始写长篇

```text
$story-setup 为《书名》创建长篇项目
$story-long-scan 看看目标平台最近什么题材适合切入
$story-long-analyze 拆解 2-3 本对标书的黄金三章
$story-long-write 生成题材定位、核心梗、人物和大纲
$story-long-write 写第 1 章
$story-review 审查第 1 章的问题
$story-deslop 精修第 1 章
```

### 从零开始写短篇

```text
$story-setup 为《短篇标题》创建短篇项目
$story-short-scan 分析近期短篇情绪风口
$story-short-analyze 拆一个对标短篇
$story-short-write 生成构思、小节大纲和正文
$story-review 审查全文
$story-deslop 精修全文
```

### 已有小说继续写

```text
$story-import 导入已有小说
$story-review 审查当前章节和设定一致性
$story-long-write 继续写下一章
```

## 6. Codex 默认路径和 legacy 路径的区别

| 能力 | Codex 默认路径 | Legacy/Claude/OpenClaw 路径 |
|---|---|---|
| 项目初始化 | 创建项目结构、追踪文件、写作规则 | 部署 `.claude/hooks`、`.claude/agents`、`CLAUDE.md` |
| 写作 | 当前 Codex 会话分阶段写作 | 可选 Claude subagent |
| 审稿 | 当前 Codex 会话四维审查 | 可选 4 Agent 并行审查 |
| 扫榜/浏览器 | Codex Browser / web 优先 | 可选 `agent-browser` CLI |
| 封面 | Codex `image_gen` 优先 | 可选 `curl + GPT_IMAGE_API_KEY` |

如果你只是 Codex 用户，优先使用默认路径即可。

## 7. 常见问题

### Codex 没识别到新 skill

先确认 skill 已复制到：

```text
%USERPROFILE%\.codex\skills
```

然后重启 Codex。

### `$story-cover` 要不要配置 API key

不需要。Codex 默认使用 `image_gen`。只有 legacy CLI/API 后端才需要 `GPT_IMAGE_API_KEY`。

### `$story-setup` 会不会写 `.claude`

Codex 默认不会。只有你明确要求 Claude/OpenClaw 兼容模式时，才会使用 `.claude` 相关路径。

### 扫榜是否一定需要浏览器 CLI

不需要。Codex 默认优先使用 Browser / web 能力。`browser-cdp` 和 `agent-browser` 是 legacy CLI 后端。

### 能不能直接用自然语言

可以。比如：

```text
我想写一本都市爽文，帮我从选题开始规划
```

如果 Codex 能隐式识别到 `story` skill，它会按 `$story` 路由处理；不确定时建议显式写 `$story`。

