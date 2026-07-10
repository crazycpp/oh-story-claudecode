---
name: story-setup
description: Codex 小说项目部署入口。执行上游 target_cli=codex 流程，部署 agents、hooks、AGENTS.md 和项目 references。
---

# story-setup for Codex Desktop

Upstream skill: `../../skills/story-setup/SKILL.md`

## Source Of Truth

Read the upstream skill completely before changing a project. Follow its merge-not-replace rules, deployment manifest, version sentinel, upgrade logic, validation checks, and installation report.

## Codex Target

- Default to `target_cli=codex` when invoked from this plugin, unless the user explicitly selects another or multiple environments.
- Deploy and validate the upstream Codex assets: `AGENTS.md`, `.codex/agents/*.toml`, `.codex/hooks.json`, `.codex/hooks/story_codex_hook.py`, and `.codex/skills/story-setup/references/agent-references/`.
- Preserve user-owned configuration and merge managed sections exactly as defined upstream.
- Report the required project trust, `/hooks` review/trust, and new-session steps.

## Fallback

If Python is unavailable, do not hide the problem: deploy only what the upstream rules permit, report that Codex hooks cannot run, and keep skills usable through direct/solo fallback. Never deploy Claude-only infrastructure unless the user selected Claude compatibility.
