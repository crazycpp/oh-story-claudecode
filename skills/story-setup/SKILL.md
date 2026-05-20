---
name: story-setup
version: 1.0.0
description: |
  网文写作项目初始化。Codex 默认创建小说项目目录、追踪文件和写作规则；Claude/OpenClaw 基础设施部署作为兼容路径保留。
  触发方式：/story-setup、「准备写书」「帮我搭一下环境」「配置写作项目」
metadata:
  openclaw:
    source: https://github.com/worldwonderer/oh-story-claudecode
---

# story-setup：网文写作项目初始化

你是写作项目初始化助手。Codex 默认路径只创建小说项目结构和通用写作资料，不写入 `.claude/*`，不注册 hooks，不生成 Claude agents。

**执行铁律：不覆盖用户已有内容，新增或合并前先识别现有结构。**

## Codex 默认路径

### Phase 1：确认项目参数

确认以下信息：

- 项目目录：默认当前目录，或用户指定目录。
- 书名：未指定时先询问。
- 篇幅：长篇或短篇。
- 目标平台：起点、番茄、晋江、知乎盐言、七猫等；未指定可写“待定”。
- 作者名：未指定用“作者”。

不要要求 Bash、Claude Code、OpenClaw、hooks 或 agents。

### Phase 2：创建目录结构

长篇默认结构：

```text
{书名}/
  大纲/
  设定/
  角色/
  正文/
  追踪/
  对标/
  拆文库/
```

短篇默认结构：

```text
{书名}/
  设定/
  大纲/
  正文.md
  追踪/
  对标/
```

如果目录已存在，只补齐缺失目录，不删除、不重命名用户文件。

### Phase 3：创建基础追踪文件

按篇幅创建或补齐：

长篇：

- `追踪/上下文.md`：当前进度、活跃角色、未回收伏笔、近期章节摘要。
- `追踪/伏笔.md`：伏笔、埋点章节、回收计划、状态。
- `追踪/设定索引.md`：世界观、规则、地点、组织索引。
- `追踪/写作日志.md`：日期、目标、完成内容、下一步。

短篇：

- `追踪/上下文.md`：核心情绪、已揭示信息、未回收伏笔、下一节衔接。
- `追踪/修改记录.md`：问题、修改策略、版本。

### Phase 4：创建写作规则说明

创建 `写作规则.md`，至少包含：

- 目标平台与读者预期。
- 正文格式规则。
- 角色与设定一致性规则。
- 去 AI 味和禁用词检查规则。
- 每次写作前后需要更新的追踪文件。

可参考 `references/templates/rules/` 中的规则文本，但 Codex 默认不要复制到 `.claude/rules/`。

### Phase 5：输出安装报告

报告必须列出：

- 已创建或已存在的目录。
- 已创建或已保留的文件。
- 下一步建议：长篇用 `$story-long-write`，短篇用 `$story-short-write`，已有正文用 `$story-import` 或 `$story-review`。
- 明确说明：Codex 默认路径未创建 `.claude` 目录。

## Legacy/Claude Compatibility：Claude/OpenClaw 基础设施部署

仅当用户明确要求 Claude Code / OpenClaw 兼容模式时，才部署旧基础设施：

- 保留原 `.claude/hooks` 部署。
- 保留 `.claude/agents` 部署。
- 保留 `CLAUDE.md` 写入和合并。
- 保留 `.claude/settings.local.json` hooks 注册合并。
- 保留 `.story-deployed` 标记及 `UPGRADING.md` 版本检查。

兼容模式仍遵守“不覆盖用户已有配置，合并而非替换”。相关模板位于：

| 文件 | 用途 |
|---|---|
| references/templates/CLAUDE.md.tmpl | Claude 项目根说明模板 |
| references/templates/hooks/ | Claude hook 脚本模板 |
| references/templates/rules/ | Claude path-scoped 规则模板 |
| references/templates/agents/ | Claude agent 定义模板 |
| references/templates/settings-hooks.json | Claude hooks 注册片段 |
| references/templates/上下文.md.tmpl | 写作上下文模板 |

## 重新初始化

- Codex 项目结构已存在：只补齐缺失文件，并在报告中列出跳过项。
- `.story-deployed` 已存在：视为 legacy 部署标记；Codex 默认不因此要求继续维护 `.claude` 目录。
- 用户要求兼容模式升级：按 `UPGRADING.md` 检查版本并执行 legacy 合并策略。
