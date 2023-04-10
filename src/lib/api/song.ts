import type { Song } from '$lib/models';
import queryString from 'query-string';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import type API from '.';
import SongSubmissionAPI from './song.submission';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'name' | 'composer' | 'illustrator' | 'chapter' | 'duration' | 'uploader';
  id?: number | number[];
  name?: number | number[];
  composer?: string;
  illustrator?: string;
  chapter?: number | number[];
  lowest_duration?: number;
  highest_duration?: number;
  original?: number;
  accessibility?: number | number[];
  uploader?: number | number[];
  query_uploader?: number;
  query_charts?: number;
  query_levels?: number;
}

// info
export interface InfoOpts {
  id: number;
  query_uploader?: number;
  query_charts?: number;
  query_levels?: number;
  query_chapters?: number;
}

export default class SongAPI {
  constructor(private api: API) {
    this.submission = new SongSubmissionAPI(api);
  }

  list = createQueryCreator('song.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<Song>>('/songs/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('song.listAll', (opts: ListOpts) => {
    return this.api.GET<Song[]>('/songs/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('song.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<Song>(`/songs/${id}/?` + queryString.stringify(rest));
  });

  submission;
}
