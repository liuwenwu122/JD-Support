# Cloudflare Pages 部署指南

本项目是一个基于 Vite 的静态 React 应用 (SPA)，非常适合部署在 **Cloudflare Pages** 上，具备高性能与全球 CDN 加速。

## 准备工作

1. 拥有一个 GitHub 账号，并将本项目代码上传至 GitHub 仓库。
2. 拥有一个 Cloudflare 账号。
3. 准备 AI 提供方的 API Key（支持 Google Gemini 或 OpenAI）。

## 部署步骤

### 第一步：创建 Cloudflare Pages 项目

1. 登录 Cloudflare Dashboard，进入 **Workers & Pages** 页面。
2. 点击 **Create Application** -> **Pages** -> **Connect to Git**。
3. 授权 Cloudflare 访问你的 GitHub 账号，并选择本项目所在的仓库。
4. 点击 **Begin setup**。

### 第二步：配置构建设置 (Build Settings)

在 "Set up builds and deployments" 页面配置如下：

- **Project name**: 自定义项目名称 (例如 `career-lift`)
- **Production branch**: `main` (或你的主分支)
- **Framework preset**: 选择 **Vite**（Cloudflare 通常会自动检测）
  - 如果自动检测失败，请手动设置：
  - **Build command**: `npm run build`
  - **Build output directory**: `dist`

### 第三步：配置环境变量 (重要)

在同一页面的 **Environment variables (advanced)** 部分，添加以下变量（Vite 仅注入以 `VITE_` 开头的变量）：

| 变量名 | 示例值 | 说明 |
| :--- | :--- | :--- |
| `VITE_AI_PROVIDER` | `google` 或 `openai` | 选择 AI 提供方 |
| `VITE_AI_MODEL` | `gemini-2.5-flash` 或 `gpt-4o-mini` | 指定模型名（可留空使用默认） |
| `VITE_AI_API_KEY` | `AIza...` 或 `sk-...` | 通用 API Key（优先使用） |
| `VITE_GEMINI_API_KEY` | `AIza...` | 当 `VITE_AI_API_KEY` 留空且提供方为 Google 时使用 |
| `VITE_OPENAI_API_KEY` | `sk-...` | 当 `VITE_AI_API_KEY` 留空且提供方为 OpenAI 时使用 |
| `VITE_OPENAI_BASE_URL` | `https://api.openai.com/v1` | 可选，OpenAI 兼容代理地址 |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | 可选，启用云端存储 |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | 可选，启用云端存储 |

> 说明：这是纯前端项目，构建时变量会被注入并随前端代码分发。请确保在 Cloudflare 正确设置这些变量并重新部署以生效。

### 第四步：完成部署

1. 点击 **Save and Deploy**。
2. Cloudflare 将开始拉取代码、安装依赖并构建项目。
3. 构建完成后，你会获得一个 `https://your-project-name.pages.dev` 的访问链接。

## 🗄️ 数据库配置 (Supabase) - 可选

如果你希望启用云端数据存储功能：

1. 登录 [Supabase](https://supabase.com/) 创建一个新项目。
2. 进入 SQL Editor，运行项目根目录下的 `supabase_schema.sql`，创建数据表。
3. 获取项目的 URL 和 Anon Key，填入 Cloudflare 的环境变量中。

## 常见问题排查

**Q: 部署后打开页面白屏？**
- A: 检查 Build output directory 是否设置正确（Vite 项目为 `dist`）。

**Q: AI 功能无法使用？**
- A: 检查浏览器控制台。如果出现 401/403，说明关键环境变量未正确设置。请确认 `VITE_AI_PROVIDER` 与对应的 API Key（`VITE_AI_API_KEY` 或提供方专属变量）已配置，并在 Cloudflare Pages 的 "Deployments" 中 **Retry deployment** 使其生效。

**Q: 路由跳转 404？**
- A: 本项目是单页应用 (SPA)。若遇到问题，可在项目根目录添加 `_redirects` 文件，内容为 `/* /index.html 200`。
