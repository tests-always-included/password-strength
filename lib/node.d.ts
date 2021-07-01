export const commonPasswords: string[];
export const trigraphs: PasswordStrengthTrigraphMap;

export class PasswordStrength {
    charsets: PasswordStrengthGroups;
    commonPasswords: null | string[];
    trigraph: null | PasswordStrengthTrigraphMap;

    addCommonPasswords(passwords: string[] | string): this;
    addTrigraphMap(map: PasswordStrengthTrigraphMap): this;
    charsetGroups(password: string): { [key: string]: boolean | string };
    charsetSize(groups: PasswordStrengthGroups): number;
    check(password: string): PasswordStrengthStatistics;
    checkCommonPasswords(password: string): boolean;
    checkTrigraph(password: string, charsetSize: number): number;
    determineStrength(status: PasswordStrengthStatistics): PasswordStrengthCode;
    nistScore(password: string): number;
    otherChars(password: string): string;
    shannonScore(password: string): number;
}

export interface PasswordStrengthGroups {
    [key: string]: string;
}

export interface PasswordStrengthTrigraphMap {
    [key: string]: number;
}

export interface PasswordStrengthStatistics {
    charsetSize: number;
    commonPassword: boolean;
    nistEntropyBits: number;
    passwordLength: number;
    shannonEntropyBits: number;
    strengthCode: PasswordStrengthCode;
    trigraphEntropyBits: null | number;
    charsets: Record<string, string | RegExp>;
}

export enum PasswordStrengthCode {
    VERY_WEAK = "VERY_WEAK",
    WEAK = "WEAK",
    REASONABLE = "REASONABLE",
    STRONG = "STRONG",
    VERY_STRONG = "VERY_STRONG",
}
