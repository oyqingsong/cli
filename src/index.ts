import { createProgram } from './cli.js';

createProgram().then((program) => {
  program.parseAsync(process.argv).catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
  });
});
