---
name: story
description: oh-story 网文工具箱的 Codex 主入口。复用上游最新路由、版本检查、多书切换和 Codex fallback 规则。
---

# story for Codex Desktop

Upstream skill: `../../skills/story/SKILL.md`

## Source Of Truth

Before routing or acting, read the upstream skill completely and follow its Codex branch. The upstream routing table, project-state detection, multi-book switching, version checks, and agent fallback rules are authoritative.

## Desktop Additions

- Invoke child skills with `$story-*` names exposed by this plugin.
- Prefer Codex Browser/web and `image_gen` when a routed skill identifies those Desktop capabilities.
- Version checks remain notify-only. Never update the repository or installed plugin without user confirmation.

## Fallback

If a custom Codex agent is unavailable or returns `unknown agent_type`, follow the upstream direct/solo fallback and report it without failing the whole workflow.
