import type { Notification } from '$lib/models';
import queryString from 'query-string';
import { createQueryCreator, type ResponseDto } from './common';
import type API from '.';

// list
export interface ListOpts {
  mark_as_read?: number;
}

// info
export interface InfoOpts {
  id: number;
  mark_as_read?: number;
}

// delete
export interface DelOpts {
  id: number;
}

export default class NotificationAPI {
  constructor(private api: API) {}

  list = createQueryCreator('comment.list', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<Notification>>(
      '/notifications/?' + queryString.stringify(opts),
    );
  });

  listAll = createQueryCreator('comment.listAll', (opts: ListOpts) => {
    return this.api.GET<Notification[]>(
      '/notifications/?pagination=0&' + queryString.stringify(opts),
    );
  });

  info = createQueryCreator('comment.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<Notification>(`/notifications/${id}/?` + queryString.stringify(rest));
  });

  del(opts: DelOpts) {
    return this.api.DELETE<void>(`/notifications/${opts.id}/`);
  }
}
