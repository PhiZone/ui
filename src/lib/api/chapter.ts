import type { ChapterDto, SongAdmitteeDto } from '$lib/models';
import queryString from 'query-string';
import type API from '.';
import { stringifyListOpts, type ListOptsBase, createQueryCreator, type Q } from './common';

// list
export interface ListOpts extends ListOptsBase {
  order?:
    | 'id'
    | 'illustrator'
    | 'likeCount'
    | 'ownerId'
    | 'title'
    | 'subtitle'
    | 'dateCreated'
    | 'dateUpdated';
  // id?: number | number[];
  // title?: string;
  // subtitle?: string;
  // accessibility?: string;
  // owner?: number | number[];
  // query_owner?: number;
  // query_songs?: number;
}
// song list
export interface SongListOpts extends ListOptsBase {
  id: string;
  order?:
    | 'id'
    | 'illustrator'
    | 'likeCount'
    | 'ownerId'
    | 'title'
    | 'authorName'
    | 'dateCreated'
    | 'dateUpdated';
  // title?: string;
  // subtitle?: string;
  // accessibility?: string;
  // owner?: number | number[];
  // query_owner?: number;
  // query_songs?: number;
}

// info
export interface InfoOpts {
  id: string;
}

// create
export interface CreateOpts {
  subtitle: string;
  title: string;
  illustration: string;
  illustrator: string;
  description?: string;
  owner?: number;
  accessibility?: number;
  events_incl?: number;
}

export default class ChapterAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'chapter.list',
    (opts: ListOpts): Q<ChapterDto[]> => this.api.GET('/chapters?' + stringifyListOpts(opts)),
  );

  listAll = createQueryCreator(
    'chapter.listAll',
    (opts: ListOpts): Q<ChapterDto[]> => this.api.GET('/chapters?' + stringifyListOpts(opts, true)),
  );

  info = createQueryCreator(
    'chapter.info',
    ({ id, ...opts }: InfoOpts): Q<ChapterDto> =>
      this.api.GET(`/chapters/${id}?` + queryString.stringify(opts)),
  );

  listSongs = createQueryCreator(
    'chapter.listSongs',
    ({ id, ...rest }: SongListOpts): Q<SongAdmitteeDto[]> =>
      this.api.GET(`/chapters/${id}/songs?` + stringifyListOpts(rest, true)),
  );

  create(opts: CreateOpts) {
    return this.api.POST('/chapters', opts);
  }
}
