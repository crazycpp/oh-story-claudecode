---
name: story-long-scan
description: Codex 长篇网文扫榜入口。执行上游最新采集、清洗和选题决策流程，Desktop 优先 Browser/web。
---

# story-long-scan for Codex Desktop

Upstream skill: `../../skills/story-long-scan/SKILL.md`

## Source Of Truth

Read the upstream skill completely and follow its current platform targets, data-quality rules, scraper contracts, report format, and topic-decision workflow.

## Desktop Additions

- Prefer Codex Browser/web for current public ranking data and source verification.
- Use upstream scripts when they provide more reliable structured data.
- Use `$browser-cdp` only for platforms requiring login state, browser execution, or anti-bot workarounds.
- Separate observed facts from inference and cite current sources when web data is used.

## Fallback

If live collection is unavailable, analyze user-provided data or clearly label historical/reference-based hypotheses. Never present stale knowledge as a live ranking.
