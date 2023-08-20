import queryString from 'query-string';
import { createQueryCreator, type Q } from './common';
import type API from '.';
import type { NotificationDto } from '$lib/models';

// list
export interface ListOpts {
  markAsRead?: number;
}

// info
export interface InfoOpts {
  id: number;
  markAsRead?: number;
}

// delete
export interface DelOpts {
  id: number;
}

export default class NotificationAPI {
  constructor(private api: API) {}

  list = createQueryCreator('comment.list', (opts: ListOpts): Q<NotificationDto[]> => {
    return this.api.GET('/notifications/?' + queryString.stringify(opts));
  });

  listAll = createQueryCreator('comment.listAll', (opts: ListOpts): Q<NotificationDto[]> => {
    return this.api.GET('/notifications/?pagination=0&' + queryString.stringify(opts));
  });

  info = createQueryCreator('comment.info', (opts: InfoOpts): Q<NotificationDto> => {
    const { id, ...rest } = opts;
    return this.api.GET(`/notifications/${id}/?` + queryString.stringify(rest));
  });

  del(opts: DelOpts) {
    return this.api.DELETE(`/notifications/${opts.id}/`);
  }
}
