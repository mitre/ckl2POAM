// STIG Types
/// <reference path="STIG.d.ts" />
import * as STIG from "STIG"


export function createCVD(vulnerability: STIG.Vulnerability): string {
    return `Rule Title: ${vulnerability.Rule_Title}`
}
