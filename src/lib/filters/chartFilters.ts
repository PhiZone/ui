import { orderFilter } from './orderFilter';
import type { IFilters, OrderItem } from './types';

export const chartOrderItems: OrderItem[] = [
  { label: 'chart.score', field: 'score' },
  { label: 'chart.rating', field: 'rating' },
  { label: 'chart.difficulty', field: 'difficulty' },
  { label: 'common.like_count', field: 'likeCount' },
  { label: 'common.play_count', field: 'playCount' },
  { label: 'common.date_created', field: 'dateCreated' },
  { label: 'common.date_updated', field: 'dateUpdated' },
];

export const chartFilters: IFilters = [
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
    value: {},
    param: 'RangeFormat',
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
    value: {},
    param: 'RangeLevelType',
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
          inputType: 'date',
          placeholder: 'common.earliest_date_created',
        },
      },
      {
        value: '',
        param: 'LatestDateCreated',
        options: {
          inputType: 'date',
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
          inputType: 'date',
          placeholder: 'common.earliest_date_updated',
        },
      },
      {
        value: '',
        param: 'LatestDateUpdated',
        options: {
          inputType: 'date',
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
