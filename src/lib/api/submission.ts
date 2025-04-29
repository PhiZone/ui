import { serialize } from 'object-to-formdata';

import type API from '.';
import type { SongDto } from '.';
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

export interface ChartAssetCreateOpts {
  File: Blob;
  Name: string;
  Type: number;
}

export default class SubmissionAPI {
  constructor(private api: API) {}

  createSession(): R<IdDto> {
    return this.api.POST('/studio/submissions');
  }

  uploadSong({ id, ...rest }: SongUploadOpts): R<SubmissionSongDto> {
    return this.api.POST(`/studio/submissions/${id}/song`, serialize(rest));
  }

  createSong(id: string, opts: Omit<Omit<SongCreateOpts, 'File'>, 'Illustration'>): R<IdDto> {
    return this.api.POST(`/studio/submissions/${id}/song/new`, serialize(opts));
  }

  uploadChart(id: string, opts: ChartCreateOpts): R {
    return this.api.POST(`/studio/submissions/${id}/chart`, serialize(opts));
  }

  createChartAsset(id: string, opts: ChartAssetCreateOpts): R {
    return this.api.POST(`/studio/submissions/${id}/chart/assets`, serialize(opts));
  }

  createChart(id: string): R<IdDto> {
    return this.api.POST(`/studio/submissions/${id}/chart/new`);
  }
}
