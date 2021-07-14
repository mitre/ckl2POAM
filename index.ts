import { exit } from "yargs";

const yargs = require('yargs');

const argv = yargs
    .command('convert', 'Converts the provided CKL file to a POA&M Spreadsheet', {
        file: {
            description: 'The CKL file to use',
            alias: 'c',
            type: 'string',
        }
    })
    .option('file', {
        alias: 'f',
        description: 'The file to convert',
        type: 'string',
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv._.includes('convert')) {
    if(argv.file) {

    } else {
        console.log('No checklist was provided')
    }
}
