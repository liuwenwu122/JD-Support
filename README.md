# JD-Support - AI 智能简历优化助手

JD-Support 是一个基于 React + Vite 的智能职业辅助平台，支持 Google Gemini 与 OpenAI 规范。它不仅是一个简历编辑器，更能根据目标职位（JD）深度分析简历、提供定向优化建议，并进行模拟面试。

## ✨ 核心功能

1.  **AI 简历解析**：
    *   支持导入 PDF 或图片格式的简历。
    *   利用 Gemini Vision 能力自动提取个人信息、教育经历、工作经历等结构化数据。

2.  **JD 定向诊断与优化**：
    *   用户设定目标职位名称和具体的职位描述（JD）。
    *   AI 计算“人岗匹配度”分数。
    *   识别简历中的优势与缺口（关键词缺失）。
    *   **智能重写**：针对特定的工作经历或项目经验，提供符合 JD 要求的重写建议，一键应用。

3.  **AI 模拟面试**：
    *   基于目标职位和简历内容，生成定制化的面试官人格。
    *   进行多轮对话模拟，结束后提供评分和详细的反馈报告（优势/待改进项）。

4.  **版本管理**：
    *   支持创建多个简历 Profile（如针对不同岗位的简历）。
    *   内置版本控制系统，记录每一次修改，随时回滚查看历史版本。

5.  **所见即所得编辑器 & A4 导出**：
    *   结构化的表单编辑。
    *   实时预览 A4 排版效果。
    *   支持导出为标准 PDF 文件，自动处理分页与样式。

## 🛠 技术栈

- **前端框架**: React 19+ (TypeScript)
- **构建工具**: Vite
- **样式库**: Tailwind CSS, Lucide React (图标)
- **AI 提供方**: Google Gemini 或 OpenAI（可切换）
- **数据存储**:
  - 本地存储 (Local Storage) - 默认兜底
  - Supabase (PostgreSQL) - 可选，支持云端同步
- **工具库**: `html2pdf.js` (PDF 导出), `@google/genai` (SDK)

## 🚀 本地开发指南

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd career-lift
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**（Vite 仅注入以 `VITE_` 开头的变量）
   在项目根目录创建 `.env` 文件：
   ```env
   # 选择提供方：google / openai
   VITE_AI_PROVIDER=google
   
   # 模型名（可留空使用默认：google->gemini-2.5-flash, openai->gpt-4o-mini）
   VITE_AI_MODEL=
   
   # 通用 API Key（优先使用），或提供方专属变量回退
   VITE_AI_API_KEY=your_api_key
   VITE_GEMINI_API_KEY=your_google_key
   VITE_OPENAI_API_KEY=your_openai_key
   VITE_OPENAI_BASE_URL=https://api.openai.com/v1

   # 可选：Supabase 云端存储
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 📂 项目结构

- `src/main.tsx`：应用入口
- `src/App.tsx`：根组件
- `src/components/*`：UI 组件（简历视图、AI 分析、面试机器人等）
- `src/services/*`：核心业务逻辑（AI 调用、数据库服务）
- `src/types.ts`：TypeScript 类型定义
- `src/constants.ts`：默认数据与常量

## 📄 许可证

MIT License
