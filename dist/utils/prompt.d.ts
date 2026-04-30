export declare const prompt: {
    confirm: (message: string) => Promise<boolean>;
    input: (message: string) => Promise<string>;
    select: (message: string, choices: string[]) => Promise<string>;
    multiselect: (message: string, choices: string[]) => Promise<string[]>;
};
