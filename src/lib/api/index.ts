import { ContentType, defaultLocale } from '$lib/constants';
import { locale } from '$lib/translations/config';
import { PUBLIC_API_BASE } from '$env/static/public';
import AuthAPI from './auth';
import ChapterAPI from './chapter';
import ChartAPI from './chart';
import CommentAPI from './comment';
import HeadlineAPI from './headline';
import LikeAPI from './like';
import NotificationAPI from './notification';
import RecordAPI from './record';
import ReplyAPI from './reply';
import SongAPI from './song';
import UserAPI, { type UserDetailedDto } from './user';
import VoteAPI from './vote';
import CollaborationAPI from './collaboration';
import PetAPI from './pet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SendBody = FormData | URLSearchParams | Record<string, any> | string;

export default class API {
  constructor(
    public fetch: typeof globalThis.fetch,
    public access_token?: string,
    public _user?: UserDetailedDto,
  ) {}

  send(path: string, method: string, body?: SendBody): Promise<Response> {
    const headers = new Headers();

    if (body instanceof FormData) {
      // headers.append('Content-Type', ContentType.FORM_DATA);
    } else if (body instanceof URLSearchParams) {
      // headers.append('Content-Type', ContentType.FORM_URLENCODED);
    } else {
      body = JSON.stringify(body);
      headers.append('Content-Type', ContentType.JSON);
    }
    if (import.meta.env.DEV)
      console.log(
        `\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m \x1b[44mAPI\x1b[0m`,
        path + (body ? ` ${body}` : ''),
      );

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
  reply = new ReplyAPI(this);
  song = new SongAPI(this);
  user = new UserAPI(this);
  vote = new VoteAPI(this);
  collaboration = new CollaborationAPI(this);
  pet = new PetAPI(this);
}

export type { ChapterDto } from './chapter';
export { ChartFormat, type ChartDto } from './chart';
export type { CommentDto } from './comment';
export type { NotificationDto } from './notification';
export type { RecordDto } from './record';
export type { ReplyDto } from './reply';
export type { ChartLevelDto, SongDto, SongAdmitteeDto } from './song';
export { Gender, type UserDto, type UserDetailedDto } from './user';
export type { VoteDto } from './vote';
