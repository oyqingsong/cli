import inquirer from 'inquirer';
export const prompt = {
    confirm: async (message) => {
        const { value } = await inquirer.prompt({
            type: 'confirm',
            name: 'value',
            message,
        });
        return value;
    },
    input: async (message) => {
        const { value } = await inquirer.prompt({
            type: 'input',
            name: 'value',
            message,
        });
        return value;
    },
    select: async (message, choices) => {
        const { value } = await inquirer.prompt({
            type: 'list',
            name: 'value',
            message,
            choices,
        });
        return value;
    },
    multiselect: async (message, choices) => {
        const { value } = await inquirer.prompt({
            type: 'checkbox',
            name: 'value',
            message,
            choices,
        });
        return value;
    },
};
