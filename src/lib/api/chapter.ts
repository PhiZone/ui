import { serialize } from 'object-to-formdata';

import type API from '.';
import type { SongAdmitteeDto } from './song';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

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
  dateCreated: string;
  dateUpdated: string;
  commentCount: number;
  likeCount: number;
  dateLiked: string | null;
}

export interface Filter extends PublicResourceFilterBase {
  containsSubtitle?: string;
  equalsSubtitle?: string;
}

export interface SongListFilter extends FilterBase {
  id: string;
}

export interface ChapterAdmitterDto extends ChapterDto {
  label: string | null;
}

export interface InfoOpts {
  id: string;
}

export interface CreateOpts {
  Title: string;
  Subtitle: string;
  Illustration: string;
  Illustrator: string;
  Description?: string;
  Accessibility: Accessibility;
  IsHidden: boolean;
  IsLocked: boolean;
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
    return this.api.POST('/chapters', serialize(opts));
  }
}
