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
├── src/
│   ├── index.ts              # 入口，注册所有命令
│   ├── cli.ts                # CLI 初始化与配置
│   ├── commands/             # 命令目录，每个文件一个命令
│   │   ├── hello.ts          # 示例命令：打招呼
│   │   └── config.ts         # 示例命令：查看/设置配置
│   ├── utils/
│   │   ├── config.ts         # 配置管理（读写 ~/.my-clirc.json）
│   │   ├── logger.ts         # 美化输出封装（chalk + ora）
│   │   └── prompt.ts         # 交互式提示封装（inquirer）
│   └── types.ts              # 公共类型定义
├── bin/
│   └── my-cli.js             # 可执行入口（#!/usr/bin/env node）
├── package.json
├── tsconfig.json
└── .gitignore
```

## 命令注册机制

### Command 接口

```ts
interface Command {
  name: string;
  description: string;
  options?: [
    { flags: string; description: string; default?: string }
  ][];
  action: (args: any, opts: any) => Promise<void>;
}
```

### 注册流程

1. `cli.ts` 自动扫描 `src/commands/` 下的 `.ts` 文件
2. 读取每个文件的 `default` 导出
3. 调用 `program.command()` 注册到 commander

### 添加新命令

在 `commands/` 下新建文件，导出一个满足 `Command` 接口的对象即可，无需手动维护命令列表。

## 配置管理

- 配置文件路径：`~/.my-clirc.json`
- 默认配置：`{ locale: 'zh-CN', theme: 'default' }`
- 提供 `get(key)`、`set(key, value)`、`list()` 三个方法
- `get` 优先读文件，回退到默认值
- `set` 写入配置，文件不存在则自动创建

### config 命令

```bash
my-cli config list                  # 查看所有配置
my-cli config get <key>             # 查看某个配置项
my-cli config set <key> <value>     # 设置配置项
```

## 美化输出

基于 chalk + ora 封装 logger：

```ts
logger.info('普通信息')         // 白色
logger.success('操作成功')      // 绿色 + ✓ 前缀
logger.warn('注意')             // 黄色 + ⚠ 前缀
logger.error('出错了')          // 红色 + ✗ 前缀

const spinner = logger.spinner('正在处理...')
spinner.succeed('完成')
spinner.fail('失败')
```

## 交互式提示

基于 inquirer 封装 prompt：

```ts
prompt.confirm('确认继续？')           // 是/否
prompt.input('请输入名称：')            // 文本输入
prompt.select('请选择：', ['a', 'b'])  // 单选列表
prompt.multiselect('选择多个：', list)  // 多选列表
```

## 内置命令

| 命令 | 说明 |
|------|------|
| `my-cli hello [-n, --name <name>]` | 示例命令，打招呼 |
| `my-cli config list` | 查看所有配置 |
| `my-cli config get <key>` | 查看某个配置项 |
| `my-cli config set <key> <value>` | 设置配置项 |
