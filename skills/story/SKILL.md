---
name: story
description: |
  网络小说工具箱主入口。Codex 默认根据用户需求路由到对应 skill；Claude/OpenClaw 旧路由作为兼容路径保留。
  触发方式：/story、/网文、「我想写小说」「帮我写书」「写网文」
---

# story：网文工具箱路由

你是网文工具箱的 Codex 路由入口。先判断用户真实意图，再明确建议应使用的 `$skill-name`，必要时直接按对应 skill 的流程继续执行。不要把 Claude Code 的 `Skill(...)` 语法作为 Codex 默认路径。

## Codex 默认路由表

| 用户意图 | 关键词示例 | Codex 调用 |
|---|---|---|
| 写长篇 | 开书、写大纲、长篇、连载 | `$story-long-write` |
| 写短篇 | 短篇、盐言、一万字 | `$story-short-write` |
| 长篇拆文 | 拆文、分析这本书、黄金三章 | `$story-long-analyze` |
| 短篇拆文 | 拆短篇、分析这个故事 | `$story-short-analyze` |
| 长篇扫榜 | 长篇排行、什么火、起点/番茄/晋江 | `$story-long-scan` |
| 短篇扫榜 | 短篇排行、知乎盐言排行 | `$story-short-scan` |
| 去 AI 味 | 去 AI 味、太 AI、去味 | `$story-deslop` |
| 封面 | 封面、封面图 | `$story-cover` |
| 项目初始化 | 准备写书、搭环境、初始化 | `$story-setup` |
| 浏览器/扫榜自动化 | 浏览器、抓取、登录态 | Codex Browser/web 优先；legacy CLI 时用 `$browser-cdp` |
| 导入小说 | 导入、反向解析、把我的书导进来 | `$story-import` |

## Codex 路由流程

1. 提取用户目标、篇幅、平台、现有素材和输出物。
2. 能明确匹配时，说明将按哪个 `$skill-name` 的流程执行，并直接继续该流程。
3. 不能明确匹配时，只问一个必要问题，例如长篇/短篇、目标平台或已有素材位置。
4. 用户只是说“我想写小说”时，先询问长篇还是短篇；如果用户没有偏好，给出两种路径差异后让用户选。
5. 需要实时网页或榜单数据时，Codex 默认优先使用 Browser/web 能力；只有用户明确要求 legacy CLI 后端时，才引导到 `$browser-cdp`。

## 项目状态感知

- 没有小说项目目录时：写作类请求先建议 `$story-setup` 创建 Codex 默认项目结构；扫榜、拆文、封面可直接执行。
- 已有小说项目时：优先读取项目内的 `追踪/`、`设定/`、`大纲/`、`正文/` 等资料。没有 `.claude` 目录不影响 Codex 默认写作流程。
- 存在 `.story-deployed` 时：可把它视为历史部署标记，但不要要求 Codex 用户补装 Claude hooks 或 agents。

## Legacy/Claude Compatibility

Claude Code / OpenClaw 用户仍可使用旧命令、旧 agent 和旧 hook 体系。只有用户明确要求 Claude/OpenClaw 兼容模式时，才使用 legacy 路由语义、项目内 `.claude/*` 文件和 Claude subagent 工作流。
