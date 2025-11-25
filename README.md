# CareerLift - AI 智能简历优化助手

CareerLift 是一个基于 React 和 Google Gemini AI 的智能职业辅助平台。它不仅是一个简历编辑器，更能根据具体的目标职位（JD）深度分析简历，提供针对性的优化建议，并进行模拟面试。

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

*   **前端框架**: React 18+ (TypeScript)
*   **构建工具**: Vite
*   **样式库**: Tailwind CSS, Lucide React (图标)
*   **AI 模型**: Google Gemini API (`gemini-2.5-flash` for text/vision)
*   **数据存储**: 
    *   本地存储 (Local Storage) - 默认兜底
    *   Supabase (PostgreSQL) - 可选，支持云端同步
*   **工具库**: `html2pdf.js` (PDF 导出), `@google/genai` (SDK)

## 🚀 本地开发指南

1.  **克隆项目**
    ```bash
    git clone <repository-url>
    cd career-lift
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    在项目根目录创建 `.env` 文件（或设置系统环境变量）：
    ```env
    # 必须：Google Gemini API Key
    API_KEY=your_google_gemini_api_key
    
    # 可选：Supabase 配置 (如需云端存储)
    REACT_APP_SUPABASE_URL=your_supabase_url
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **启动开发服务器**
    ```bash
    npm run dev
    ```

## 📂 项目结构

*   `src/components`: UI 组件 (简历视图, AI 分析面板, 面试机器人等)
*   `src/services`: 核心业务逻辑 (Gemini AI 调用, 数据库服务)
*   `src/types.ts`: TypeScript 类型定义
*   `src/constants.ts`: 默认数据与常量

## 📄 许可证

MIT License
