import type { IFilters, OrderItem } from './types';

export const songSubmissionOrderItems: OrderItem[] = [
  {
    label: 'song_submission.title',
    field: 'Title',
  },
  {
    label: 'song_submission.edition_type',
    field: 'EditionType',
  },
  {
    label: 'song_submission.edition',
    field: 'Edition',
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
    label: 'song_submission.bpm',
    field: 'Bpm',
  },
  {
    label: 'song_submission.min_bpm',
    field: 'MinBpm',
  },
  {
    label: 'song_submission.max_bpm',
    field: 'MaxBpm',
  },
  {
    label: 'song_submission.offset',
    field: 'Offset',
  },
  {
    label: 'song_submission.originality_proof',
    field: 'OriginalityProof',
  },
  {
    label: 'song_submission.duration',
    field: 'Duration',
  },
  {
    label: 'song_submission.message',
    field: 'Message',
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
    label: 'song_submission.status',
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
export const songSubmissionFilters: IFilters = [
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
        label: 'common.accessibilities.1',
        value: 1,
      },
      {
        label: 'common.accessibilities.2',
        value: 2,
      },
    ],
  },
  {
    type: 'radio',
    label: 'song_submission.status',
    value: '',
    param: 'RangeStatus',
    items: [
      {
        label: 'song_submission.statuses.0',
        value: 0,
      },
      {
        label: 'song_submission.statuses.1',
        value: 1,
      },
      {
        label: 'song_submission.statuses.2',
        value: 2,
      },
    ],
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
  {
    type: 'input_group',
    label: 'song_submission.bpm',
    items: [
      {
        value: '',
        param: 'MinBpm',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.lowest_bpm',
        },
      },
      {
        value: '',
        param: 'MaxBpm',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.highest_bpm',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'song_submission.duration',
    items: [
      {
        value: '',
        param: 'MinDuration',
        options: {
          inputType: 'text',
          placeholder: 'song_submission.min_duration',
        },
      },
      {
        value: '',
        param: 'MaxDuration',
        options: {
          inputType: 'text',
          placeholder: 'song_submission.max_duration',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'song_submission.edition',
    value: '',
    param: 'ContainsEdition',
    options: {
      inputType: 'text',
      placeholder: 'song_submission.edition',
    },
  },
  {
    type: 'select',
    label: 'song_submission.edition_type',
    value: [],
    param: 'RangeEditionType',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'song_submission.edition_types.0',
        value: 0,
      },
      {
        id: 1,
        label: 'song_submission.edition_types.1',
        value: 1,
      },
      {
        id: 2,
        label: 'song_submission.edition_types.2',
        value: 2,
      },
      {
        id: 3,
        label: 'song_submission.edition_types.3',
        value: 3,
      },
      {
        id: 4,
        label: 'song_submission.edition_types.4',
        value: 4,
      },
      {
        id: 5,
        label: 'song_submission.edition_types.5',
        value: 5,
      },
    ],
  },
  {
    type: 'input',
    label: 'song_submission.lyrics',
    value: '',
    param: 'ContainsLyrics',
    options: {
      inputType: 'text',
      placeholder: 'song_submission.lyrics',
    },
  },
  {
    type: 'input_group',
    label: 'song_submission.max_bpm',
    items: [
      {
        value: '',
        param: 'MinMaxBpm',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.lowest_max_bpm',
        },
      },
      {
        value: '',
        param: 'MaxMaxBpm',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.highest_max_bpm',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'song_submission.message',
    value: '',
    param: 'ContainsMessage',
    options: {
      inputType: 'text',
      placeholder: 'song_submission.message',
    },
  },
  {
    type: 'input_group',
    label: 'song_submission.min_bpm',
    items: [
      {
        value: '',
        param: 'MinMinBpm',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.lowest_min_bpm',
        },
      },
      {
        value: '',
        param: 'MaxMinBpm',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.highest_min_bpm',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'song_submission.offset',
    items: [
      {
        value: '',
        param: 'MinOffset',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.lowest_offset',
        },
      },
      {
        value: '',
        param: 'MaxOffset',
        options: {
          inputType: 'number',
          placeholder: 'song_submission.highest_offset',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'song_submission.title',
    value: '',
    param: 'ContainsTitle',
    options: {
      inputType: 'text',
      placeholder: 'song_submission.title',
    },
  },
];
