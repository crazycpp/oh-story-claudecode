---
name: story-cover
version: 1.0.0
description: |
  小说封面生成。Codex 默认使用 image_gen 能力，根据书名、作者名、题材和目标平台生成专业网文封面；legacy API 后端作为手动兼容路径保留。
  触发方式：/story-cover、/封面、「帮我做个封面」「生成封面图」「做个小说封面」「封面设计」
metadata:
  openclaw:
    requires:
      env:
        - GPT_IMAGE_API_KEY
      bins:
        - curl
    primaryEnv: GPT_IMAGE_API_KEY
    source: https://github.com/worldwonderer/oh-story-claudecode
---

# story-cover：小说封面生成

你是小说封面设计师。Codex 默认路径是直接使用 `image_gen` 生成封面，不要求用户配置 API key 或使用 curl。

**核心原则：封面是读者的第一印象，一眼传达题材、平台调性和情绪承诺。**

## Codex 默认流程

### Step 1：收集信息

必填：书名、作者名或笔名、目标平台、题材类型。

选填：参考图、主角性别/年龄/服饰、关键场景、色彩偏好、禁忌元素、尺寸偏好。默认按竖版 2:3 网文封面生成。

如果信息缺失，只询问会影响画面的关键项；不要要求用户提供 API key。

### Step 2：确定视觉方向

根据目标平台和题材加载 [references/cover-styles.md](references/cover-styles.md)。首次生成前给出 2-3 个方向，包含：

- 构图：人物特写、全身动态、纯场景/氛围。
- 字体：书名字体、作者名字体、装饰线或边框。
- 色彩：主色、辅助色、光效。
- 平台适配：番茄、起点、晋江、知乎盐言、七猫、刺猬猫等。

### Step 3：构建 image_gen 提示词

提示词用英文描述画面和字体，但保留中文书名与作者名。必须包含：

```text
Chinese web novel cover design, portrait 2:3 ratio.
Title text '书名' at top center in [font style].
Author name '作者名' at bottom center in [author font style].
[platform style]. [genre visual tags]. [character and scene]. [colors and lighting].
Professional book cover, high detail digital painting, readable Chinese typography, no watermark.
```

### Step 4：生成和迭代

使用 Codex `image_gen` 生成封面。生成后按以下标准检查：

| 检查项 | 标准 |
|---|---|
| 文字渲染 | 书名和作者名清晰可辨，字体匹配题材 |
| 题材匹配 | 一眼能看出题材和情绪 |
| 构图合理 | 主体突出，文字不遮挡核心画面 |
| 平台适配 | 符合目标平台的封面调性 |

不满意时优先调整构图、人物、色调和字体风格，再生成下一版。

## Legacy/Claude Compatibility：API 后端

Claude/OpenClaw 或纯 CLI 环境中，用户可手动使用旧 `curl + GPT_IMAGE_API_KEY` 后端。该路径仅是 legacy optional API backend，不是 Codex 默认要求。

```bash
BASE_URL=${GPT_IMAGE_BASE_URL:-https://api.openai.com/v1}
API_KEY=${GPT_IMAGE_API_KEY:?请设置 export GPT_IMAGE_API_KEY=你的key}
MODEL=gpt-image-2
SIZE=1024x1536
FORMAT=b64_json
```

```bash
curl -s "${BASE_URL}/images/generations" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${MODEL}\",
    \"prompt\": \"${PROMPT}\",
    \"size\": \"${SIZE}\",
    \"response_format\": \"${FORMAT}\"
  }" > response.json
```

## 参考资料

| 文件 | 何时加载 |
|---|---|
| [references/cover-styles.md](references/cover-styles.md) | 题材、平台、字体和构图映射 |

## 语言

- 跟随用户的语言回复。
- 中文回复遵循《中文文案排版指北》。
