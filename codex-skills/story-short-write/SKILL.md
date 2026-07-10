---
name: story-short-write
description: Codex 短篇网文写作入口。执行上游最新短篇参考栈、投稿工艺、质量检测、Codex agents 和 fallback 流程。
---

# story-short-write for Codex Desktop

Upstream skill: `../../skills/story-short-write/SKILL.md`

## Source Of Truth

Read the upstream skill completely before acting and follow its Codex-compatible workflow. The current short-format, short-craft, short-deslop, submission-craft, genre-style, output-contract, deterministic-check, and revision rules are authoritative.

## Desktop Additions

- Use deployed Codex custom agents with matching `agent_type` when available.
- Keep project state and generated fiction within the selected workspace.

## Fallback

If custom agents are unavailable, follow the upstream direct/solo path and report it. Do not restore removed long-form references or use the old independent short-writing workflow.
