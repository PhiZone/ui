import { stringifyFilter, createQueryCreator, formdata } from './common';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';
import type { SongAdmitteeDto } from './song';
import type API from '.';

export interface ChapterDto {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
  illustrator: string;
  description: string | null;
  accessibility: Accessibility;
  isHidden: boolean;
  isLocked: boolean;
  ownerId: number;
  dateCreated: Date;
  dateUpdated: Date;
  commentCount: number;
  likeCount: number;
  dateLiked: Date | null;
}

export interface Filter extends PublicResourceFilterBase {
  order?:
    | 'id'
    | 'illustrator'
    | 'likeCount'
    | 'ownerId'
    | 'title'
    | 'subtitle'
    | 'dateCreated'
    | 'dateUpdated';
  containsSubtitle?: string;
  equalsSubtitle?: string;
}

export interface SongListFilter extends FilterBase {
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
}

export interface InfoOpts {
  id: string;
}

export interface CreateOpts {
  title: string;
  subtitle: string;
  illustration: string;
  illustrator: string;
  description?: string;
  accessibility: Accessibility;
  isHidden: boolean;
  isLocked: boolean;
}

export default class ChapterAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'chapter.list',
    (opts: Filter): R<ChapterDto[]> => this.api.GET('/chapters?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'chapter.listAll',
    (opts: Filter): R<ChapterDto[]> => this.api.GET('/chapters?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'chapter.info',
    ({ id }: InfoOpts): R<ChapterDto> => this.api.GET(`/chapters/${id}`),
  );

  listSongs = createQueryCreator(
    'chapter.listSongs',
    ({ id, ...rest }: SongListFilter): R<SongAdmitteeDto[]> =>
      this.api.GET(`/chapters/${id}/songs?` + stringifyFilter(rest, true)),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/chapters', formdata(opts));
  }
}
