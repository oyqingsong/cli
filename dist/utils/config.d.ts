export declare const config: {
    get: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    list: () => Record<string, string>;
};
