# Cloudflare Pages 部署指南

本项目是一个静态 React 应用 (SPA)，非常适合部署在 **Cloudflare Pages** 上，具备高性能、全球 CDN 加速且免费额度充足的特点。

## 准备工作

1.  拥有一个 GitHub 账号，并将本项目代码上传至 GitHub 仓库。
2.  拥有一个 Cloudflare 账号。
3.  拥有 Google Gemini API Key。

## 部署步骤

### 第一步：创建 Cloudflare Pages 项目

1.  登录 Cloudflare Dashboard，进入 **Workers & Pages** 页面。
2.  点击 **Create Application** -> **Pages** -> **Connect to Git**。
3.  授权 Cloudflare 访问你的 GitHub 账号，并选择本项目所在的仓库。
4.  点击 **Begin setup**。

### 第二步：配置构建设置 (Build Settings)

在 "Set up builds and deployments" 页面配置如下：

*   **Project name**: 自定义项目名称 (例如 `career-lift`)
*   **Production branch**: `main` (或你的主分支)
*   **Framework preset**: 选择 **Create React App** 或 **Vite** (本项目是 Vite 结构，但也兼容 CRA 的构建命令，通常 Cloudflare 会自动检测)。
    *   如果自动检测失败，请手动设置：
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist` (如果是 Vite) 或 `build` (如果是 CRA)

### 第三步：配置环境变量 (重要)

在同一页面的 **Environment variables (advanced)** 部分，添加以下变量：

| 变量名 | 值 | 说明 |
| :--- | :--- | :--- |
| `API_KEY` | `AIzaSy...` | 你的 Google Gemini API Key (必须) |
| `REACT_APP_SUPABASE_URL` | `https://...` | (可选) Supabase URL |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJh...` | (可选) Supabase Anon Key |

> **注意**：由于这是一个纯前端项目，API Key 会被打包进前端代码中。请确保在 Cloudflare 设置好这些变量，构建过程会将它们注入到应用中。

### 第四步：完成部署

1.  点击 **Save and Deploy**。
2.  Cloudflare 将开始拉取代码、安装依赖并构建项目。
3.  构建完成后，你会获得一个 `https://your-project-name.pages.dev` 的访问链接。

## 🗄️ 数据库配置 (Supabase) - 可选

如果你希望启用云端数据存储功能，请按照以下步骤配置 Supabase：

1.  登录 [Supabase](https://supabase.com/) 创建一个新项目。
2.  进入 SQL Editor，运行项目根目录下的 `supabase_schema.sql` 文件中的内容，创建数据表。
3.  获取项目的 URL 和 Anon Key，填入 Cloudflare 的环境变量中。

## 常见问题排查

**Q: 部署后打开页面白屏？**
*   A: 检查 Build output directory 是否设置正确。Vite 项目通常是 `dist`。

**Q: AI 功能无法使用？**
*   A: 检查浏览器控制台 (Console)。如果是 401/403 错误，说明 `API_KEY` 环境变量未正确设置或未生效。修改环境变量后，需要到 Cloudflare Pages 的 "Deployments" 标签页**重新触发一次部署 (Retry deployment)** 才能生效。

**Q: 路由跳转 404？**
*   A: 本项目是单页应用 (SPA)。Cloudflare Pages 通常会自动处理，但如果遇到问题，可以在项目根目录添加一个 `_redirects` 文件，内容为 `/* /index.html 200`。
