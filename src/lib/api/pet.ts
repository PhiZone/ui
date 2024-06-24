import type API from '.';
import type { FilterBase, R } from './types';
import { stringifyFilter, createQueryCreator } from './common';

export interface PetQuestionDto {
  choices: string[] | null;
  content: string;
  language: string;
  position: number;
  type: number;
}

export interface PetAnswerDto {
  answer1: string;
  answer2: string;
  answer3: string;
  assessorId?: number | null;
  chart: string;
  dateCreated: string;
  dateUpdated: string;
  id: string;
  objectiveScore: number;
  ownerId: number;
  question1: PetQuestionDto;
  question2: PetQuestionDto;
  question3: PetQuestionDto;
  question4: PetQuestionDto;
  subjectiveScore?: number | null;
  totalScore?: number | null;
}

export interface ObjectiveAnswer {
  choices: number[];
}

export interface SubjectiveAnswer {
  answer1: string;
  answer2: string;
  answer3: string;
  chart: string;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  rangeChartId?: string[];
  rangeOwnerId?: number[];
  rangeAssessorId?: number[];
  minObjectiveScore?: number;
  maxObjectiveScore?: number;
  rangeObjectiveScore?: number[];
  minSubjectiveScore?: number;
  maxSubjectiveScore?: number;
  rangeSubjectiveScore?: number[];
  minTotalScore?: number;
  maxTotalScore?: number;
  rangeTotalScore?: number[];
}

export interface FilterChart extends Filter {
  chartId: string;
}

// info
export interface InfoOpts {
  id: string;
}

// assess
export interface AssessOpts {
  id: string;
  score: number;
}

export default class PetAPI {
  constructor(private api: API) {}

  listObjective(): R<PetQuestionDto[]> {
    return this.api.GET('/pet/objective');
  }

  listSubjective(body: ObjectiveAnswer[]): R<PetQuestionDto[]> {
    return this.api.POST('/pet/objective', body);
  }

  answerSubjective(body: SubjectiveAnswer): R {
    return this.api.POST('/pet/subjective', body);
  }

  getAnswers(opts: Filter): R<PetAnswerDto[]> {
    return this.api.GET('/pet/answers?' + stringifyFilter(opts));
  }

  getAnswer({ id }: InfoOpts): R<PetAnswerDto> {
    return this.api.GET(`/pet/answers/${id}`);
  }

  listAnswers = createQueryCreator(
    'pet.answer.list',
    (opts: Filter): R<PetAnswerDto[]> => this.api.GET('/pet/answers?' + stringifyFilter(opts)),
  );

  assess({ id, ...rest }: AssessOpts): R {
    return this.api.PATCH(`/pet/answers/${id}`, rest);
  }
}
