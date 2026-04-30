export interface DepConfig {
  packages: string[];
  dev?: boolean;
  version?: string;
}

export const DEPENDENCIES: Record<string, DepConfig> = {
  'React Router': { packages: ['react-router-dom'], version: '7.5.0' },
  'Zustand': { packages: ['zustand'], version: '5.0.3' },
  'Tailwind CSS': { packages: ['tailwindcss', '@tailwindcss/vite'], version: '4.1.3' },
  'GZ UI': { packages: ['gz-ui'] },
  'Axios': { packages: ['axios'], version: '1.13.6' },
  'ECharts': { packages: ['echarts'] },
  'KLineChart': { packages: ['klinecharts'] },
  'AG Grid': { packages: ['ag-grid-community'] },
};

export const VITE_TEMPLATE: Record<string, string> = {
  TypeScript: 'react-ts',
  JavaScript: 'react',
};

export const CSS_OPTIONS = ['CSS', 'Less'] as const;
export type CssOption = (typeof CSS_OPTIONS)[number];

export function getPackagesWithVersions(dep: DepConfig): string[] {
  if (!dep.version) return dep.packages;
  return dep.packages.map((pkg) => `${pkg}@${dep.version}`);
}

export function getEslintConfig(isTypescript: boolean) {
  const extendsArr = [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ];
  const devDeps = [
    'eslint@8.57.1',
    'eslint-plugin-react@7.37.5',
    'eslint-plugin-react-hooks@5.2.0',
  ];

  if (isTypescript) {
    extendsArr.push('plugin:@typescript-eslint/recommended');
    devDeps.push('@typescript-eslint/parser@8.30.0', '@typescript-eslint/eslint-plugin@8.30.0');
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

export const PRESETS: Record<string, { language: string; deps: string[]; tooling: string[]; css: CssOption }> = {
  minimal: {
    language: 'TypeScript',
    deps: [],
    tooling: [],
    css: 'CSS',
  },
  standard: {
    language: 'TypeScript',
    deps: ['React Router'],
    tooling: ['ESLint', 'Prettier'],
    css: 'Less',
  },
  full: {
    language: 'TypeScript',
    deps: ['React Router', 'Zustand', 'GZ UI', 'Axios', 'ECharts', 'KLineChart', 'AG Grid'],
    tooling: ['ESLint', 'Prettier'],
    css: 'Less',
  },
};
