import type { IFilter, IFilters } from './components/SearchOptions/types';
import { t } from '$lib/translations/config';

export const testFilters: IFilters = [
  {
    type: 'input',
    label: 'text',
    value: 1,
    param: 'text',
    options: {
      inputType: 'text',
      range: [0, 4],
    },
  },
  {
    type: 'input',
    label: 'number',
    value: 1,
    param: 'number',
    options: {
      inputType: 'number',
      range: [0, 4],
    },
  },
  {
    type: 'input_group',
    label: 'input group',
    items: [
      {
        value: 'hello',
        param: 'input_group_0',
        options: {
          inputType: 'text',
          placeholder: 'text',
        },
      },
      {
        value: 1,
        param: 'input_group_1',
        options: {
          inputType: 'number',
          placeholder: 'number',
        },
      },
    ],
  },
  {
    type: 'toggle',
    label: 'chek',
    value: false,
    param: 'chek',
  },
  [
    {
      type: 'toggle',
      label: 'toggle 1',
      value: false,
      param: 'toggle1',
    },
    {
      type: 'toggle',
      label: 'toggle 2',
      value: true,
      param: 'toggle2',
    },
  ],
  {
    type: 'select',
    label: 'select',
    value: {
      label: 'Select One',
      value: 'select1',
    },
    param: 'select',
    items: [
      {
        label: 'Select One',
        value: 'select1',
      },
      {
        label: 'Select Two',
        value: 'select2',
      },
    ],
  },
  {
    type: 'select',
    label: 'Multiple Select',
    value: [
      {
        label: 'Multi Select One',
        value: 'multiSelect1',
      },
    ],
    param: 'multiSelect',
    items: [
      {
        label: 'Multi Select One',
        value: 'multiSelect1',
      },
      {
        label: 'Multi Select Two',
        value: 'multiSelect2',
      },
    ],
    options: {
      isMultiple: true,
    },
  },
  {
    type: 'slider',
    label: 'difficulty',
    value: [0, 1],
    param: ['MinDifficulty', 'MaxDifficulty'],
    options: {
      step: 0.1,
      isRange: true,
      range: [0, 17],
      pipstep: 10,
    },
  },
  {
    type: 'slider',
    label: 'slid',
    value: [1],
    param: ['slid'],
    options: {
      range: [0, 10],
    },
  },
  {
    type: 'slider',
    label: 'slid2',
    value: [1, 5],
    param: ['slid2-1', 'slid2-2'],
    options: {
      range: [0, 10],
    },
  },
  {
    type: 'radio',
    label: 'Radio',
    value: 'radio',
    param: 'radio',
    items: [
      {
        label: 'Radio One',
        value: 'radio1',
      },
      {
        label: 'Radio Two',
        value: 'radio2',
      },
    ],
  },
  {
    type: 'checkbox',
    label: 'CheckBox',
    value: 'radio',
    param: 'checkbox',
    items: [
      {
        label: 'CheckBox One',
        value: 'checkbox1',
      },
      {
        label: 'CheckBox Two',
        value: 'checkbox2',
      },
    ],
  },
];

//TODO: i18n
const basicFilters: IFilters = [
  {
    type: 'slider',
    label: 'common.entries_per_page',
    value: [36],
    param: ['PerPage'],
    options: {
      isRange: false,
      range: [0, 100],
      step: 1,
      pipstep: 10,
    },
  },
];

export const chartFilters: IFilters = [
  ...basicFilters,
  {
    type: 'toggle',
    label: 'chart.is_ranked',
    value: false,
    param: 'IsRanked',
  },
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
    type: 'radio',
    label: 'common.accessibility',
    value: '',
    param: 'RangeAccessibility',
    items: {
      '0': 'common.accessibilities.0',
      '1': 'common.accessibilities.1',
      '2': 'common.accessibilities.2',
    },
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
    type: 'slider',
    label: 'chart.r_arrangement',
    value: [3.0, 5.0],
    param: ['MinRatingOnArrangement', 'MaxRatingOnArrangement'],
    options: {
      isRange: true,
      range: [0.0, 5.0],
      step: 0.01,
      pipstep: 100.0,
    },
  },
  {
    type: 'slider',
    label: 'chart.r_concord',
    value: [3.0, 5.0],
    param: ['MinRatingOnConcord', 'MaxRatingOnConcord'],
    options: {
      isRange: true,
      range: [0.0, 5.0],
      step: 0.01,
      pipstep: 100.0,
    },
  },
  {
    type: 'slider',
    label: 'chart.r_creativity',
    value: [3.0, 5.0],
    param: ['MinRatingOnCreativity', 'MaxRatingOnCreativity'],
    options: {
      isRange: true,
      range: [0.0, 5.0],
      step: 0.01,
      pipstep: 100.0,
    },
  },
  {
    type: 'slider',
    label: 'chart.r_gameplay',
    value: [3.0, 5.0],
    param: ['MinRatingOnGameplay', 'MaxRatingOnGameplay'],
    options: {
      isRange: true,
      range: [0.0, 5.0],
      step: 0.01,
      pipstep: 100.0,
    },
  },
  {
    type: 'slider',
    label: 'chart.r_impression',
    value: [3.0, 5.0],
    param: ['MinRatingOnImpression', 'MaxRatingOnImpression'],
    options: {
      isRange: true,
      range: [0.0, 5.0],
      step: 0.01,
      pipstep: 100.0,
    },
  },
  {
    type: 'slider',
    label: 'chart.r_visual_effects',
    value: [3.0, 5.0],
    param: ['MinRatingOnVisualEffects', 'MaxRatingOnVisualEffects'],
    options: {
      isRange: true,
      range: [0.0, 5.0],
      step: 0.01,
      pipstep: 100.0,
    },
  },
  {
    type: 'slider',
    label: 'chart.rating',
    value: [3.0, 5.0],
    param: ['MinRating', 'MaxRating'],
    options: {
      isRange: true,
      range: [0.0, 5.0],
      step: 0.01,
      pipstep: 100.0,
    },
  },
  {
    type: 'select',
    label: 'chart.format',
    value: '',
    param: 'RangeFormat',
    items: {
      '0': 'chart.formats.0',
      '1': 'chart.formats.1',
      '2': 'chart.formats.2',
      '3': 'chart.formats.3',
      '4': 'chart.formats.4',
    },
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
    value: '',
    param: 'RangeLevelType',
    items: {
      '0': 'chart.level_types.0',
      '1': 'chart.level_types.1',
      '2': 'chart.level_types.2',
      '3': 'chart.level_types.3',
      '4': 'chart.level_types.4',
    },
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
    type: 'input_group',
    label: 'chart.score',
    items: [
      {
        value: '',
        param: 'MinScore',
        options: {
          inputType: 'number',
          placeholder: 'chart.lowest_score',
        },
      },
      {
        value: '',
        param: 'MaxScore',
        options: {
          inputType: 'number',
          placeholder: 'chart.highest_score',
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
    label: 'common.play_count',
    items: [
      {
        value: '',
        param: 'MinPlayCount',
        options: {
          inputType: 'number',
          placeholder: 'common.lowest_play_count',
        },
      },
      {
        value: '',
        param: 'MaxPlayCount',
        options: {
          inputType: 'number',
          placeholder: 'common.highest_play_count',
        },
      },
    ],
  },
];

export const songFilters: IFilters = [
  ...basicFilters,
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
    items: {
      '0': 'common.accessibilities.0',
      '1': 'common.accessibilities.1',
      '2': 'common.accessibilities.2',
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
    value: '',
    param: 'RangeEditionType',
    items: {
      '0': 'song.edition_types.0',
      '1': 'song.edition_types.1',
      '2': 'song.edition_types.2',
      '3': 'song.edition_types.3',
      '4': 'song.edition_types.4',
      '5': 'song.edition_types.5',
    },
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

export const searchFilters = {
  charts: chartFilters,
  songs: songFilters,
  users: [],
  events: [],
  chapters: [],
  collections: [],
};
