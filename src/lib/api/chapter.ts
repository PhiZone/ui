import type { Chapter } from '$lib/models';
import queryString from 'query-string';
import type API from '.';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'illustrator' | 'like_count' | 'owner' | 'title' | 'subtitle' | 'time';
  id?: number | number[];
  title?: string;
  subtitle?: string;
  accessibility?: string;
  owner?: number | number[];
  query_owner?: number;
  query_songs?: number;
}

// info
export interface InfoOpts {
  id: number;
  query_owner?: number;
  query_songs?: number;
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

  list = createQueryCreator('chapter.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<Chapter>>('/chapters/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('chapter.listAll', (opts: ListOpts) => {
    return this.api.GET<Chapter[]>('/chapters/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('chapter.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<Chapter>(`/chapters/${id}/?` + queryString.stringify(rest));
  });

  create = createQueryCreator('chapter.create', (opts: CreateOpts) => {
    return this.api.POST<CreateOpts, Chapter>('/chapters/', opts);
  });
}
