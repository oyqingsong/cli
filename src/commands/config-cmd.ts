import type { Command } from '../types.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'config',
  description: 'Manage CLI configuration',
  arguments: '<action> [key] [value]',
  options: [],
  action: async (args, _opts) => {
    const positional = args.positional as string[];
    const action = positional[0];
    const key = positional[1];
    const value = positional[2];

    switch (action) {
      case 'list': {
        const all = config.list();
        for (const [k, v] of Object.entries(all)) {
          console.log(`  ${k} = ${v}`);
        }
        break;
      }
      case 'get': {
        if (!key) {
          logger.error('Usage: my-cli config get <key>');
          process.exit(1);
        }
        const val = config.get(key!);
        if (val === undefined) {
          logger.warn(`Key "${key}" not found`);
        } else {
          console.log(val);
        }
        break;
      }
      case 'set': {
        if (!key || value === undefined) {
          logger.error('Usage: my-cli config set <key> <value>');
          process.exit(1);
        }
        config.set(key!, value!);
        logger.success(`Set ${key} = ${value}`);
        break;
      }
      default:
        logger.error(`Unknown action "${action}". Use: list, get, set`);
        process.exit(1);
    }
  },
} satisfies Command;
