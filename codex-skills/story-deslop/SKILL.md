---
name: story-deslop
description: Codex 原生网文去 AI 味流程。在保留剧情事实的前提下，清理模板化、机械化和 AI 感表达。
---

# story-deslop for Codex

Upstream skill: `../../skills/story-deslop/SKILL.md`

## Codex Default

Polish in the current Codex session:

1. Identify repeated sentence patterns, abstract emotion labels, low-information transitions, and generic AI-like phrasing.
2. Preserve plot facts, timeline, character intent, relationships, and POV.
3. Rewrite only the requested scope.
4. Provide a concise change summary and any remaining risk.

## Upstream Material

Before rewriting, read the upstream skill and relevant references such as `../../skills/story-deslop/references/anti-ai-writing.md` and banned-word guidance.

## Compatibility

Legacy/compatibility agent execution is optional upstream. Codex must be able to finish the polish in the current session.
