---
name: story
description: oh-story 网文工具箱的 Codex 主入口。根据用户需求自动路由到对应的 Codex 原生包装技能，并复用上游 skill 资料。
---

# story for Codex

Upstream skill: `../../skills/story/SKILL.md`

## Codex Default

Classify the user's intent, then continue with the matching Codex wrapper:

| Intent | Wrapper |
|---|---|
| Project setup | `$story-setup` |
| Long-form market scan | `$story-long-scan` |
| Short-form market scan | `$story-short-scan` |
| Long-form analysis | `$story-long-analyze` |
| Short-form analysis | `$story-short-analyze` |
| Long-form writing | `$story-long-write` |
| Short-form writing | `$story-short-write` |
| Review | `$story-review` |
| De-AI polish | `$story-deslop` |
| Import existing story | `$story-import` |
| Cover generation | `$story-cover` |

If the intent is clear, proceed directly. If the request mixes multiple phases, propose the shortest ordered workflow and start with the first useful step.

## Upstream Material

Use the upstream router as domain context only. Codex routing should name `$skill` wrappers instead of platform-specific invocation syntax.

## Compatibility

Claude/OpenClaw compatibility remains in upstream `skills/`. Codex defaults to the wrappers in `codex-skills/`.
