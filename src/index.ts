// STIG Types
/// <reference path="STIG.d.ts" />

import * as fs from 'fs';
import * as path from 'path';
import * as STIG from "STIG"
import * as XlsxPopulate from "xlsx-populate";// Used for opening the spreadsheet as a template
import * as settings from '../settings.json';
import { cci2nist, cleanStatus, convertToRawSeverity, createCVD, extractSolution } from './convertStrings';
import moment = require('moment');
const xml2js = require('xml2js');
const prompt = require('prompt-sync')();


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

const files = fs.readdirSync(path.join(__dirname, '..', 'input'));
if (files.length === 0) {
    logger.log({
        level: 'error',
        file: 'none',
        message: `No files to open`
    })
} else {
    // For all files in the input directory
    files.forEach((fileName) => {
        // Ignore files that start with . (e.g .gitignore)
        if (fileName.startsWith('.')) {
            return;
        }
        logger.log({
            level: 'info',
            file: fileName,
            message: `Opening file`
        })
        const parser = new xml2js.Parser();
        fs.readFile(path.join(__dirname, '..', 'input', fileName), function (readFileError, data) {
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

                    const resourcesRequired = prompt(`What should the default value be for Resources Required? `)
                    const officeOrg = prompt(`What should the default value be for Office/org? `)
                    
                    // Read our template
                    XlsxPopulate.fromFileAsync(path.join(__dirname, '..', 'resources', 'POA&M Template.xlsm')).then((workBook) => {
                        // eMASS reads the first sheet in the notebook
                        const sheet = workBook.sheet(0);
                        // The current row we are on
                        let currentRow = STARTING_ROW;
                        // The scheduled completion date, default of one year from today
                        const aYearFromNow = moment(new Date(new Date().setFullYear(new Date().getFullYear() + 1))).format('M/DD/YYYY')
                        // For each vulnerability
                        vulnerabilities.forEach((vulnerability) => {
                            // Control Vulnerbility Description
                            sheet.cell(`${settings.rows.controlVulnerbilityDescription}${currentRow}`).value(createCVD(vulnerability))
                            // Secuirty Control Number
                            sheet.cell(`${settings.rows.securityControlNumber}${currentRow}`).value(cci2nist(vulnerability.CCI_REF))
                            // Office/org
                            sheet.cell(`${settings.rows.officeOrg}${currentRow}`).value(officeOrg)
                            // Security Checks
                            sheet.cell(`${settings.rows.securityChecks}${currentRow}`).value(vulnerability.Rule_ID)
                            // Resources Required
                            sheet.cell(`${settings.rows.resourcesRequired}${currentRow}`).value(resourcesRequired)
                            // Scheduled Completion Date
                            // Default is one year from today
                            sheet.cell(`${settings.rows.scheduledCompletionDate}${currentRow}`).value(aYearFromNow)
                            // Status
                            sheet.cell(`${settings.rows.status}${currentRow}`).value(cleanStatus(vulnerability.STATUS))
                            // Raw Severity
                            sheet.cell(`${settings.rows.rawSeverity}${currentRow}`).value(convertToRawSeverity(vulnerability.Severity))
                            // Reccomendations
                            sheet.cell(`${settings.rows.reccomendations}${currentRow}`).value(vulnerability.Fix_Text || extractSolution(vulnerability.FINDING_DETAILS))
                            // Go to the next row
                            currentRow += settings.rowsToSkip + 1
                        })
                        return workBook.toFileAsync(path.join(__dirname, '..', 'output', `${fileName}.xlsm`));
                    })
                }
            });
        });
    })
}
