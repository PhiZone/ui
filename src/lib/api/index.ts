import { PUBLIC_API_BASE } from '$env/static/public';
import { ContentType } from '$lib/constants';

import AdmissionAPI from './admission';
import ApplicationAPI from './application';
import AuthAPI from './auth';
import AuthorshipAPI from './authorship';
import ChapterAPI from './chapter';
import ChartAPI from './chart';
import CollaborationAPI from './collaboration';
import CollectionAPI from './collection';
import CommentAPI from './comment';
import EventAPI from './event';
import HeadlineAPI from './headline';
import LikeAPI from './like';
import NotificationAPI from './notification';
import PetAPI from './pet';
import PlayConfigurationAPI from './playConfiguration';
import RecordAPI from './record';
import ReplyAPI from './reply';
import ResourceRecordAPI from './resourceRecord';
import ServiceScriptAPI from './service';
import SongAPI from './song';
import SubmissionAPI from './submission';
import TagAPI from './tag';
import UserAPI from './user';
import VoteAPI from './vote';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SendBody = FormData | URLSearchParams | Record<string, any> | string;

export default class API {
  constructor(
    public fetch: typeof globalThis.fetch,
    public access_token?: string,
    // public _user?: UserDetailedDto,
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
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m \x1b[44mAPI\x1b[0m`,
        path + (body ? ` ${body}` : ''),
      );

    if (this.access_token) headers.append('Authorization', `Bearer ${this.access_token}`);
    headers.append('User-Agent', 'PhiZoneRegularAccess');
    // headers.set('Accept-Language', locale.get() ?? this._user?.language ?? defaultLocale);

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

  admission = new AdmissionAPI(this);
  application = new ApplicationAPI(this);
  auth = new AuthAPI(this);
  authorship = new AuthorshipAPI(this);
  chapter = new ChapterAPI(this);
  chart = new ChartAPI(this);
  collaboration = new CollaborationAPI(this);
  collection = new CollectionAPI(this);
  comment = new CommentAPI(this);
  event = new EventAPI(this);
  headline = new HeadlineAPI(this);
  like = new LikeAPI(this);
  notification = new NotificationAPI(this);
  pet = new PetAPI(this);
  playConfiguration = new PlayConfigurationAPI(this);
  record = new RecordAPI(this);
  reply = new ReplyAPI(this);
  resourceRecord = new ResourceRecordAPI(this);
  song = new SongAPI(this);
  submission = new SubmissionAPI(this);
  service = new ServiceScriptAPI(this);
  tag = new TagAPI(this);
  user = new UserAPI(this);
  vote = new VoteAPI(this);
}

export type { ApplicationDto } from './application';
export type { ChapterDto } from './chapter';
export { type ChartDto, ChartFormat } from './chart';
export type { ChartSubmissionDto } from './chart.submission';
export type { CollectionDto } from './collection';
export type { CommentDto } from './comment';
export type { NotificationDto } from './notification';
export type { RecordDto } from './record';
export type { ReplyDto } from './reply';
export type { ChartLevelDto, SongAdmitteeDto, SongDto } from './song';
export type { SongSubmissionDto } from './song.submission';
export { Gender, type UserDetailedDto, type UserDto } from './user';
export type { VoteDto } from './vote';
