import type { HostshipDto } from './api/event';

const OPERATION = 26;
const SCOPE = 28;

export const RETRIEVE = 0b00;
export const CREATE = 0b01;
export const UPDATE = 0b10;
export const REMOVE = 0b11;

export const DIVISION = 0b0000;
export const TEAM = 0b0001;
export const RESOURCE = 0b0010;
export const HOSTSHIP = 0b0011;
export const RESERVED_FIELD = 0b0100;

export const hasPermission = (hostship: HostshipDto, permission: number) => {
  return (
    hostship.permissions?.includes(permission) ||
    hostship.permissions?.some((p) => p === (permission >> OPERATION) << OPERATION)
  );
};

export const gen = (operation: number, scope: number, index: number | null = null) => {
  if (index !== null && (index & (1 << OPERATION)) !== 0) throw new Error('Index is out of range.');
  return (operation << OPERATION) | (scope << SCOPE) | (index !== null ? index : 0);
};
export const analyze = (permission: number) => {
  return {
    operation: (permission >> OPERATION) - ((permission >> SCOPE) << (SCOPE - OPERATION)),
    scope: permission >> SCOPE,
    index: permission - ((permission >> OPERATION) << OPERATION),
  };
};
