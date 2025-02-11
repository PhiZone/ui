import queryString from 'query-string';

import type API from '.';
import type { FilterBase, R } from './types';
import type { UserDto } from './user';

import { createQueryCreator, stringifyFilter } from './common';

export interface NotificationDto {
  content: string;
  dateCreated: string;
  dateRead: string | null;
  id: string;
  operator: UserDto | null;
  ownerId: number;
  type: number;
}

export interface Filter extends FilterBase {
  getRead?: boolean;
}

export interface InfoOpts {
  id: string;
}

export interface DeleteOpts {
  id: string;
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

  read({ id }: InfoOpts) {
    return this.api.POST(`/notifications/${id}/read`);
  }

  del({ id }: DeleteOpts) {
    return this.api.DELETE(`/notifications/${id}`);
  }
}
