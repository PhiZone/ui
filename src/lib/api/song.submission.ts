import { serialize } from 'object-to-formdata';
import queryString from 'query-string';
import type { SongSubmission } from '$lib/api';
import {
  stringifyFilter,
  type ListOptsBase,
  type ResponseDto,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'name' | 'composer' | 'illustrator' | 'chapters' | 'uploader' | 'reviewer';
  id?: number | number[];
  name?: string;
  composer?: string;
  illustrator?: string;
  chapters?: number | number[];
  status?: string;
  uploader?: number | number[];
  representation?: string;
  accessibility?: string;
  query_uploader?: number;
  query_reviewer?: number;
  query_chapters?: number;
}

// info
export interface InfoOpts {
  id: number;
  query_uploader?: number;
  query_reviewer?: number;
  query_chapters?: number;
}

// upload
export interface UploadOpts {
  name: string;
  song: Blob;
  edition: string;
  composer: string;
  illustration: Blob;
  lyrics?: string;
  bpm: string;
  offset: number;
  preview_start: string;
  preview_end: string;
  chapters?: string;
}

// modify
export interface ModifyOpts {
  id: string;
  name?: string;
  song?: Blob;
  composer?: string;
  illustration?: Blob;
  illustrator?: string;
  lyrics?: string;
  bpm?: string;
  accessibility?: number;
}

export default class SongSubmissionAPI {
  constructor(private api: API) {}

  list = createQueryCreator('song.submission.list', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<SongSubmission>>(
      '/song_submission/?' + stringifyFilter(opts),
    );
  });

  listAll = createQueryCreator('song.submission.listAll', (opts: ListOpts) => {
    return this.api.GET<SongSubmission[]>('/song_submission/?' + stringifyFilter(opts, true));
  });

  info = createQueryCreator('song.submission.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<SongSubmission>(`/song_uploads/${id}/?` + queryString.stringify(rest));
  });

  upload(opts: UploadOpts) {
    return this.api.POST<FormData, void>('/song_uploads/', serialize(opts));
  }

  modify(opts: ModifyOpts) {
    const { id, ...rest } = opts;
    return this.api.PATCH<FormData | typeof rest, void>(
      `/song_uploads/${id}/`,
      rest.song || rest.illustration ? serialize(rest) : rest,
    );
  }
}
