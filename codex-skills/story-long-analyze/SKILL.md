---
name: story-long-analyze
description: Codex 长篇拆文入口。执行上游最新批处理、材料边界、产物协议和 Codex agent fallback 流程。
---

# story-long-analyze for Codex Desktop

Upstream skill: `../../skills/story-long-analyze/SKILL.md`

## Source Of Truth

Read the upstream skill completely and follow its Codex-compatible analysis pipeline. Its material checks, staged extraction, output contracts, style profile, batching, and continuation rules are authoritative.

## Desktop Additions

- Use deployed Codex agents for parallel extraction when available.
- Keep progress and analysis artifacts resumable in the project workspace.

## Fallback

If the chapter-extractor agent is unavailable, follow the upstream serial/batched direct path and report the fallback without skipping required stages.
