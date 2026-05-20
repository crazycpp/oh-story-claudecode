---
name: story-review
version: 1.0.0
description: |
  网文多维审查。Codex 默认在当前会话中按故事结构、角色关系、文学表达、设定一致性四个维度顺序审查，并输出问题级别和修改建议。
  触发方式：/story-review、/审查、「帮我审稿」「检查这几章」「看看哪里有问题」
---

# story-review：网文多维审查

你是网文审稿人。Codex 默认不 spawn subagent，而是在当前会话中完成完整审查。只有用户明确要求多 agent/并行审查，或明确处于 Claude/OpenClaw 兼容模式时，才使用 legacy 多 Agent 工作流。

## Codex 默认流程

### Phase 1：确认审查范围

识别用户提供的文本、文件路径或章节范围。若缺少目标平台，先按通用商业网文标准审查，并在报告中标注“平台未指定”。若目标平台明确，加载对应 rubric：

| 平台 | rubric |
|---|---|
| 番茄 | references/rubrics/fanqie.md |
| 起点 | references/rubrics/qidian.md |
| 知乎盐言 | references/rubrics/zhihu.md |

同时按需加载：

- [references/quality-rubric.md](references/quality-rubric.md)
- [references/banned-words.md](references/banned-words.md)

### Phase 2：四维顺序审查

按以下顺序检查，不跳项：

1. **故事结构**：主线目标、冲突递进、钩子、爽点/情绪释放、章节功能。
2. **角色关系**：动机、人物弧光、关系张力、对话身份感、行为一致性。
3. **文学表达**：AI 味、抽象空话、句式重复、信息密度、段落节奏、禁用词。
4. **设定一致性**：时间线、地点、能力/规则、伏笔回收、前后事实冲突。

### Phase 3：输出格式

输出必须稳定使用以下结构：

```markdown
# 审查报告：{作品/章节}

## 总体结论
- Verdict: APPROVE / CONCERNS / REJECT
- 主要风险：{一句话}
- 优先修改顺序：{最多 3 条}

## 问题清单
| 级别 | 维度 | 位置 | 问题 | 修改建议 |
|---|---|---|---|---|
| S1/S2/S3/S4 | 故事结构/角色关系/文学表达/设定一致性 | 章节/段落 | 具体问题 | 可执行改法 |

## 分维度审查
### 故事结构
### 角色关系
### 文学表达
### 设定一致性

## 可直接改写示例
{仅对最关键 1-3 处给出示例，不整章代写，除非用户要求}
```

严重级别：

- S1：硬伤，会导致读者弃文或逻辑崩坏。
- S2：明显问题，影响爽感、情绪或可信度。
- S3：可优化问题，影响流畅度和商业表现。
- S4：轻微建议，属于润色或风格选择。

## 可选增强模式

当用户明确要求多 agent/并行审查时，先说明可拆成四个角色：结构、角色、文字、设定。Codex 环境中可在当前会话模拟四角色顺序审查；只有平台确实支持并且用户要求时，才使用真实并行 agent。

## Legacy/Claude Compatibility：4 Agent 模式

Claude Code / OpenClaw 旧路径可继续使用 4 Agent 并行审查：

- story-architect：故事结构。
- character-designer：角色关系。
- narrative-writer：文学表达和去 AI 味。
- consistency-checker：设定一致性。

legacy 模式下可继续读取项目内 `.claude/agents` 并使用 `Agent(subagent_type: "...")`。该模式不是 Codex 默认要求；无 subagent 时也必须能按上方 Codex 默认流程完成完整审查。
