import type { AdmissionDto, ChapterDto, SongDto } from '$lib/models';
import queryString from 'query-string';
import {
  stringifyListOpts,
  type ListOptsBase,
  type ResponseDto,
  createQueryCreator,
} from './common';
import type API from '.';
import SongSubmissionAPI from './song.submission';

// list
export interface ListOpts extends ListOptsBase {
  order?: 'title' | 'authorName' | 'illustrator' | 'duration' | 'ownerId' | 'dateCreated';
  rangeId?: string[];
  rangeOwnerId?: number[];
  // name?: number | number[];
  // composer?: string;
  // illustrator?: string;
  // chapter?: number | number[];
  // lowest_duration?: number;
  // highest_duration?: number;
  // original?: number;
  // accessibility?: number | number[];
  // uploader?: number | number[];
  // query_uploader?: number;
  // query_charts?: number;
  // query_levels?: number;
}

// info
export interface InfoOpts {
  id: string;
}

export interface AdmissionListOpts extends InfoOpts, ListOptsBase {
  rangeStatus?: number[];
  containsLabel?: string;
  equalsLabel?: string;
}

export default class SongAPI {
  constructor(private api: API) {
    this.submission = new SongSubmissionAPI(api);
  }

  list = createQueryCreator('song.list', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<SongDto[]>>('/songs?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('song.listAll', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<SongDto[]>>('/songs?' + stringifyListOpts(opts, true));
  });

  listAllAdmitters = createQueryCreator('song.listAll', (opts: AdmissionListOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<ResponseDto<AdmissionDto<SongDto, ChapterDto>[]>>(
      `/songs/${id}/chapters?` + stringifyListOpts(rest, true),
    );
  });

  info = createQueryCreator('song.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<ResponseDto<SongDto>>(`/songs/${id}?` + queryString.stringify(rest));
  });

  submission;
}
