import { execSync } from 'node:child_process';
import { logger } from './logger.js';
export function run(command, cwd) {
    const spinner = logger.spinner(`Running: ${command}`);
    try {
        const result = execSync(command, {
            cwd,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        spinner.succeed(command);
        return result;
    }
    catch (err) {
        spinner.fail(command);
        throw err;
    }
}
