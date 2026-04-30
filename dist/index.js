import { createProgram } from './cli.js';
createProgram().then((program) => {
    program.parseAsync(process.argv).catch((err) => {
        console.error(err.message);
        process.exit(1);
    });
});
