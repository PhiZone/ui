import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';
import type API from '.';

export interface ApplicationDto {
  apiEndpoint: string | null;
  avatar: string;
  commentCount: number;
  dateCreated: string;
  dateLiked: string | null;
  dateUpdated: string;
  description: string | null;
  homepage: string;
  id: string;
  illustration: string;
  illustrator: string;
  likeCount: number;
  name: string;
  ownerId: number;
  type: number;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  containsName?: string;
  equalsName?: string;
  minType?: number;
  maxType?: number;
  rangeType?: number[];
  containsHomepage?: string;
  equalsHomepage?: string;
  containsApiEndpoint?: string;
  equalsApiEndpoint?: string;
  containsIllustrator?: string;
  equalsIllustrator?: string;
  rangeOwnerId?: number[];
}

// info
export interface InfoOpts {
  id: string;
}

export default class ApplicationAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'application.list',
    (opts: Filter): R<ApplicationDto[]> => this.api.GET('/applications?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'application.listAll',
    (opts: Filter): R<ApplicationDto[]> =>
      this.api.GET('/applications?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'application.info',
    ({ id }: InfoOpts): R<ApplicationDto> => this.api.GET(`/applications/${id}`),
  );
}
