---
name: story-setup
description: Codex 原生小说项目初始化流程。默认创建通用写作结构，不写入 Claude 专属基础设施。
---

# story-setup for Codex

Upstream skill: `../../skills/story-setup/SKILL.md`

## Codex Default

Create or repair a generic story project structure:

```text
设定/
角色/
大纲/
正文/
追踪/
对标/
拆文库/
```

Add practical starter files only when useful:

- project overview
- character index
- setting notes
- outline placeholder
- progress tracker
- writing rules

Do not create Claude-specific infrastructure in the Codex default path.

## Upstream Material

Read upstream setup guidance and templates for domain content. Reuse rule text when helpful, but write it into generic project files unless the user asks for compatibility setup.

## Compatibility

Legacy/compatibility setup remains upstream for users who explicitly want Claude/OpenClaw infrastructure.
