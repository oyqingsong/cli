declare const _default: {
    name: string;
    description: string;
    arguments: string;
    options: ({
        flags: string;
        description: string;
        default?: undefined;
    } | {
        flags: string;
        description: string;
        default: string;
    })[];
    action: (args: Record<string, unknown>, opts: Record<string, unknown>) => Promise<void>;
};
export default _default;
