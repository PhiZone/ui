import { createQueryCreator, stringifyFilter } from './common';
import type { FilterBase, PatchElement, R } from './types';
import type API from '.';

export interface ResourceRecordDto {
  authorName: string;
  copyrightOwner: string;
  dateCreated: string;
  dateUpdated: string;
  description: string | null;
  edition: string | null;
  editionType: number;
  id: string;
  source: string;
  strategy: number;
  title: string;
  type: number;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  containsTitle?: string;
  equalsTitle?: string;
  containsAuthorName?: string;
  equalsAuthorName?: string;
  minEditionType?: number;
  maxEditionType?: number;
  rangeEditionType?: number[];
  containsEdition?: string;
  equalsEdition?: string;
  containsCopyrightOwner?: string;
  equalsCopyrightOwner?: string;
  minStrategy?: number;
  maxStrategy?: number;
  rangeStrategy?: number[];
}

// info
export interface InfoOpts {
  id: string;
}

// create
export interface CreateOpts {
  authorName: string;
  copyrightOwner: string;
  description?: string;
  edition?: string;
  editionType: number;
  source: string;
  strategy: number;
  title: string;
  type: number;
}

// delete
export interface DeleteOpts {
  id: string;
}

export default class ResourceRecordAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'resourceRecord.list',
    (opts: Filter): R<ResourceRecordDto[]> =>
      this.api.GET('/resourceRecords?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'resourceRecord.listAll',
    (opts: Filter): R<ResourceRecordDto[]> =>
      this.api.GET('/resourceRecords?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator('resourceRecord.info', ({ id }: InfoOpts): R<ResourceRecordDto> => {
    return this.api.GET(`/resourceRecords/${id}`);
  });

  create(opts: CreateOpts): R {
    return this.api.POST('/resourceRecords', opts);
  }

  createBatch(opts: CreateOpts[]): R {
    return this.api.POST('/resourceRecords/batch', opts);
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/resourceRecords/${id}`, patch);
  }

  delete({ id }: DeleteOpts): R {
    return this.api.DELETE(`/resourceRecords/${id}`);
  }
}
