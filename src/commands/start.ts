import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import type { Command } from '../types.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'start',
  description: 'Start the development server',
  options: [
    { flags: '-p, --port <port>', description: 'Dev server port', default: '5173' },
    { flags: '-o, --open', description: 'Open browser automatically', default: 'false' },
  ],
  action: async (_args, opts) => {
    const pkgPath = join(process.cwd(), 'package.json');
    if (!existsSync(pkgPath)) {
      logger.error('No package.json found in current directory');
      process.exit(1);
    }

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const hasDev = !!pkg.scripts?.dev;
    const hasStart = !!pkg.scripts?.start;

    if (!hasDev && !hasStart) {
      logger.error('No "dev" or "start" script found in package.json');
      process.exit(1);
    }

    const scriptName = hasDev ? 'dev' : 'start';
    const port = opts.port as string;
    const openBrowser = opts.open === 'true';

    const isVite = (pkg.scripts?.[scriptName] as string)?.includes('vite');

    let cmd = `npm run ${scriptName}`;
    if (isVite) {
      cmd += ' --';
      cmd += ` --port ${port}`;
      if (openBrowser) cmd += ' --open';
    }

    logger.success(`Starting dev server on port ${port}...`);
    console.log('');

    const child = spawn(cmd, [], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      process.exit(code ?? 0);
    });
  },
} satisfies Command;
