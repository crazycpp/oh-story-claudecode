---
name: story-short-scan
description: Codex 短篇网文扫榜入口。执行上游最新平台采集和风口分析流程，Desktop 优先 Browser/web。
---

# story-short-scan for Codex Desktop

Upstream skill: `../../skills/story-short-scan/SKILL.md`

## Source Of Truth

Read the upstream skill completely and follow its current platform targets, browser collection rules, data cleaning, report contract, and opportunity analysis.

## Desktop Additions

- Prefer Codex Browser/web for current public data and source verification.
- Use upstream scripts where they provide reliable structured collection.
- Use `$browser-cdp` for login state or browser-only platforms.
- Separate source facts from interpretation and cite current web sources.

## Fallback

If live data cannot be collected, use user-provided samples or clearly labeled historical hypotheses. Never imply a historical sample is a current ranking.
