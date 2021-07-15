// STIG Types
/// <reference path="STIG.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as STIG from "STIG"
import * as XlsxPopulate from "xlsx-populate";// Used for opening the spreadsheet as a template
import * as template from './resources/template.json';
const xml2js = require('xml2js');

// Logging
const {createLogger, format, transports} = require('winston');
const {printf} = format;
const fmt = printf(({
    level,
    file,
    message
}) => {
    return `${level.toUpperCase()}: ${file}: ${message}`;
});
const logger = createLogger({
    format: fmt,
    transports: [
        new transports.Console(),
    ]
});

// Configurable settings
const STARTING_ROW = 8 // The row we start inserting controls into

const files = fs.readdirSync(path.join(__dirname, 'input'));
if (files.length === 0) {
    console.log('No files in the input directory.')
} else {
    // For all files in the input directory
    files.forEach(async (fileName) => {
        // Ignore files that start with . (e.g .gitignore)
        if (fileName.startsWith('.')) {
            return;
        }
        logger.log({
            level: 'info',
            file: fileName,
            message: `Opening file ${fileName}`
        })
        const parser = new xml2js.Parser();
        fs.readFile(path.join(__dirname, 'input', fileName), function (readFileError, data) {
            if (readFileError) {
                logger.log({
                    level: 'error',
                    file: fileName,
                    message: `An error occoured opening the file ${fileName}: ${readFileError}`
                })
            }
            // Parse the XML to a javascript object
            parser.parseString(data, function (parseFileError, result: STIG.STIG) {
                if (parseFileError) {
                    logger.log({
                        level: 'error',
                        file: fileName,
                        message: `An error occoured parsing the file: ${readFileError}`
                    })
                } else {
                    let vulnerabilities: STIG.Vulnerability[] = []
                    const iStigs: STIG.iSTIG[] = []
                    const stigs = result.CHECKLIST.STIGS
                    logger.log({
                        level: 'info',
                        file: fileName,
                        message: `Found ${stigs.length} STIGs`
                    })
                    // Get nested iSTIGs, not quite sure why there can be multiple.
                    stigs.forEach((stig) => {
                        stig.iSTIG.forEach((iStig) => {
                            iStigs.push(iStig)
                        })
                    })
                    logger.log({
                        level: 'info',
                        file: fileName,
                        message: `Found ${iStigs.length} iSTIGs`
                    })
                    // Get the controls/vulnerabilities from each stig
                    iStigs.forEach((iSTIG) => {
                        vulnerabilities = vulnerabilities.concat(iSTIG.VULN.map((vulnerability) => {
                            const values = {};
                            // Extract STIG_DATA
                            vulnerability.STIG_DATA.forEach((data) => {
                                values[data.VULN_ATTRIBUTE[0]] = data.ATTRIBUTE_DATA[0]
                            });
                            // Extract remaining fields (status, finding deails, comments, security override, and severity justification)
                            Object.entries(vulnerability).forEach(([key, value]) => {
                                values[key] = value[0];
                            });
                            return values;
                        }))
                    });
                    logger.log({
                        level: 'info',
                        file: fileName,
                        message: `Found ${vulnerabilities.length} vulnerabilities`
                    });
                    // Read our template
                    XlsxPopulate.fromFileAsync(path.join(__dirname, 'resources', 'POA&M Template.xlsm')).then((workBook) => {
                        // eMASS reads the first sheet in the notebook
                        const sheet = workBook.sheet(0);
                        // The current row we are on
                        let currentRow = STARTING_ROW;
                        // For each vulnerability
                        vulnerabilities.forEach((vulnerability) => {
                            // Write the SV-Rule ID
                            sheet.cell(`${template.rows.securityChecks}${currentRow}`).value(vulnerability.Rule_ID)
                            // Go to the next row
                            currentRow += 1
                        })
                        return workBook.toFileAsync(path.join(__dirname, 'output', `${fileName}.xlsm`));
                    })
                }
            });
        });
    })
}
