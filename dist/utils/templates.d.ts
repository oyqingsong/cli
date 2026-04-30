export interface DepConfig {
    packages: string[];
    dev?: boolean;
    version?: string;
}
export declare const DEPENDENCIES: Record<string, DepConfig>;
export declare const VITE_TEMPLATE: Record<string, string>;
export declare const CSS_OPTIONS: readonly ["CSS", "Less"];
export type CssOption = (typeof CSS_OPTIONS)[number];
export declare function getPackagesWithVersions(dep: DepConfig): string[];
export declare function getEslintConfig(isTypescript: boolean): {
    config: {
        env: {
            browser: boolean;
            es2022: boolean;
        };
        extends: string[];
        settings: {
            react: {
                version: string;
            };
        };
        rules: {};
    };
    devDeps: string[];
};
export declare const PRETTIER_CONFIG: {
    semi: boolean;
    singleQuote: boolean;
    trailingComma: string;
    printWidth: number;
};
export declare const PRETTIER_DEV_DEPS: string[];
export declare const PRESETS: Record<string, {
    language: string;
    deps: string[];
    tooling: string[];
    css: CssOption;
}>;
