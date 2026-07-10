---
name: story-cover
description: Codex 小说封面生成入口。复用上游封面需求、风格和平台尺寸规则，并优先使用 Desktop image_gen。
---

# story-cover for Codex Desktop

Upstream skill: `../../skills/story-cover/SKILL.md`

## Source Of Truth

Read the upstream skill completely before generating. Reuse its requirements gathering, title/author checks, genre styles, platform dimensions, typography guidance, cropping rules, and delivery checks.

## Desktop Additions

- When `image_gen` is available, use it as the default generation backend.
- Do not require `GPT_IMAGE_API_KEY`, `curl`, `jq`, or `base64` for the Desktop `image_gen` path.
- Use the upstream API workflow only when `image_gen` is unavailable and the user explicitly chooses that compatibility path.

## Fallback

If no image backend is available, produce a complete cover brief and platform-ready prompt instead of claiming an image was generated.
