---
name: story-import
description: Codex 小说导入入口。执行上游最新长短篇分流、项目交付物、状态追踪和 Codex agent fallback 流程。
---

# story-import for Codex Desktop

Upstream skill: `../../skills/story-import/SKILL.md`

## Source Of Truth

Read the upstream skill completely and follow its Codex-compatible import pipeline. The upstream source classification, long/short routing, artifact contracts, project layout, state tracking, validation, and continuation handoff are authoritative.

## Desktop Additions

- Use deployed Codex agents when available for extraction and verification.
- Keep all generated artifacts inside the user-selected project directory.

## Fallback

If custom agents are unavailable, run the upstream serial/direct path and report the fallback. Do not reduce the required deliverables.
