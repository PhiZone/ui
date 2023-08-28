import queryString from 'query-string';
import { createQueryCreator, stringifyFilter } from './common';
import type { FilterBase, R } from './types';
import type { UserDto } from './user';
import type API from '.';

export interface NotificationDto {
  content: string;
  dateCreated: Date;
  dateRead: Date | null;
  id: string;
  operator: UserDto;
  ownerId: number;
  type: number;
}

export interface Filter extends FilterBase {
  markAsRead?: number;
}

export interface InfoOpts {
  id: number;
  markAsRead?: number;
}

export interface DeleteOpts {
  id: number;
}

export default class NotificationAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'comment.list',
    (opts: Filter): R<NotificationDto[]> =>
      this.api.GET('/notifications/?' + stringifyFilter(opts)),
  );

  info = createQueryCreator(
    'comment.info',
    ({ id, ...rest }: InfoOpts): R<NotificationDto> =>
      this.api.GET(`/notifications/${id}/?` + queryString.stringify(rest)),
  );

  del({ id }: DeleteOpts) {
    return this.api.DELETE(`/notifications/${id}/`);
  }
}
