import type { IFilters, OrderItem } from './types';

export const songOrderItems: OrderItem[] = [
  {
    label: 'song.title',
    field: 'Title',
  },
  {
    label: 'song.edition_type',
    field: 'EditionType',
  },
  {
    label: 'song.edition',
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
    label: 'song.bpm',
    field: 'Bpm',
  },
  {
    label: 'song.min_bpm',
    field: 'MinBpm',
  },
  {
    label: 'song.max_bpm',
    field: 'MaxBpm',
  },
  {
    label: 'song.offset',
    field: 'Offset',
  },
  {
    label: 'song.is_original',
    field: 'IsOriginal',
  },
  {
    label: 'song.duration',
    field: 'Duration',
  },
  {
    label: 'common.play_count',
    field: 'PlayCount',
  },
  {
    label: 'common.date_file_updated',
    field: 'DateFileUpdated',
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
    label: 'common.is_hidden',
    field: 'IsHidden',
  },
  {
    label: 'common.is_locked',
    field: 'IsLocked',
  },
  {
    label: 'common.date_updated',
    field: 'DateUpdated',
  },
  {
    label: 'common.like_count',
    field: 'LikeCount',
  },
  {
    label: 'common.date_created',
    field: 'DateCreated',
  },
];
export const songFilters: IFilters = [
  {
    type: 'toggle',
    label: 'common.is_hidden',
    value: false,
    param: 'IsHidden',
  },
  {
    type: 'toggle',
    label: 'common.is_locked',
    value: false,
    param: 'IsLocked',
  },
  {
    type: 'toggle',
    label: 'song.is_original',
    value: false,
    param: 'IsOriginal',
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
    label: 'common.like_count',
    items: [
      {
        value: '',
        param: 'MinLikeCount',
        options: {
          inputType: 'number',
          placeholder: 'common.lowest_like_count',
        },
      },
      {
        value: '',
        param: 'MaxLikeCount',
        options: {
          inputType: 'number',
          placeholder: 'common.highest_like_count',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'song.bpm',
    items: [
      {
        value: '',
        param: 'MinBpm',
        options: {
          inputType: 'number',
          placeholder: 'song.lowest_bpm',
        },
      },
      {
        value: '',
        param: 'MaxBpm',
        options: {
          inputType: 'number',
          placeholder: 'song.highest_bpm',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'song.duration',
    items: [
      {
        value: '',
        param: 'MinDuration',
        options: {
          inputType: 'text',
          placeholder: 'song.min_duration',
        },
      },
      {
        value: '',
        param: 'MaxDuration',
        options: {
          inputType: 'text',
          placeholder: 'song.max_duration',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'song.edition',
    value: '',
    param: 'ContainsEdition',
    options: {
      inputType: 'text',
      placeholder: 'song.edition',
    },
  },
  {
    type: 'select',
    label: 'song.edition_type',
    value: [],
    param: 'RangeEditionType',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'song.edition_types.0',
        value: 0,
      },
      {
        id: 1,
        label: 'song.edition_types.1',
        value: 1,
      },
      {
        id: 2,
        label: 'song.edition_types.2',
        value: 2,
      },
      {
        id: 3,
        label: 'song.edition_types.3',
        value: 3,
      },
      {
        id: 4,
        label: 'song.edition_types.4',
        value: 4,
      },
      {
        id: 5,
        label: 'song.edition_types.5',
        value: 5,
      },
    ],
  },
  {
    type: 'input',
    label: 'song.lyrics',
    value: '',
    param: 'ContainsLyrics',
    options: {
      inputType: 'text',
      placeholder: 'song.lyrics',
    },
  },
  {
    type: 'input_group',
    label: 'song.max_bpm',
    items: [
      {
        value: '',
        param: 'MinMaxBpm',
        options: {
          inputType: 'number',
          placeholder: 'song.lowest_max_bpm',
        },
      },
      {
        value: '',
        param: 'MaxMaxBpm',
        options: {
          inputType: 'number',
          placeholder: 'song.highest_max_bpm',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'song.min_bpm',
    items: [
      {
        value: '',
        param: 'MinMinBpm',
        options: {
          inputType: 'number',
          placeholder: 'song.lowest_min_bpm',
        },
      },
      {
        value: '',
        param: 'MaxMinBpm',
        options: {
          inputType: 'number',
          placeholder: 'song.highest_min_bpm',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'song.offset',
    items: [
      {
        value: '',
        param: 'MinOffset',
        options: {
          inputType: 'number',
          placeholder: 'song.lowest_offset',
        },
      },
      {
        value: '',
        param: 'MaxOffset',
        options: {
          inputType: 'number',
          placeholder: 'song.highest_offset',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'song.title',
    value: '',
    param: 'ContainsTitle',
    options: {
      inputType: 'text',
      placeholder: 'song.title',
    },
  },
];
