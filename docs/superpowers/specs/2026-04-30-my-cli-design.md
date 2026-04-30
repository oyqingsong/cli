# my-cli 设计文档

## 概述

my-cli 是一个基于 Node.js + TypeScript 的通用 CLI 框架。支持命令路由与参数解析、交互式提示、美化输出、配置管理。新命令通过"创建文件 + 自动注册"的方式扩展。

## 技术栈

- **运行时**：Node.js v22+
- **语言**：TypeScript
- **命令路由**：commander
- **交互式提示**：inquirer
- **美化输出**：chalk + ora
- **配置管理**：读写 `~/.my-clirc.json`
- **分发方式**：npm 全局包

## 项目结构

```
my-cli/
├── bin/
│   └── my-cli.js             # 可执行入口（#!/usr/bin/env node）
├── src/
│   ├── index.ts              # 入口，启动 CLI
│   ├── cli.ts                # CLI 初始化，自动扫描注册命令
│   ├── commands/             # 命令目录，每个文件一个命令
│   │   ├── hello.ts          # 示例命令：打招呼
│   │   ├── config-cmd.ts     # 配置管理命令
│   │   └── create-react.ts   # React 项目创建命令
│   ├── utils/
│   │   ├── config.ts         # 配置管理（读写 ~/.my-clirc.json）
│   │   ├── logger.ts         # 美化输出封装（chalk + ora）
│   │   ├── prompt.ts         # 交互式提示封装（inquirer）
│   │   ├── exec.ts           # child_process 封装（带 spinner）
│   │   └── templates.ts      # 依赖映射、版本固定、配置模板、预设
│   └── types.ts              # 公共类型定义
├── package.json
├── tsconfig.json
└── .gitignore
```

## 命令注册机制

### Command 接口

```ts
interface CommandOption {
  flags: string;
  description: string;
  default?: string;
}

interface Command {
  name: string;
  description: string;
  arguments?: string;
  options?: CommandOption[];
  action: (args: Record<string, unknown>, opts: Record<string, unknown>) => Promise<void>;
}
```

### 注册流程

1. `cli.ts` 自动扫描 `src/commands/` 下的 `.ts` 文件
2. 读取每个文件的 `default` 导出
3. 调用 `program.command()` 注册到 commander，自动处理 arguments 和 options
4. action 回调中，positional 参数通过 `args.positional` 数组传递，命名选项通过 `opts` 对象传递

### 添加新命令

在 `commands/` 下新建文件，导出一个满足 `Command` 接口的对象即可，无需手动维护命令列表。

## 工具模块

### Logger（基于 chalk + ora）

```ts
logger.info('普通信息')         // 白色
logger.success('操作成功')      // 绿色 + ✓ 前缀
logger.warn('注意')             // 黄色 + ⚠ 前缀
logger.error('出错了')          // 红色 + ✗ 前缀

const spinner = logger.spinner('正在处理...')
spinner.succeed('完成')
spinner.fail('失败')
```

### Prompt（基于 inquirer）

```ts
prompt.confirm('确认继续？')           // 是/否
prompt.input('请输入名称：')            // 文本输入
prompt.select('请选择：', ['a', 'b'])  // 单选列表
prompt.multiselect('选择多个：', list)  // 多选列表
```

### Exec（基于 child_process）

```ts
run('npm install react')          // 在当前目录执行命令，带 spinner
run('npm install react', './app') // 在指定目录执行
```

### 配置管理

- 配置文件路径：`~/.my-clirc.json`
- 默认配置：`{ locale: 'zh-CN', theme: 'default' }`
- 提供 `get(key)`、`set(key, value)`、`list()` 三个方法

## 内置命令

### hello

```bash
my-cli hello [-n, --name <name>]    # 打招呼，默认 name=world
```

### config

```bash
my-cli config list                  # 查看所有配置
my-cli config get <key>             # 查看某个配置项
my-cli config set <key> <value>     # 设置配置项
```

### create-react

基于 Vite 官方模板创建 React 项目，支持交互式选择和 CLI 参数预设。

**基本用法：**

```bash
my-cli create-react <project-name>
```

**CLI 选项：**

```
-p, --preset <preset>   预设模板：minimal, standard, full
--ts                    使用 TypeScript（默认）
--js                    使用 JavaScript
--css <css>             CSS 预处理器：css, less
--eslint                包含 ESLint
--prettier              包含 Prettier
-d, --deps <deps...>    额外依赖：react-router, zustand, tailwind, gz-ui, axios, echarts, klinechart, ag-grid
```

**优先级：** CLI 参数 > preset > 交互提示

**交互流程（无参数时）：**

1. 语言选择 — TypeScript / JavaScript（默认 TypeScript）
2. CSS 预处理器 — CSS / Less（默认 CSS）
3. 额外依赖（多选）— React Router、Zustand、Tailwind CSS、GZ UI、Axios、ECharts、KLineChart、AG Grid
4. 代码规范（多选）— ESLint、Prettier
5. 确认后开始创建

**创建步骤：**

1. 校验项目名（检查同名目录）
2. 调用 `npx create-vite <name> --template react-ts`（或 `react`）
3. 若选择 Less：安装 less，将 .css 重命名为 .less，更新 import 路径
4. 安装额外依赖（支持版本固定）
5. 配置 ESLint / Prettier（写入配置文件）
6. 输出完成信息

**预设模板：**

| Preset | 语言 | CSS | 依赖 | 工具 |
|--------|------|-----|------|------|
| minimal | TypeScript | CSS | 无 | 无 |
| standard | TypeScript | Less | React Router | ESLint + Prettier |
| full | TypeScript | Less | React Router, Zustand, GZ UI, Axios | ESLint + Prettier |

**示例：**

```bash
# 交互式创建
my-cli create-react my-app

# 使用预设
my-cli create-react my-app --preset standard

my-cli create-react my-app --js --css less --eslint --deps react-router zustand

# 预设 + 覆盖
my-cli create-react my-app --preset minimal --deps gz-ui --prettier
```

**依赖版本固定：**

| 依赖 | 包名 | 版本 |
|------|------|------|
| React Router | react-router-dom | 7.5.0 |
| Zustand | zustand | 5.0.3 |
| Tailwind CSS | tailwindcss, @tailwindcss/vite | 4.1.3 |
| GZ UI | gz-ui | 最新版 |
| Axios | axios | 1.13.6 |
| ECharts | echarts | 最新版 |
| KLineChart | klinecharts | 最新版 |
| AG Grid | ag-grid-community | 最新版 |

## 错误处理

| 场景 | 处理方式 |
|------|---------|
| 缺少必要参数 | logger.error 提示用法并退出 |
| 同名目录已存在 | logger.error 报错并退出 |
| create-vite 执行失败 | 清理已创建目录后退出 |
| 额外依赖安装失败 | logger.warn 提示，继续后续步骤 |
| 配置文件写入失败 | logger.warn 提示，继续后续步骤 |
| 未知 preset 名称 | logger.error 列出可用预设并退出 |
