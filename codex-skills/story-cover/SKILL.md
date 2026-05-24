---
name: story-cover
description: Codex 原生小说封面生成流程。默认使用图像生成能力，并复用上游封面风格参考。
---

# story-cover for Codex

Upstream skill: `../../skills/story-cover/SKILL.md`

## Codex Default

Use `image_gen` to create a cover after extracting:

- title
- author name if provided
- genre and target platform
- visual motif, protagonist signal, mood, and cover text

Before image generation, read upstream cover guidance and any relevant reference files under `../../skills/story-cover/references/`.

## Output

Return the generated image and a short note covering title, genre signal, and visual direction. Do not ask the user to configure an API key for the Codex path.

## Compatibility

Legacy/compatibility API backends may exist upstream, but they are not the Codex default.
