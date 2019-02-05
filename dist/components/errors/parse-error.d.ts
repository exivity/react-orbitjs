export interface IParsedError {
    title: string;
    body?: string | string[];
}
export declare function parseError(error: any): IParsedError;
