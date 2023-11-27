import type { ChartSubmissionDto, SongSubmissionDto, SongDto, ChapterDto } from '.';
import type API from '.';
import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';

export interface SongAdmissionDto {
  admittee: ChartSubmissionDto;
  admitter: SongDto;
  dateCreated: Date;
  label: null | string;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface SongSubmissionAdmissionDto {
  admittee: ChartSubmissionDto;
  admitter: SongSubmissionDto;
  dateCreated: Date;
  label: null | string;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface ChapterAdmissionDto {
  admittee: SongDto;
  admitter: ChapterDto;
  dateCreated: Date;
  label: null | string;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface Filter extends FilterBase {
  rangeRequesterId?: number[];
  rangeRequesteeId?: number[];
  rangeAdmitterId?: string[];
  rangeAdmitteeId?: string[];
}

// info
export interface InfoOpts {
  admitterId: string;
  admitteeId: string;
}

// create
export interface CreateOpts {
  id: string;
  admitterId: string;
  label: null | string;
}

// review
export interface ReviewOpts {
  type: 'chapters' | 'songs' | 'songSubmissions';
  admitterId: string;
  admitteeId: string;
  approve: boolean;
}

// delete
export interface DeleteOpts {
  admitterId: string;
  admitteeId: string;
}

export default class AdmissionAPI {
  constructor(private api: API) {}

  listChapter = createQueryCreator(
    'admission.list.chapter',
    (opts: Filter): R<ChapterAdmissionDto[]> =>
      this.api.GET('/admissions/chapters?' + stringifyFilter(opts)),
  );

  listSong = createQueryCreator(
    'admission.list.song',
    (opts: Filter): R<SongAdmissionDto[]> =>
      this.api.GET('/admissions/songs?' + stringifyFilter(opts)),
  );

  listSongSubmission = createQueryCreator(
    'admission.list.songSubmission',
    (opts: Filter): R<SongSubmissionAdmissionDto[]> =>
      this.api.GET('/admissions/songSubmissions?' + stringifyFilter(opts)),
  );

  infoChapter = createQueryCreator(
    'admission.info.chapter',
    ({ admitterId, admitteeId }: InfoOpts): R<ChapterAdmissionDto> =>
      this.api.GET(`/admissions/chapters/${admitterId}/${admitteeId}`),
  );

  infoSong = createQueryCreator(
    'admission.info.song',
    ({ admitterId, admitteeId }: InfoOpts): R<SongAdmissionDto> =>
      this.api.GET(`/admissions/songs/${admitterId}/${admitteeId}`),
  );

  infoSongSubmission = createQueryCreator(
    'admission.info.songSubmission',
    ({ admitterId, admitteeId }: InfoOpts): R<SongSubmissionAdmissionDto> =>
      this.api.GET(`/admissions/songSubmissions/${admitterId}/${admitteeId}`),
  );

  createChapterAdmission({ id, ...rest }: CreateOpts): R {
    return this.api.POST(`/songs/${id}/chapters`, rest);
  }

  review({ type, admitterId, admitteeId, ...rest }: ReviewOpts): R {
    return this.api.POST(`/admissions/${type}/${admitterId}/${admitteeId}/review`, rest);
  }

  deleteChapterAdmission({ admitterId, admitteeId }: DeleteOpts): R {
    return this.api.DELETE(`/admissions/chapters/${admitterId}/${admitteeId}`);
  }
}
