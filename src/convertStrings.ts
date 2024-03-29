// STIG Types
/// <reference path="STIG.d.ts" />
import * as STIG from "STIG"
import * as cci2nistmap from '../resources/cci2nist.json';

const prompt = require('prompt-sync')();

export function extractSTIGUrl(findingDetails: string): string | null {
    const matches = findingDetails.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/gs)
    if (matches) {
        let match = ""
        matches.forEach((link) => {
            const url = new URL(link)
            if(url.host === 'dl.dod.cyber.mil') {
                match = url.pathname.split('/').pop().replace('.zip', '')
            }
        })
        return match
    }
    return ''
}

export function cklSeverityToPOAMSeverity(severity: string): string {
    switch (severity) {
        case 'none':
          return '';
        case 'low':
          return 'Low';
        case 'medium':
          return 'Moderate'
        case 'high':
        case 'critical':
          return 'High';
      }
}

export function cklSeverityToRelevanceOfThreat(severity: string) {
    return 'Moderate'
}

export function cklSeverityToLikelihood(severity: string) {
    switch (severity) {
        case 'none':
          return '';
        case 'low':
          return 'Low';
        case 'medium':
          return 'Moderate'
        case 'high':
        case 'critical':
          return 'Moderate';
    }
}

export function cklSeverityToImpact(severity: string) {
    switch (severity) {
        case 'none':
          return '';
        case 'low':
          return 'Low';
        case 'medium':
          return 'Moderate'
        case 'high':
        case 'critical':
          return 'High';
    }
}

export function cklSeverityToResidualRiskLevel(severity: string) {
    switch (severity) {
        case 'none':
          return '';
        case 'low':
          return 'Low';
        case 'medium':
          return 'Moderate'
        case 'high':
        case 'critical':
          return 'Moderate';
      }
}


export function createCVD(vulnerability: STIG.Vulnerability): string {
    if (vulnerability.FINDING_DETAILS.indexOf('Solution :') !== -1){
        return `Rule Title: ${vulnerability.Rule_Title}\r\n\r\n${vulnerability.FINDING_DETAILS.split('Solution :')[0]}`
    }
    return `Rule Title: ${vulnerability.Rule_Title}\r\n\r\n${vulnerability.FINDING_DETAILS}`
}

export function convertToRawSeverity(severity: string) {
    switch (severity) {
      case 'none':
        return 'Unknown';
      case 'low':
        return 'III';
      case 'medium':
        return 'II'
      case 'high':
      case 'critical':
        return 'I';
    }
}

export function cleanStatus(status: string) {
    switch (status) {
        case 'Not_Applicable':
            return 'Not Applicable';
        case 'Open':
            return 'Ongoing';
        default:
            return status;
    }
}

export function replaceSpecialCharacters(text: string): string {
    return text.replace(/'/g, '`').replace(/"/g, '`').replace(/</g, '(').replace(/>/g, ')').replace(/\\/, '\\')
}

function cleanComments(comments: string): string {
    return comments.replace(/Automated(.*?)project\.\n/, '').replace(/Profile shasum.*/sg, '').trim()
}

export function combineComments(vulnerability: STIG.Vulnerability, host: string) {
    if(vulnerability.STATUS === 'Open'){
        return `${vulnerability.Rule_ID} failed on ${host}\r\n${cleanComments(vulnerability.COMMENTS)}`
    } else {
        return `${vulnerability.Rule_ID} not applicable on ${host}\r\n${cleanComments(vulnerability.COMMENTS)}\r\n\r\n${vulnerability.FINDING_DETAILS}`
    }
}

export function extractSolution(findingDetails: string): string | undefined {
    if (findingDetails.indexOf('Solution') !== -1){
        const matches = findingDetails.match(/Solution(.*)Message/gs);
        if (matches.length !== 0){
            const text = matches.join('').split('Solution : ')[1].trim()
            if(text.indexOf('Message:') !== -1) {
                return text.split('Message:')[0].trim()
            } else {
                return text
            }
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
            return cci2nistmap[cci].replace(' ', '')
        } else {
            return prompt(`What is the NIST Control for CCI ${cci}? `)
        }
    } else {
        return "UM-1"
    }
    
}
