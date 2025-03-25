import { serialize } from 'object-to-formdata';

import type API from '.';
import type { SongDto } from '.';
import type { CreateOpts as ChartAssetCreateOpts } from './chart.asset';
import type { CreateOpts as ChartCreateOpts } from './chart.submission';
import type { ResourceRecordDto } from './resourceRecord';
import type { CreateOpts as SongCreateOpts, SongSubmissionDto } from './song.submission';
import type { R } from './types';

export interface SubmissionSongDto {
  resourceRecordMatches: ResourceRecordMatchDto[];
  songMatches: SongMatchDto[];
  songSubmissionMatches: SongSubmissionMatchDto[];
}

export interface ResourceRecordMatchDto extends ResourceRecordDto {
  score: number;
}

export interface SongMatchDto extends SongDto {
  score: number;
}

export interface SongSubmissionMatchDto extends SongSubmissionDto {
  score: number;
}

export interface IdDto {
  id: string;
}

export interface SongUploadOpts extends IdDto {
  Song: Blob;
  Illustration: Blob;
}

export default class SubmissionAPI {
  constructor(private api: API) {}

  createSession(): R<IdDto> {
    return this.api.POST('/studio/submissions');
  }

  uploadSong({ id, ...rest }: SongUploadOpts): R<SubmissionSongDto> {
    return this.api.POST(`/studio/submissions/${id}/song`, serialize(rest));
  }

  createSong({
    id,
    ...rest
  }: IdDto & Omit<Omit<SongCreateOpts, 'File'>, 'Illustration'>): R<IdDto> {
    return this.api.POST(`/studio/submissions/${id}/song/new`, serialize(rest));
  }

  uploadChart({ id, ...rest }: IdDto & ChartCreateOpts): R {
    return this.api.POST(`/studio/submissions/${id}/chart`, serialize(rest));
  }

  createChartAsset({ id, ...rest }: IdDto & ChartAssetCreateOpts): R {
    return this.api.POST(`/studio/submissions/${id}/chart/assets`, serialize(rest));
  }

  createChart({ id }: IdDto): R<IdDto> {
    return this.api.POST(`/studio/submissions/${id}/chart/new`);
  }
}
