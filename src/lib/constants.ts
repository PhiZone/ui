export enum Status {
    OK,
    WAITING,
    ERROR,
    INVALID_PARAMS,
    INPUT_REQUIRED,
}

export enum Error {
    INVALID_GRANT = 'invalid_grant',
}

export enum ContentType {
    JSON = 'application/json',
    FORM_DATA = 'multipart/form-data',
}

export enum Size {
    SMALL,
    MEDIUM,
    LARGE,
}
