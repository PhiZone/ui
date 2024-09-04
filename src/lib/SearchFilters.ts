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
    value: 'sel0',
    param: 'select',
    items: {
      sel0: 'select 0',
      sel1: 'select 1',
      __unset: 'unset the param',
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
    label: 'radi',
    value: 'ra0',
    param: 'ra',
    items: {
      ra0: 'radio 0',
      ra1: 'radio 1',
    },
  },
];

//TODO: i18n
const basicFilters: IFilters = [
  {
    type: 'input',
    label: t.get('common.perpage'),
    value: '30',
    param: 'PerPage',
    options: {
      inputType: 'number',
      isInt: true,
    },
  },
];

export const chartFilters: IFilters = [
  ...basicFilters,
  {
    type: 'select',
    label: t.get('common.order'),
    value: '',
    param: 'Order',
    items: {
      '': t.get('common.default'),
      score: t.get('chart.score'),
      rating: t.get('chart.rating'),
      difficulty: t.get('chart.difficulty'),
      likeCount: t.get('filter.likeCount'),
      playCount: t.get('filter.playCount'),
      dateCreated: t.get('common.date_created'),
      dateUpdated: t.get('common.date_updated'),
    },
  },
  {
    type: 'toggle',
    label: t.get('filter.descending'),
    value: false,
    param: 'desc',
  },
  {
    type: 'radio',
    label: t.get('chart.ranked'),
    value: '',
    param: 'IsRanked',
    items: {
      true: t.get('common.filter.yes'),
      false: t.get('common.filter.no'),
      '': t.get('common.filter.any'),
    },
  },
  {
    type: 'input_group',
    label: t.get('chart.notes'),
    items: [
      {
        value: '',
        param: 'MinNoteCount',
        options: {
          inputType: 'number',
          placeholder: t.get('chart.lowest_note_count'),
        },
      },
      {
        value: '',
        param: 'MaxNoteCount',
        options: {
          inputType: 'number',
          placeholder: t.get('chart.highest_note_count'),
        },
      },
    ],
  },
  {
    type: 'slider',
    label: t.get('chart.difficulty'),
    value: [0, 17],
    param: ['MinDifficulty', 'MaxDifficulty'],
    options: {
      step: 0.1,
      isRange: true,
      range: [0, 17],
      pipstep: 20,
    },
  },

  {
    type: 'slider',
    label: t.get('chart.rating'),
    value: [0, 5],
    param: ['MinRating', 'MaxRating'],
    options: {
      step: 0.1,
      isRange: true,
      range: [0, 5],
      pipstep: 10,
    },
  },
  {
    type: 'slider',
    label: t.get('chart.score'),
    value: [0, 120],
    param: ['MinScore', 'MaxScore'],
    options: {
      step: 5,
      isRange: true,
      range: [0, 120], //TODO: max score??
      pipstep: 4,
    },
  },
];

export const songFilters: IFilters = [];

export const searchFilters = {
  charts: chartFilters,
  songs: songFilters,
  users: [],
  events: [],
  chapters: [],
  collections: [],
};
