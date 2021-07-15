// STIG Types
/// <reference path="STIG.d.ts" />
import * as STIG from "STIG"
import * as cci2nistmap from '../resources/cci2nist.json';

const prompt = require('prompt-sync')();


export function createCVD(vulnerability: STIG.Vulnerability): string {
    return `Rule Title: ${vulnerability.Rule_Title}\r\n\r\n${vulnerability.FINDING_DETAILS}`
}

export function convertToRawSeverity(severity: string) {
    switch (severity) {
      case 'none':
        return 'Unknown';
      case 'low':
        return 'I';
      case 'medium':
        return 'II'
      case 'high':
        return 'III';
      case 'critical':
        return 'IIII'
    }
}

export function cleanStatus(status: string) {
    switch (status) {
        case 'Not_Applicable':
            return 'Not Applicable';
        case 'NotAFinding':
            return 'Not A Finding';
        default:
            return status;
    }
}

export function extractSolution(findingDetails: string): string | undefined {
    if (findingDetails.indexOf('Solution') !== -1){
        const matches = findingDetails.match(/Solution(.*)Message/gs);
        if (matches.length !== 0){
            return matches.join('')
        } else {
            return ''
        }
    } else {
        return ''
    }    
}

export function cci2nist(cci: string) {
    if (typeof cci === 'string') {
        if (cci in cci2nistmap) {
            return cci2nistmap[cci] 
        } else {
            return prompt(`What is the NIST ID for CCI ${cci}? `)
        }
    } else {
        return "UM-1"
    }
    
}
