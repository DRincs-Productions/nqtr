export namespace logger {
    export const log = (message?: any, ...optionalParams: any[]) => console.log(`[NQTR] ${message}`, ...optionalParams);
    export const warn = (message?: any, ...optionalParams: any[]) =>
        console.warn(`[NQTR] ${message}`, ...optionalParams);
    export const error = (message?: any, ...optionalParams: any[]) =>
        console.error(`[NQTR] ${message}`, ...optionalParams);
    export const info = (message?: any, ...optionalParams: any[]) =>
        console.info(`[NQTR] ${message}`, ...optionalParams);
}
