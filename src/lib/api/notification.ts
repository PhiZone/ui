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
  operator: UserDto | null;
  ownerId: number;
  type: number;
}

export interface Filter extends FilterBase {
  getRead?: boolean;
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
    'notification.list',
    (opts: Filter): R<NotificationDto[]> => this.api.GET('/notifications?' + stringifyFilter(opts)),
  );

  readList(opts: Filter) {
    return this.api.POST('/notifications/read?' + stringifyFilter(opts));
  }

  info = createQueryCreator(
    'notification.info',
    ({ id, ...rest }: InfoOpts): R<NotificationDto> =>
      this.api.GET(`/notifications/${id}?` + queryString.stringify(rest)),
  );

  del({ id }: DeleteOpts) {
    return this.api.DELETE(`/notifications/${id}/`);
  }
}
