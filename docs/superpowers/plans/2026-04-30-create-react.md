# create-react Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `my-cli create-react <name>` command that creates a React project using Vite, with interactive prompts for language, extra dependencies, and code tooling.

**Architecture:** New command file `create-react.ts` orchestrates the flow: collect user choices via `prompt`, run `create-vite` via `execSync` wrapper, install extras, write config files. Two new utility modules: `exec.ts` (child_process wrapper) and `templates.ts` (dependency mappings and config file templates).

**Tech Stack:** Node.js child_process.execSync, existing utils (logger, prompt)

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/utils/exec.ts` | Create | Wrap execSync with spinner and error handling |
| `src/utils/templates.ts` | Create | Dependency name mappings, ESLint/Prettier config templates |
| `src/commands/create-react.ts` | Create | Command definition + full creation flow |

---

### Task 1: Create exec utility

**Files:**
- Create: `src/utils/exec.ts`

- [ ] **Step 1: Create src/utils/exec.ts**

```ts
import { execSync } from 'node:child_process';
import { logger } from './logger.js';

export function run(command: string, cwd?: string): string {
  const spinner = logger.spinner(`Running: ${command}`);
  try {
    const result = execSync(command, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    spinner.succeed(command);
    return result;
  } catch (err) {
    spinner.fail(command);
    throw err;
  }
}
```

- [ ] **Step 2: Build to verify**

```bash
npx tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/exec.ts
git commit -m "feat: add exec utility wrapping execSync with spinner"
```

---

### Task 2: Create templates utility

**Files:**
- Create: `src/utils/templates.ts`

- [ ] **Step 1: Create src/utils/templates.ts**

```ts
export const DEPENDENCIES: Record<string, { packages: string[]; dev?: boolean }> = {
  'React Router': { packages: ['react-router-dom'] },
  'Zustand': { packages: ['zustand'] },
  'Tailwind CSS': { packages: ['tailwindcss', '@tailwindcss/vite'] },
  'Ant Design': { packages: ['antd'] },
};

export const VITE_TEMPLATE: Record<string, string> = {
  TypeScript: 'react-ts',
  JavaScript: 'react',
};

export function getEslintConfig(isTypescript: boolean) {
  const extendsArr = [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ];
  const devDeps = ['eslint', 'eslint-plugin-react', 'eslint-plugin-react-hooks'];

  if (isTypescript) {
    extendsArr.push('plugin:@typescript-eslint/recommended');
    devDeps.push('@typescript-eslint/parser', '@typescript-eslint/eslint-plugin');
  }

  const config = {
    env: { browser: true, es2022: true },
    extends: extendsArr,
    settings: { react: { version: 'detect' } },
    rules: {},
  };

  return { config, devDeps };
}

export const PRETTIER_CONFIG = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
};

export const PRETTIER_DEV_DEPS = ['prettier'];
```

- [ ] **Step 2: Build to verify**

```bash
npx tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/templates.ts
git commit -m "feat: add templates utility with dependency mappings and config templates"
```

---

### Task 3: Create create-react command

**Files:**
- Create: `src/commands/create-react.ts`

- [ ] **Step 1: Create src/commands/create-react.ts**

```ts
import { existsSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Command } from '../types.js';
import { logger } from '../utils/logger.js';
import { prompt } from '../utils/prompt.js';
import { run } from '../utils/exec.js';
import {
  DEPENDENCIES,
  VITE_TEMPLATE,
  getEslintConfig,
  PRETTIER_CONFIG,
  PRETTIER_DEV_DEPS,
} from '../utils/templates.js';

export default {
  name: 'create-react',
  description: 'Create a new React project with Vite',
  arguments: '<project-name>',
  options: [],
  action: async (args) => {
    const projectName = (args.positional[0] as string) ?? '';
    if (!projectName) {
      logger.error('Usage: my-cli create-react <project-name>');
      process.exit(1);
    }

    const projectPath = resolve(projectName);
    if (existsSync(projectPath)) {
      logger.error(`Directory "${projectName}" already exists`);
      process.exit(1);
    }

    // Step 1: Language selection
    const language = await prompt.select('Select language:', ['TypeScript', 'JavaScript']);
    const template = VITE_TEMPLATE[language];

    // Step 2: Extra dependencies
    const depChoices = Object.keys(DEPENDENCIES);
    const selectedDeps = await prompt.multiselect('Select extra dependencies (space to toggle, enter to confirm):', depChoices);

    // Step 3: Code tooling
    const toolingChoices = ['ESLint', 'Prettier'];
    const selectedTooling = await prompt.multiselect('Select code tooling:', toolingChoices);

    // Step 4: Confirm
    console.log('');
    logger.info(`Project: ${projectName}`);
    logger.info(`Language: ${language}`);
    logger.info(`Dependencies: ${selectedDeps.length ? selectedDeps.join(', ') : 'none'}`);
    logger.info(`Tooling: ${selectedTooling.length ? selectedTooling.join(', ') : 'none'}`);
    console.log('');

    const confirmed = await prompt.confirm('Create project with these settings?');
    if (!confirmed) {
      logger.warn('Aborted');
      return;
    }

    // Step 5: Run create-vite
    try {
      run(`npx create-vite ${projectName} --template ${template}`);
    } catch {
      logger.error('Failed to create project with create-vite');
      if (existsSync(projectPath)) {
        rmSync(projectPath, { recursive: true, force: true });
      }
      process.exit(1);
    }

    // Step 6: Install extra dependencies
    for (const depName of selectedDeps) {
      const dep = DEPENDENCIES[depName];
      if (!dep) continue;
      const flag = dep.dev ? ' --save-dev' : '';
      const installCmd = `npm install ${dep.packages.join(' ')}${flag}`;
      try {
        run(installCmd, projectPath);
      } catch {
        logger.warn(`Failed to install ${depName}, skipping`);
      }
    }

    // Step 7: ESLint setup
    if (selectedTooling.includes('ESLint')) {
      const isTypescript = language === 'TypeScript';
      const { config, devDeps } = getEslintConfig(isTypescript);
      try {
        run(`npm install --save-dev ${devDeps.join(' ')}`, projectPath);
        writeFileSync(
          join(projectPath, '.eslintrc.json'),
          JSON.stringify(config, null, 2) + '\n',
          'utf-8',
        );
        logger.success('ESLint configured');
      } catch {
        logger.warn('Failed to configure ESLint');
      }
    }

    // Step 8: Prettier setup
    if (selectedTooling.includes('Prettier')) {
      try {
        run(`npm install --save-dev ${PRETTIER_DEV_DEPS.join(' ')}`, projectPath);
        writeFileSync(
          join(projectPath, '.prettierrc'),
          JSON.stringify(PRETTIER_CONFIG, null, 2) + '\n',
          'utf-8',
        );
        logger.success('Prettier configured');
      } catch {
        logger.warn('Failed to configure Prettier');
      }
    }

    // Step 9: Done
    console.log('');
    logger.success(`Project "${projectName}" created successfully!`);
    console.log('');
    logger.info(`  cd ${projectName}`);
    logger.info('  npm run dev');
    console.log('');
  },
} satisfies Command;
```

- [ ] **Step 2: Build**

```bash
npx tsc
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/commands/create-react.ts
git commit -m "feat: add create-react command with Vite, dependency and tooling options"
```

---

### Task 4: End-to-end test

**Files:**
- No new files

- [ ] **Step 1: Rebuild**

```bash
npx tsc
```

- [ ] **Step 2: Verify command shows in help**

```bash
node bin/my-cli.js --help
```

Expected: output includes `create-react <project-name>` command.

- [ ] **Step 3: Test command help**

```bash
node bin/my-cli.js create-react --help
```

Expected: shows command description.

- [ ] **Step 4: Test error case - no project name**

```bash
node bin/my-cli.js create-react
```

Expected: error message "Usage: my-cli create-react <project-name>".

- [ ] **Step 5: Test error case - existing directory**

```bash
mkdir -p /tmp/test-existing-dir && node bin/my-cli.js create-react /tmp/test-existing-dir
```

Expected: error message about directory already existing.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "chore: verify create-react command end-to-end"
```
