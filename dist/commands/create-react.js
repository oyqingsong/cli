import { existsSync, writeFileSync, rmSync, readFileSync, readdirSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { logger } from '../utils/logger.js';
import { prompt } from '../utils/prompt.js';
import { run } from '../utils/exec.js';
import { DEPENDENCIES, VITE_TEMPLATE, PRETTIER_CONFIG, PRETTIER_DEV_DEPS, PRESETS, CSS_OPTIONS, getPackagesWithVersions, } from '../utils/templates.js';
export default {
    name: 'create-react',
    description: 'Create a new React project with Vite',
    arguments: '<project-name>',
    options: [
        { flags: '-p, --preset <preset>', description: 'Preset: minimal, standard, full' },
        { flags: '--ts', description: 'Use TypeScript (default)', default: 'false' },
        { flags: '--js', description: 'Use JavaScript', default: 'false' },
        { flags: '--css <css>', description: 'CSS preprocessor: css, less' },
        { flags: '--eslint', description: 'Include ESLint', default: 'false' },
        { flags: '--prettier', description: 'Include Prettier', default: 'false' },
        { flags: '-d, --deps <deps...>', description: 'Extra dependencies: react-router, zustand, tailwind, gz-ui, axios, echarts, klinechart, ag-grid' },
    ],
    action: async (args, opts) => {
        const positional = (args.positional ?? []);
        const projectName = positional[0] ?? '';
        if (!projectName) {
            logger.error('Usage: my-cli create-react <project-name>');
            process.exit(1);
        }
        const projectPath = resolve(projectName);
        if (existsSync(projectPath)) {
            logger.error(`Directory "${projectName}" already exists`);
            process.exit(1);
        }
        // Resolve settings: CLI opts > preset > interactive
        const presetName = opts.preset;
        const preset = presetName ? PRESETS[presetName] : undefined;
        if (presetName && !preset) {
            logger.error(`Unknown preset "${presetName}". Available: ${Object.keys(PRESETS).join(', ')}`);
            process.exit(1);
        }
        const DEP_ALIASES = {
            'react-router': 'React Router',
            'zustand': 'Zustand',
            'tailwind': 'Tailwind CSS',
            'gz-ui': 'GZ UI',
            'axios': 'Axios',
            'echarts': 'ECharts',
            'klinechart': 'KLineChart',
            'ag-grid': 'AG Grid',
        };
        const CSS_ALIAS = {
            css: 'CSS',
            less: 'Less',
        };
        const hasCliOpts = opts.ts === 'true' || opts.js === 'true' || opts.eslint === 'true' || opts.prettier === 'true' || opts.deps?.length || opts.css;
        let language;
        let selectedDeps;
        let selectedTooling;
        let cssChoice;
        if (preset && !hasCliOpts) {
            language = preset.language;
            selectedDeps = [...preset.deps];
            selectedTooling = [...preset.tooling];
            cssChoice = preset.css;
        }
        else {
            if (opts.js === 'true') {
                language = 'JavaScript';
            }
            else if (preset) {
                language = preset.language;
            }
            else {
                language = await prompt.select('Select language:', ['TypeScript', 'JavaScript']);
            }
            const cliDeps = (opts.deps ?? []).map((d) => DEP_ALIASES[d] ?? d);
            if (cliDeps.length) {
                selectedDeps = cliDeps;
            }
            else if (preset) {
                selectedDeps = [...preset.deps];
            }
            else {
                selectedDeps = await prompt.multiselect('Select extra dependencies (space to toggle, enter to confirm):', Object.keys(DEPENDENCIES));
            }
            const cliTooling = [];
            if (opts.eslint === 'true')
                cliTooling.push('ESLint');
            if (opts.prettier === 'true')
                cliTooling.push('Prettier');
            if (cliTooling.length) {
                selectedTooling = cliTooling;
            }
            else if (preset) {
                selectedTooling = [...preset.tooling];
            }
            else {
                selectedTooling = await prompt.multiselect('Select code tooling:', ['ESLint', 'Prettier']);
            }
            const cssInput = opts.css;
            if (cssInput) {
                cssChoice = CSS_ALIAS[cssInput.toLowerCase()] ?? 'CSS';
            }
            else if (preset) {
                cssChoice = preset.css;
            }
            else {
                cssChoice = await prompt.select('Select CSS preprocessor:', [...CSS_OPTIONS]);
            }
        }
        const template = VITE_TEMPLATE[language];
        // Confirm
        console.log('');
        logger.info(`Project: ${projectName}`);
        logger.info(`Language: ${language}`);
        logger.info(`CSS: ${cssChoice}`);
        logger.info(`Dependencies: ${selectedDeps.length ? selectedDeps.join(', ') : 'none'}`);
        logger.info(`Tooling: ${selectedTooling.length ? selectedTooling.join(', ') : 'none'}`);
        console.log('');
        const confirmed = await prompt.confirm('Create project with these settings?');
        if (!confirmed) {
            logger.warn('Aborted');
            return;
        }
        // Run create-vite
        try {
            run(`npx create-vite ${projectName} --template ${template}`);
        }
        catch {
            logger.error('Failed to create project with create-vite');
            if (existsSync(projectPath)) {
                rmSync(projectPath, { recursive: true, force: true });
            }
            process.exit(1);
        }
        // Less setup
        if (cssChoice === 'Less') {
            try {
                run('npm install --save-dev less', projectPath);
                // Rewrite .css files to .less and update imports
                rewriteCssToLess(projectPath);
                logger.success('Less configured');
            }
            catch {
                logger.warn('Failed to configure Less');
            }
        }
        // Install extra dependencies (with pinned versions)
        for (const depName of selectedDeps) {
            const dep = DEPENDENCIES[depName];
            if (!dep)
                continue;
            const flag = dep.dev ? ' --save-dev' : '';
            const packages = getPackagesWithVersions(dep).join(' ');
            try {
                run(`npm install ${packages}${flag}`, projectPath);
            }
            catch {
                logger.warn(`Failed to install ${depName}, skipping`);
            }
        }
        // ESLint: create-vite already includes ESLint 10 with flat config,
        // no need to install or configure separately
        if (selectedTooling.includes('ESLint')) {
            logger.success('ESLint configured (included in Vite template)');
        }
        // Prettier setup
        if (selectedTooling.includes('Prettier')) {
            try {
                run(`npm install --save-dev ${PRETTIER_DEV_DEPS.join(' ')}`, projectPath);
                writeFileSync(join(projectPath, '.prettierrc'), JSON.stringify(PRETTIER_CONFIG, null, 2) + '\n', 'utf-8');
                logger.success('Prettier configured');
            }
            catch {
                logger.warn('Failed to configure Prettier');
            }
        }
        // Done
        console.log('');
        logger.success(`Project "${projectName}" created successfully!`);
        console.log('');
        logger.info(`  cd ${projectName}`);
        logger.info('  npm run dev');
        console.log('');
    },
};
function rewriteCssToLess(projectPath) {
    const srcDir = join(projectPath, 'src');
    const entries = readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.css')) {
            const oldPath = join(srcDir, entry.name);
            const newPath = join(srcDir, entry.name.replace(/\.css$/, '.less'));
            renameSync(oldPath, newPath);
        }
        if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
            const filePath = join(srcDir, entry.name);
            let content = readFileSync(filePath, 'utf-8');
            content = content.replace(/\.css(['"])/g, '.less$1');
            writeFileSync(filePath, content, 'utf-8');
        }
    }
}
