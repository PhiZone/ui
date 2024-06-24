import { stringifyFilter, createQueryCreator } from './common';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';
import type { ChartAdmitteeDto } from './chart';
import type API from '.';
import { serialize } from 'object-to-formdata';

export interface CollectionDto {
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

export interface ChartListFilter extends FilterBase {
  id: string;
}

export interface CollectionAdmitterDto extends CollectionDto {
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

export default class CollectionAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'collection.list',
    (opts: Filter): R<CollectionDto[]> => this.api.GET('/collections?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'collection.listAll',
    (opts: Filter): R<CollectionDto[]> =>
      this.api.GET('/collections?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'collection.info',
    ({ id }: InfoOpts): R<CollectionDto> => this.api.GET(`/collections/${id}`),
  );

  listCharts = createQueryCreator(
    'collection.listCharts',
    ({ id, ...rest }: ChartListFilter): R<ChartAdmitteeDto[]> =>
      this.api.GET(`/collections/${id}/charts?` + stringifyFilter(rest, true)),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/collections', serialize(opts));
  }
}
