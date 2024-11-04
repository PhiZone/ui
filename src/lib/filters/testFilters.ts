import type { IFilters, OrderItem } from './types';

export const testOrderItems: OrderItem[] = [
  { label: 'chart.score', field: 'score' },
  { label: 'chart.rating', field: 'rating' },
  { label: 'chart.difficulty', field: 'difficulty' },
  { label: 'filter.likeCount', field: 'likeCount' },
  { label: 'filter.playCount', field: 'playCount' },
  { label: 'common.date_created', field: 'dateCreated' },
  { label: 'common.date_updated', field: 'dateUpdated' },
];

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
    type: 'input_group',
    label: 'input group 2',
    items: [
      {
        value: '',
        param: 'input_group_2',
        options: {
          inputType: 'date',
          placeholder: 'date1',
        },
      },
      {
        value: '',
        param: 'input_group_3',
        options: {
          inputType: 'date',
          placeholder: 'date2',
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
    value: { id: 0 },
    param: 'select',
    items: [
      {
        id: 0,
        label: 'select one',
        value: 'select1',
      },
      {
        id: 1,
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
        id: 'b',
      },
    ],
    param: 'multiSelect',
    items: [
      {
        id: 0,
        label: 'Multi Select One',
        value: 'multiSelect1',
      },
      {
        id: 'b',
        label: 'Multi Select Two',
        value: 'multiSelect2',
      },
    ],
    options: {
      multiple: true,
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
