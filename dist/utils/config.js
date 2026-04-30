import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
const CONFIG_PATH = join(homedir(), '.my-clirc.json');
const defaults = {
    locale: 'zh-CN',
    theme: 'default',
};
function readConfig() {
    if (!existsSync(CONFIG_PATH))
        return { ...defaults };
    try {
        const raw = readFileSync(CONFIG_PATH, 'utf-8');
        return { ...defaults, ...JSON.parse(raw) };
    }
    catch {
        return { ...defaults };
    }
}
export const config = {
    get: (key) => {
        return readConfig()[key];
    },
    set: (key, value) => {
        const current = readConfig();
        current[key] = value;
        writeFileSync(CONFIG_PATH, JSON.stringify(current, null, 2) + '\n', 'utf-8');
    },
    list: () => {
        return readConfig();
    },
};
