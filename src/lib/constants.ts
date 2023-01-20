export const API_BASE = 'http://localhost:8000';
export const PAGINATION_PER_PAGE = 12
export const USER_LEVELS = [
    {exp: 10, level: 1},
    {exp: 50, level: 2},
    {exp: 100, level: 3},
    {exp: 500, level: 4},
    {exp: 1000, level: 5},
    {exp: 5000, level: 6},
    {exp: 10000, level: 7},
    {exp: 30000, level: 8},
    {exp: 60000, level: 9},
    {exp: 100000, level: 10},
]

export enum Status {
    OK,
    RETRIEVING, // Retrieving data from API
    SENDING,    // Sending data to API
    ERROR,
    INVALID_DATA,
    WAITING,    // Waiting for user's input
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
