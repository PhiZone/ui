import { ContentType, defaultLocale } from '$lib/constants';
import { locale } from '$lib/translations/config';
import type { UserDetailedDto } from '$lib/models';
import { PUBLIC_API_BASE } from '$env/static/public';
import ChapterAPI from './chapter';
import ChartAPI from './chart';
import CommentAPI from './comment';
import HeadlineAPI from './headline';
import LikeAPI from './like';
import NotificationAPI from './notification';
import RecordAPI from './record';
import RelationAPI from './relation';
import ReplyAPI from './reply';
import SessionAPI from './session';
import SongAPI from './song';
import UserAPI from './user';
import VoteAPI from './vote';
import { browser } from '$app/environment';

interface SendOpts<T> {
  method: string;
  path: string;
  data?: T;
}

export default class API {
  constructor(
    public fetch: typeof window.fetch,
    public access_token?: string,
    public _user?: UserDetailedDto,
  ) {}

  send<T, R>({ method, path, data }: SendOpts<T>): Promise<TypedResponse<R>> {
    const headers = new Headers();
    const init: RequestInit = { method, headers };

    if (data) {
      if (data instanceof FormData) {
        init.body = data;
      } else if (data instanceof URLSearchParams) {
        init.body = data;
        headers.append('Content-Type', ContentType.FORM_URLENCODED);
      } else {
        init.body = JSON.stringify(data);
        headers.append('Content-Type', ContentType.JSON);
      }
    }
    if (!browser || import.meta.env.DEV) console.log(path, data);

    if (this.access_token) headers.append('Authorization', `Bearer ${this.access_token}`);
    headers.append('User-Agent', 'PhiZoneRegularAccess');
    headers.set('Accept-Language', locale.get() ?? this._user?.language ?? defaultLocale);

    return this.fetch(`${PUBLIC_API_BASE}${path}`, init);
  }

  GET<R>(path: string) {
    return this.send<undefined, R>({ method: 'GET', path });
  }

  DELETE<R>(path: string) {
    return this.send<undefined, R>({ method: 'DELETE', path });
  }

  POST<T, R>(path: string, data?: T) {
    return this.send<T, R>({ method: 'POST', path, data });
  }

  PUT<T, R>(path: string, data: T) {
    return this.send<T, R>({ method: 'PUT', path, data });
  }

  HEAD<T, R>(path: string, data: T) {
    return this.send<T, R>({ method: 'HEAD', path, data });
  }

  PATCH<T, R>(path: string, data: T) {
    return this.send<T, R>({ method: 'PATCH', path, data });
  }

  chapter = new ChapterAPI(this);
  chart = new ChartAPI(this);
  comment = new CommentAPI(this);
  headline = new HeadlineAPI(this);
  like = new LikeAPI(this);
  notification = new NotificationAPI(this);
  record = new RecordAPI(this);
  relation = new RelationAPI(this);
  reply = new ReplyAPI(this);
  session = new SessionAPI(this);
  song = new SongAPI(this);
  user = new UserAPI(this);
  vote = new VoteAPI(this);
}
