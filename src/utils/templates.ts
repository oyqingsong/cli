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

export const PRESETS: Record<string, { language: string; deps: string[]; tooling: string[] }> = {
  minimal: {
    language: 'TypeScript',
    deps: [],
    tooling: [],
  },
  standard: {
    language: 'TypeScript',
    deps: ['React Router'],
    tooling: ['ESLint', 'Prettier'],
  },
  full: {
    language: 'TypeScript',
    deps: ['React Router', 'Zustand', 'Tailwind CSS', 'Ant Design'],
    tooling: ['ESLint', 'Prettier'],
  },
};
