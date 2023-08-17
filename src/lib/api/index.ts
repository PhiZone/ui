import { ContentType, defaultLocale } from '$lib/constants';
import { locale } from '$lib/translations/config';
import type { UserDetailedDto } from '$lib/models';
import { PUBLIC_API_BASE } from '$env/static/public';
import AuthAPI from './auth';
import ChapterAPI from './chapter';
import ChartAPI from './chart';
import CommentAPI from './comment';
import HeadlineAPI from './headline';
import LikeAPI from './like';
import NotificationAPI from './notification';
import RecordAPI from './record';
import RelationAPI from './relation';
import ReplyAPI from './reply';
import SongAPI from './song';
import UserAPI from './user';
import VoteAPI from './vote';
import { browser } from '$app/environment';

type Fetch = <R extends Response>(input: RequestInfo | URL, init?: RequestInit) => Promise<R>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SendBody = FormData | URLSearchParams | Record<string, any> | string;

export default class API {
  constructor(
    public fetch: Fetch,
    public access_token?: string,
    public _user?: UserDetailedDto,
  ) {}

  send<R extends Response>(path: string, method: string, body?: SendBody): Promise<R> {
    const headers = new Headers();

    if (!(body instanceof FormData || body instanceof URLSearchParams)) {
      body = JSON.stringify(body);
      headers.append('Content-Type', ContentType.JSON);
    }
    if (!browser || import.meta.env.DEV) console.log(path, body);

    if (this.access_token) headers.append('Authorization', `Bearer ${this.access_token}`);
    headers.append('User-Agent', 'PhiZoneRegularAccess');
    headers.set('Accept-Language', locale.get() ?? this._user?.language ?? defaultLocale);

    return this.fetch(`${PUBLIC_API_BASE}${path}`, { method, headers, body });
  }

  GET(path: string) {
    return this.send(path, 'GET');
  }

  DELETE(path: string) {
    return this.send(path, 'DELETE');
  }

  POST(path: string, body?: SendBody) {
    return this.send(path, 'POST', body);
  }

  PUT(path: string, body?: SendBody) {
    return this.send(path, 'PUT', body);
  }

  HEAD(path: string, body?: SendBody) {
    return this.send(path, 'HEAD', body);
  }

  PATCH(path: string, body?: SendBody) {
    return this.send(path, 'PATCH', body);
  }

  auth = new AuthAPI(this);
  chapter = new ChapterAPI(this);
  chart = new ChartAPI(this);
  comment = new CommentAPI(this);
  headline = new HeadlineAPI(this);
  like = new LikeAPI(this);
  notification = new NotificationAPI(this);
  record = new RecordAPI(this);
  relation = new RelationAPI(this);
  reply = new ReplyAPI(this);
  song = new SongAPI(this);
  user = new UserAPI(this);
  vote = new VoteAPI(this);
}
