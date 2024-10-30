import type { IFilters, OrderItem } from './types';

export const chartSubmissionOrderItems: OrderItem[] = [
  {
    label: 'chart.title',
    field: 'Title',
  },
  {
    label: 'chart.level_type',
    field: 'LevelType',
  },
  {
    label: 'chart.level',
    field: 'Level',
  },
  {
    label: 'chart.difficulty',
    field: 'Difficulty',
  },
  {
    label: 'chart.format',
    field: 'Format',
  },
  {
    label: 'common.author_name',
    field: 'AuthorName',
  },
  {
    label: 'common.illustrator',
    field: 'Illustrator',
  },
  {
    label: 'chart.is_ranked',
    field: 'IsRanked',
  },
  {
    label: 'chart.note_count',
    field: 'NoteCount',
  },
  {
    label: 'studio.submission.volunteer_status',
    field: 'VolunteerStatus',
  },
  {
    label: 'studio.submission.admission_status',
    field: 'AdmissionStatus',
  },
  {
    label: 'common.description',
    field: 'Description',
  },
  {
    label: 'common.accessibility',
    field: 'Accessibility',
  },
  {
    label: 'common.status',
    field: 'Status',
  },
  {
    label: 'common.date_file_updated',
    field: 'DateFileUpdated',
  },
  {
    label: 'common.date_updated',
    field: 'DateUpdated',
  },
  {
    label: 'common.date_created',
    field: 'DateCreated',
  },
];

export const chartSubmissionFilters: IFilters = [
  {
    type: 'toggle',
    label: 'chart.is_ranked',
    value: false,
    param: 'IsRanked',
  },
  {
    type: 'radio',
    label: 'common.accessibility',
    value: '',
    param: 'RangeAccessibility',
    items: [
      {
        label: 'common.accessibilities.0',
        value: 0,
      },
      {
        label: 'common.accessibilities.2',
        value: 2,
      },
    ],
  },
  {
    type: 'radio',
    label: 'common.status',
    value: '',
    param: 'RangeStatus',
    items: [
      {
        label: 'studio.submission.statuses.0',
        value: 0,
      },
      {
        label: 'studio.submission.statuses.1',
        value: 1,
      },
      {
        label: 'studio.submission.statuses.2',
        value: 2,
      },
    ],
  },
  {
    type: 'radio',
    label: 'studio.submission.admission_status',
    value: '',
    param: 'RangeAdmissionStatus',
    items: [
      {
        label: 'studio.submission.statuses.0',
        value: 0,
      },
      {
        label: 'studio.submission.statuses.1',
        value: 1,
      },
      {
        label: 'studio.submission.statuses.2',
        value: 2,
      },
    ],
  },
  {
    type: 'radio',
    label: 'studio.submission.volunteer_status',
    value: '',
    param: 'RangeVolunteerStatus',
    items: [
      {
        label: 'studio.submission.statuses.0',
        value: 0,
      },
      {
        label: 'studio.submission.statuses.1',
        value: 1,
      },
      {
        label: 'studio.submission.statuses.2',
        value: 2,
      },
    ],
  },
  {
    type: 'slider',
    label: 'chart.difficulty',
    value: [12.0, 16.0],
    param: ['MinDifficulty', 'MaxDifficulty'],
    options: {
      isRange: true,
      range: [0.0, 18.0],
      step: 0.1,
      pipstep: 10.0,
    },
  },
  {
    type: 'select',
    label: 'chart.format',
    value: [],
    param: 'RangeFormat',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'chart.formats.0',
        value: 0,
      },
      {
        id: 1,
        label: 'chart.formats.1',
        value: 1,
      },
      {
        id: 2,
        label: 'chart.formats.2',
        value: 2,
      },
      {
        id: 3,
        label: 'chart.formats.3',
        value: 3,
      },
      {
        id: 4,
        label: 'chart.formats.4',
        value: 4,
      },
    ],
  },
  {
    type: 'input',
    label: 'chart.level',
    value: '',
    param: 'ContainsLevel',
    options: {
      inputType: 'text',
      placeholder: 'chart.level',
    },
  },
  {
    type: 'select',
    label: 'chart.level_type',
    value: [],
    param: 'RangeLevelType',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'chart.level_types.0',
        value: 0,
      },
      {
        id: 1,
        label: 'chart.level_types.1',
        value: 1,
      },
      {
        id: 2,
        label: 'chart.level_types.2',
        value: 2,
      },
      {
        id: 3,
        label: 'chart.level_types.3',
        value: 3,
      },
      {
        id: 4,
        label: 'chart.level_types.4',
        value: 4,
      },
    ],
  },
  {
    type: 'input_group',
    label: 'chart.note_count',
    items: [
      {
        value: '',
        param: 'MinNoteCount',
        options: {
          inputType: 'number',
          placeholder: 'chart.lowest_note_count',
        },
      },
      {
        value: '',
        param: 'MaxNoteCount',
        options: {
          inputType: 'number',
          placeholder: 'chart.highest_note_count',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'chart.title',
    value: '',
    param: 'ContainsTitle',
    options: {
      inputType: 'text',
      placeholder: 'chart.title',
    },
  },
  {
    type: 'input',
    label: 'common.author_name',
    value: '',
    param: 'ContainsAuthorName',
    options: {
      inputType: 'text',
      placeholder: 'common.author_name',
    },
  },
  {
    type: 'input_group',
    label: 'common.date_created',
    items: [
      {
        value: '',
        param: 'EarliestDateCreated',
        options: {
          inputType: 'text',
          placeholder: 'common.earliest_date_created',
        },
      },
      {
        value: '',
        param: 'LatestDateCreated',
        options: {
          inputType: 'text',
          placeholder: 'common.latest_date_created',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'common.date_updated',
    items: [
      {
        value: '',
        param: 'EarliestDateUpdated',
        options: {
          inputType: 'text',
          placeholder: 'common.earliest_date_updated',
        },
      },
      {
        value: '',
        param: 'LatestDateUpdated',
        options: {
          inputType: 'text',
          placeholder: 'common.latest_date_updated',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'common.description',
    value: '',
    param: 'ContainsDescription',
    options: {
      inputType: 'text',
      placeholder: 'common.description',
    },
  },
  {
    type: 'input',
    label: 'common.illustrator',
    value: '',
    param: 'ContainsIllustrator',
    options: {
      inputType: 'text',
      placeholder: 'common.illustrator',
    },
  },
];
