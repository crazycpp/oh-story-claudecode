---
name: story-review
description: Codex 故事审查入口。执行上游最新 full/lean/solo 模式、确定性检测、Codex agents 和 fallback 流程。
---

# story-review for Codex Desktop

Upstream skill: `../../skills/story-review/SKILL.md`

## Source Of Truth

Read the upstream skill completely and follow its Codex-compatible review pipeline. Agent validation, mode selection, rubric loading, findings schema, continuity checks, deterministic scripts, and final arbitration are authoritative.

## Desktop Additions

- Use deployed Codex custom agents with matching `agent_type` when the runtime exposes them.
- Use Codex Browser/web only for optional external fact checks, not as a substitute for reading project files.

## Fallback

If agents are unavailable or invalid, use the upstream lean/solo downgrade rules and report the effective mode. A fallback must still produce the required structured review.
