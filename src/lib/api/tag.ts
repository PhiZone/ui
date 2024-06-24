import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';
import type API from '.';

export interface TagDto {
  dateCreated: string;
  description: string | null;
  id: string;
  name: string;
  normalizedName: string;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  containsName?: string;
  equalsName?: string;
  containsNormalizedName?: string;
  equalsNormalizedName?: string;
  containsDescription?: string;
  equalsDescription?: string;
  earliestDateCreated?: Date;
  latestDateCreated?: Date;
}

// info
export interface InfoOpts {
  id: string;
}

export default class TagAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'tag.list',
    (opts: Filter): R<TagDto[]> => this.api.GET('/tags?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'tag.listAll',
    (opts: Filter): R<TagDto[]> => this.api.GET('/tags?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'tag.info',
    ({ id }: InfoOpts): R<TagDto> => this.api.GET(`/tags/${id}`),
  );
}
