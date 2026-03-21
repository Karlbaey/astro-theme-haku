# 代码仓库指南

## 项目结构和模块组织

网站核心代码位于 `src/` 目录下。路由文件和页面位于 `src/pages/` 目录下，包括动态文章路由，例如 `src/pages/articles/[...slug].astro`。可复用的 UI 组件按用途组织在 `src/components/` 目录下（`meta/`、`buttons/`、`styles/`、`scripts/`）。共享布局位于 `src/layouts/` 目录下，小型辅助工具位于 `src/utils/` 目录下，项目通用的类型定义位于 `src/types/` 目录下。内容集合位于 `src/content/` 目录下，其模式位于 `src/content.config.ts` 文件中。静态资源位于 `public/` 目录下，项目脚本位于 `scripts/` 目录下。CLI 入口点为 `bin/haku.mjs`。

## 构建、测试和开发命令

使用 `pnpm install` 安装依赖项。运行 `pnpm dev` 启动 Astro 开发服务器。运行 `pnpm build` 创建生产版本并在 `dist/` 目录下生成 Pagefind 索引。使用 `pnpm preview` 在本地部署构建输出以进行手动验证。运行 `pnpm astro -- check` 验证 Astro 路由、内容和项目配置。

## 编码风格和命名规范

使用 TypeScript 和 Astro ESM 模块，并显式导入，使用简洁的实用工具。遵循已修改文件的现有格式；该仓库主要使用 2 个空格缩进。组件文件名使用 `PascalCase`，例如 `LatestArticles.astro`，变量和函数文件名使用 `camelCase`，并保持路由/内容文件名与当前集合模式一致。保留现有注释并使用 UTF-8 文本编码。

## 测试指南

目前还没有专门的自动化测试套件。对于任何更改，至少运行 `pnpm build`，然后使用 `pnpm preview` 手动验证受影响的页面或组件。如果您要添加测试，建议使用 Playwright，并将测试用例放在 `tests/` 目录下，并使用 `*.spec.ts` 文件名。

## 提交和拉取请求指南

在完成任务的最后执行 `pnpm build` 检查是否可通过编译。禁止执行任何 git 命令。

## 安全和配置提示

请勿提交密钥或特定于环境的凭据。请将站点级设置集中在 `src/config.ts` 文件中，并避免在组件之间硬编码重复值。始终使用 UTF-8 文本编码。请勿删除任何代码注释。使用中文回答问题。