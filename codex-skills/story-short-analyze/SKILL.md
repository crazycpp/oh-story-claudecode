---
name: story-short-analyze
description: Codex 短篇拆文入口。执行上游最新材料边界、情绪反转分析、输出协议和 Codex fallback 流程。
---

# story-short-analyze for Codex Desktop

Upstream skill: `../../skills/story-short-analyze/SKILL.md`

## Source Of Truth

Read the upstream skill completely and follow its current Codex-compatible pipeline. Material validation, story-core analysis, emotional arc, reversal chain, craft extraction, output contracts, and quality checks are authoritative.

## Desktop Additions

- Use project files and deployed Codex agents when the upstream workflow calls for them.
- Keep analysis artifacts resumable and traceable to source material.

## Fallback

If custom agents are unavailable, complete the upstream direct/solo analysis and report the fallback without dropping required outputs.
