---
name: story-deslop
description: Codex 网文去 AI 味入口。执行上游最新删除优先、退化检测、文风保护和 agent fallback 流程。
---

# story-deslop for Codex Desktop

Upstream skill: `../../skills/story-deslop/SKILL.md`

## Source Of Truth

Read the upstream skill completely and execute its Codex-compatible workflow. Its deletion-first policy, anti-gaming rules, deterministic scripts, quality gates, and project-file contracts are authoritative.

## Desktop Additions

- Use deployed Codex agents when available.
- Run upstream deterministic checks and normalization scripts when the task and workspace permit them.

## Fallback

If the narrative-writer agent is missing or unavailable, follow the upstream direct/solo path and preserve story facts, continuity, intentional style, and word-count constraints.
