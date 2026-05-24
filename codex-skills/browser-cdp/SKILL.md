---
name: browser-cdp
description: Codex 浏览器辅助工作流。默认优先使用 Codex 浏览器或网页检索能力；只有用户明确要求本地 CDP 兼容路径时才参考上游 browser-cdp 资料。
---

# browser-cdp for Codex

Upstream skill: `../../skills/browser-cdp/SKILL.md`

## Codex Default

Use Codex Browser or web tools for opening pages, clicking, typing, screenshots, and page inspection. Keep the interaction in the current Codex session and report what was verified.

## Upstream Material

Read the upstream skill only when the user explicitly needs local Chrome CDP compatibility details. Do not require local browser CLI setup for normal Codex use.

## Compatibility

If the user explicitly asks for legacy/compatibility browser automation, summarize the upstream path and ask for any required local setup before using it.
