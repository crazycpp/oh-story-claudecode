---
name: browser-cdp
version: 1.0.0
description: "Legacy CLI browser backend for Claude/OpenClaw users who need to control Chrome through CDP and reuse login sessions. Codex users should prefer Codex Browser or web tools unless they explicitly need this optional CLI backend."
metadata:
  openclaw:
    requires:
      bins:
        - agent-browser
    source: https://github.com/worldwonderer/oh-story-claudecode
---

# Browser CDP 操作工具

Codex 默认优先使用 Codex Browser / web 能力完成网页打开、检查、截图、点击、输入和数据提取。本 skill 保留为 Legacy/Claude Compatibility 的 optional CLI backend，用于用户明确要求复用本机 Chrome CDP 登录态且已安装 CLI 工具的场景。

## Codex 默认路径

- 需要打开、检查、点击、输入或截图网页时，优先使用 Codex Browser。
- 需要公开网页信息或来源校验时，优先使用 web 能力。
- 需要登录态、反爬页面或用户本机 Chrome 会话时，先说明限制和风险，再询问用户是否要切换到 legacy CLI 后端。
- Codex 默认不要求安装 `agent-browser`。

## Legacy/Claude Compatibility：CLI 前置条件

- Windows（实验性）/ macOS / Linux，已安装 Google Chrome。
- Node.js 16+。
- `agent-browser` 命令行工具已安装。

## Legacy/Claude Compatibility：启动 CDP Chrome

```bash
node {SKILL_DIR}/scripts/setup-cdp-chrome.js 9222
```

成功后，legacy CLI 命令都带 `--cdp 9222`。

## Legacy/Claude Compatibility：常用操作

打开页面并等待加载：

```bash
agent-browser --cdp 9222 open "<URL>"
agent-browser --cdp 9222 wait 3000
```

提取页面文本：

```bash
agent-browser --cdp 9222 eval 'document.body.innerText.substring(0, 8000)'
```

提取 Auth Token：

```bash
agent-browser --cdp 9222 eval 'localStorage.getItem("token") || document.cookie'
```

交互式快照、点击、输入：

```bash
agent-browser --cdp 9222 snapshot -i
agent-browser --cdp 9222 click "<CSS selector>"
agent-browser --cdp 9222 type "<CSS selector>" "<text>"
```

## Troubleshooting

| 问题 | 处理 |
|---|---|
| CDP 端口未监听 | 重新运行 `setup-cdp-chrome.js` |
| 页面跳转到登录页 | 在 Chrome 中手动登录后重试 |
| eval 返回 null | 检查 localStorage key 或改用 `document.cookie` |
| CLI 不存在 | 继续使用 Codex Browser/web，或在 legacy CLI 模式中安装 `agent-browser` |
