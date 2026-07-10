---
name: browser-cdp
description: Codex 浏览器辅助工作流。普通网页操作优先使用 Codex Browser 或 web；需要复用本机登录态时执行上游 CDP 流程。
---

# browser-cdp for Codex Desktop

Upstream skill: `../../skills/browser-cdp/SKILL.md`

## Source Of Truth

Before acting, read the upstream skill completely. Follow its CDP workflow when the task requires an existing local Chrome session, login state, cookies, tokens, or browser-only data.

## Desktop Additions

- Prefer Codex Browser or web for public pages, navigation, clicking, screenshots, and inspection that do not require the user's local Chrome profile.
- Use the upstream `agent-browser`/CDP path only when local authentication or an existing browser session is required, or when the user explicitly requests CDP.
- Keep the upstream timeout, token-safety, and data-minimization rules.

## Fallback

If Codex Browser is unavailable, use upstream CDP when its prerequisites exist. Otherwise explain the missing capability and ask for a URL, pasted data, or screenshot instead of inventing results.
