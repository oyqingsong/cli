import { logger } from '../utils/logger.js';
export default {
    name: 'hello',
    description: 'Say hello to someone',
    options: [
        { flags: '-n, --name <name>', description: 'Target name', default: 'world' },
    ],
    action: async (_args, opts) => {
        logger.success(`Hello, ${opts.name}!`);
    },
};
