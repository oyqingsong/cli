# create-react 命令设计文档

## 概述

为 my-cli 添加 `create-react` 命令，基于 Vite 官方模板创建 React 项目，并提供额外依赖选择和代码规范工具配置。

## 命令接口

```bash
my-cli create-react <project-name>
```

## 交互流程

1. **语言选择** — `TypeScript` / `JavaScript`（默认 TypeScript）
2. **额外依赖** — 多选：`React Router`、`Zustand`、`Tailwind CSS`、`Ant Design`（可跳过）
3. **代码规范** — 多选：`ESLint`、`Prettier`（可跳过）
4. **确认** — 显示所有选择，用户确认后开始创建

## 创建步骤

1. 校验项目名（检查同名目录是否已存在）
2. 调用 `npx create-vite <project-name> --template react-ts`（或 `react`）
3. 根据用户选择安装额外依赖
4. 根据用户选择写入 ESLint / Prettier 配置文件
5. 自动执行 `npm install`
6. 输出完成信息，提示下一步操作

## 文件结构

新增 3 个文件：

| 文件 | 职责 |
|------|------|
| `src/commands/create-react.ts` | 命令定义 + 流程编排 |
| `src/utils/templates.ts` | 依赖名称映射、ESLint/Prettier 配置文件内容模板 |
| `src/utils/exec.ts` | 封装 execSync，带 spinner 和错误处理 |

## 依赖映射

```
可选依赖：
  React Router    → react-router-dom
  Zustand         → zustand
  Tailwind CSS    → tailwindcss @tailwindcss/vite
  Ant Design      → antd
```

## 规范工具配置

### ESLint（.eslintrc.json）

```json
{
  "env": { "browser": true, "es2022": true },
  "extends": ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  "settings": { "react": { "version": "detect" } },
  "rules": {}
}
```

需要额外安装：`eslint eslint-plugin-react eslint-plugin-react-hooks`

TypeScript 项目额外安装：`@typescript-eslint/parser @typescript-eslint/eslint-plugin`，并在 extends 中加入 `"plugin:@typescript-eslint/recommended"`。

### Prettier（.prettierrc）

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

需要额外安装：`prettier`

## 错误处理

| 步骤 | 失败处理 |
|------|---------|
| 项目名校验 | 同名目录已存在 → logger.error 报错退出 |
| create-vite | 捕获异常 → logger.error 报错 → 清理已创建目录 → 退出 |
| 额外依赖安装 | 捕获异常 → logger.warn 提示，继续后续步骤 |
| 配置文件写入 | 捕获异常 → logger.warn 提示，继续后续步骤 |

- 仅 create-vite 失败时清理已创建的项目目录
- 用户 Ctrl+C 中断不做特殊处理，已创建文件保留
