# PRD: oh-story-claudecode Codex 原生化改造

## 1. 背景

`oh-story-claudecode` 当前是面向 Claude Code / OpenClaw 的网文写作 skill 包，包含 13 个 `skills/*/SKILL.md`，覆盖网文扫榜、拆文、写作、审查、去 AI 味、导入、封面生成和浏览器自动化。

现状中，skill 本体结构基本可被 Codex 读取，但仓库还不是 Codex 可直接安装和调用的插件包。主要缺口包括：

- 没有 `.codex-plugin/plugin.json`
- 没有 `agents/openai.yaml` UI 元数据
- 多处依赖 Claude Code 专属语义：
  - `Agent(subagent_type: ...)`
  - `Skill("...")`
  - `.claude/agents`
  - `.claude/hooks`
  - `CLAUDE.md`
- 自动化链路默认依赖 `agent-browser`、`curl`、`GPT_IMAGE_API_KEY` 等 CLI/API 方式，不符合 Codex 工具优先的使用方式

## 2. 目标

将仓库改造成 Codex 可直接安装、识别、调用、指挥的原生插件包，同时保留 Claude Code / OpenClaw 的兼容能力。

最终效果：

- Codex 可以通过插件 manifest 识别该仓库
- Codex 可以通过 `$story` 或具体 `$skill-name` 直接调用各 skill
- 默认流程不依赖 `.claude/*`、Claude subagent 或 `agent-browser`
- 写作、拆文、审查、封面、扫榜在 Codex 中有清晰可执行路径
- Claude Code / OpenClaw 旧路径保留为 legacy/兼容模式

## 3. 非目标

本次不做以下内容：

- 不删除 Claude/OpenClaw 旧支持
- 不把扫榜/浏览器能力封装成独立 MCP server
- 不新增 Codex app manifest
- 不把所有 JS 脚本完全重写为 Browser 插件实现
- 不承诺所有第三方榜单站点在无登录态、无网络限制下稳定抓取

## 4. 用户与使用场景

### 4.1 Codex 用户

用户希望在 Codex 中直接安装该仓库，并通过 skill 调用完成网文创作流程。

典型使用：

- `$story 帮我写一本都市爽文`
- `$story-short-write 帮我写一篇知乎盐言风格短篇`
- `$story-long-analyze 分析这本长篇的黄金三章`
- `$story-review 审查这几章的问题`
- `$story-cover 给这本书做封面`

### 4.2 Claude Code / OpenClaw 用户

旧用户仍可继续使用原有 `.claude-plugin`、`.claude/agents`、hooks 和 CLI 自动化能力。

## 5. 功能需求

### 5.1 Codex 插件入口

新增 `.codex-plugin/plugin.json`。

要求：

- 插件名：`oh-story-skills`
- 版本：沿用当前 `.claude-plugin/marketplace.json` 的 `0.6.0`
- `skills` 指向 `./skills/`
- 不包含 hooks、apps、mcpServers
- 不迁移 `.claude-plugin` 中的 `strict`、旧式 `source`、`plugins[]`

验收：

- Codex plugin validator 通过
- Codex 能识别该仓库为插件

### 5.2 Skill UI 元数据

为 13 个 skill 新增：

```text
skills/<skill-name>/agents/openai.yaml
```

每个文件包含：

- `interface.display_name`
- `interface.short_description`
- `interface.default_prompt`
- 可选：`policy.allow_implicit_invocation`

要求：

- `default_prompt` 必须显式包含 `$skill-name`
- `story` 作为总入口，默认 prompt 明确表达“网文工具箱路由”
- 高频 skill 的描述必须体现 Codex 可执行能力

高频 skill：

- `story`
- `story-long-write`
- `story-short-write`
- `story-review`
- `story-cover`
- `story-setup`

验收：

- 13 个 `openai.yaml` 均合法
- Codex UI 中能显示 readable 名称和默认 prompt

### 5.3 Skill 正文 Codex 原生化

改写 `SKILL.md` 中的 Claude-only 默认路径。

默认 Codex 路径要求：

- 不默认调用 `Agent(subagent_type: ...)`
- 不默认检查 `.claude/agents`
- 不默认调用 `Skill("...")`
- 不默认依赖 `CLAUDE.md`
- 不默认要求 `.claude/hooks`

处理方式：

- 写作类 skill 默认由当前 Codex 会话完成
- 审查类 skill 默认使用单会话多维审查
- 多 agent 仅作为用户明确要求时的可选增强
- Claude 相关内容统一标注为 legacy/Claude compatibility

重点改造：

- `story`
  - 将 `Skill("...")` 路由改成 Codex 可理解的路由说明
- `story-long-write`
  - 将 subagent 写作改成主会话分阶段写作
- `story-short-write`
  - 将 narrative-writer 依赖改成可选增强
- `story-review`
  - 默认改为 Codex 单会话多维审查
- `story-import`
  - 验证流程不再默认依赖 `.claude/agents/story-explorer.md`
- `story-deslop`
  - 去 AI 味流程默认由当前会话执行
- `story-long-analyze`
  - 逐章拆解默认串行/批处理，多 agent 作为可选模式

验收：

- 搜索 `Agent(subagent_type`，只允许出现在 legacy/兼容段落
- 搜索 `.claude/agents`，只允许出现在 legacy/兼容段落
- 搜索 `Skill("`，不得作为 Codex 默认路径出现

### 5.4 story-setup 双路径改造

`story-setup` 当前核心是部署 Claude Code 基础设施，需要改成双路径。

Codex 默认路径：

- 创建小说项目目录结构
- 创建基础追踪文件
- 创建写作规则说明
- 不写入 `.claude/*`
- 不注册 hooks
- 不生成 Claude agents

Claude 兼容路径：

- 保留原 `.claude/hooks`
- 保留 `.claude/agents`
- 保留 `CLAUDE.md`
- 保留 `.claude/settings.local.json`
- 明确标注仅用于 Claude Code / OpenClaw

验收：

- Codex 默认执行 `story-setup` 不要求 Bash
- Codex 默认执行 `story-setup` 不写 `.claude` 目录
- Claude 兼容路径仍有清晰入口

### 5.5 story-review 原生化

`story-review` 当前默认是 4 Agent 并行审查。Codex 版本改为：

默认模式：

- 单会话审查
- 按 4 个维度顺序检查：
  - 故事结构
  - 角色关系
  - 文学表达
  - 设定一致性
- 最终输出问题清单、严重级别、修改建议

可选增强模式：

- 当用户明确要求多 agent/并行审查时，再说明可拆分为多角色审查
- Claude Code 下可使用原 4 Agent 模式

验收：

- 无 subagent 时也能完成完整审查
- 输出结构稳定
- 不把“spawn 4 个 Agent”作为默认要求

### 5.6 自动化后端 Codex 工具优先

#### 5.6.1 浏览器与扫榜

Codex 默认路径：

- 优先使用 Codex Browser / web 能力
- `agent-browser` JS 脚本保留为 legacy CLI 后端

脚本补强：

- `--outdir` 不存在时自动创建
- 避免通过字符串拼接 shell 命令调用 `agent-browser`
- 登录态、反爬、网络失败时输出可诊断错误

验收：

- JS 语法检查通过
- 不存在的 `--outdir` 不导致直接失败
- 文档明确 Codex 默认不要求安装 `agent-browser`

#### 5.6.2 封面生成

Codex 默认路径：

- 使用 Codex `image_gen` 能力生成封面
- 旧 `curl + GPT_IMAGE_API_KEY` API 流程保留为 legacy 后端

验收：

- Codex 调用 `$story-cover` 不要求用户配置 `GPT_IMAGE_API_KEY`
- legacy API 路径仍可被手动使用
- 文档中明确两条路径区别

### 5.7 README 更新

README 需要新增 Codex 使用说明。

内容包括：

- Codex 安装方式
- `$story` 总入口
- 各 skill 的 Codex 调用示例
- Claude/OpenClaw 说明迁移到兼容段落
- 自动化能力说明：
  - Codex Browser 优先
  - Codex image_gen 优先
  - CLI/API 后端为 legacy

验收：

- 新用户能从 README 理解 Codex 使用方式
- 旧用户仍能找到 Claude/OpenClaw 使用方式

## 6. 技术约束

- 保留现有目录结构
- 不删除 `.claude-plugin/marketplace.json`
- 不在 Codex plugin manifest 中声明 hooks
- 不新增 MCP server
- 不新增 Codex app
- 不破坏现有 JS 脚本的 Node 运行方式
- 不要求 Codex 用户安装 `agent-browser`
- 不要求 Codex 用户配置 `GPT_IMAGE_API_KEY`

## 7. 验收标准

### 7.1 静态验收

- `.codex-plugin/plugin.json` 存在并通过校验
- 13 个 `SKILL.md` 都有合法 `name` / `description`
- 13 个 `agents/openai.yaml` 都存在且字段合法
- `node --check skills/**/*.js` 全部通过

### 7.2 文案验收

以下内容不得作为 Codex 默认路径出现：

- `Agent(subagent_type: ...)`
- `Skill("...")`
- `.claude/agents`
- `.claude/hooks`
- `CLAUDE.md`
- `agent-browser`
- `GPT_IMAGE_API_KEY`

允许它们出现在：

- legacy
- Claude compatibility
- optional CLI backend
- troubleshooting

### 7.3 功能验收

- `$story` 可作为总入口
- `$story-long-write` 可在无 `.claude` 目录时执行写作流程
- `$story-short-write` 可在无 `.claude` 目录时执行写作流程
- `$story-review` 可在无 subagent 时完成多维审查
- `$story-cover` 默认不要求 API key
- `story-setup` Codex 默认路径不写 `.claude` 目录

## 8. 风险与应对

### 8.1 扫榜站点不稳定

风险：

- 第三方页面结构变化
- 登录态失效
- 反爬
- Codex 网络限制

应对：

- Codex 默认输出趋势分析和可验证来源说明
- CLI 脚本作为增强能力
- 失败时输出原因和降级建议

### 8.2 双平台文案混乱

风险：

- 用户不知道当前是 Codex 路径还是 Claude 路径

应对：

- 所有 legacy 内容统一标注
- Codex 默认路径放在前面
- Claude/OpenClaw 兼容路径放在后面

### 8.3 Skill 体积过大

风险：

- `story-long-write`、`story-import` 接近 500 行，加载成本高

应对：

- 核心流程保留在 `SKILL.md`
- 细节迁移到 `references/`
- `SKILL.md` 只保留何时加载哪些 reference 的导航

## 9. 实施顺序

1. 新增 `.codex-plugin/plugin.json`
2. 为 13 个 skill 增加 `agents/openai.yaml`
3. 改写 `story` 路由逻辑
4. 改写写作、审查、导入、去 AI 味中的 Claude-only 默认路径
5. 改写 `story-setup` 为 Codex 默认路径 + Claude 兼容路径
6. 改写 `story-cover` 为 Codex `image_gen` 优先
7. 改写扫榜/browser 文档为 Codex Browser 优先
8. 补强 JS 脚本 `--outdir` 和 CLI 调用安全性
9. 更新 README
10. 执行静态检查、脚本检查、文案扫描和验收场景

## 10. 默认决策

- 改造深度：完全原生化
- 兼容策略：双平台兼容
- 自动化后端：Codex 工具优先
- 插件形态：一个聚合 Codex plugin，包含 13 个 skills
- 旧平台支持：保留，但降级为 legacy/兼容模式
