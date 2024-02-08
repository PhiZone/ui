import type { UserDto } from '.';
import type API from '.';
import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';

export interface AuthorDto extends UserDto {
  position: string | null;
}

export interface Filter extends FilterBase {
  containsPosition?: string;
  equalsPosition?: string;
  rangeAuthorId?: number[];
  rangeResourceId?: string[];
}

// info
export interface InfoOpts {
  id: string;
}

export default class AuthorshipAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'authorship.list',
    (opts: Filter): R<AuthorDto[]> => this.api.GET('/authorships?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'authorship.listAll',
    (opts: Filter): R<AuthorDto[]> => this.api.GET('/authorships?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'authorship.info',
    ({ id }: InfoOpts): R<AuthorDto> => this.api.GET(`/authorships/${id}`),
  );
}
