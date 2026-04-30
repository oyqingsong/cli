declare const _default: {
    name: string;
    description: string;
    options: {
        flags: string;
        description: string;
        default: string;
    }[];
    action: (_args: Record<string, unknown>, opts: Record<string, unknown>) => Promise<void>;
};
export default _default;
