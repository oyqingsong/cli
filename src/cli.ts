import { Command as CommanderCommand } from 'commander';
import type { Command } from './types.js';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export async function createProgram(): Promise<CommanderCommand> {
  const program = new CommanderCommand();
  program
    .name('my-cli')
    .description('A general-purpose CLI framework')
    .version('0.1.0');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const commandsDir = join(__dirname, 'commands');
  const files = readdirSync(commandsDir).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    const mod = await import(join(commandsDir, file));
    const cmd: Command = mod.default;

    const c = program.command(cmd.name).description(cmd.description);
    if (cmd.arguments) {
      c.arguments(cmd.arguments);
    }
    for (const opt of cmd.options ?? []) {
      c.option(opt.flags, opt.description, opt.default);
    }
    c.action(async (...rest) => {
      const opts = rest.pop() as Record<string, unknown>;
      await cmd.action({ positional: rest }, opts);
    });
  }

  return program;
}
