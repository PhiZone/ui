import { orderFilter } from './orderFilter';
import type { IFilters } from './types';

const testOrderItems = [
  //{ label: 'common.default', value: null },
  { label: 'chart.score', value: 'score' },
  { label: 'chart.rating', value: 'rating' },
  { label: 'chart.difficulty', value: 'difficulty' },
  { label: 'filter.likeCount', value: 'likeCount' },
  { label: 'filter.playCount', value: 'playCount' },
  { label: 'common.date_created', value: 'dateCreated' },
  { label: 'common.date_updated', value: 'dateUpdated' },
];

export const testFilters: IFilters = [
  orderFilter(testOrderItems),
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
    value: 'select1',
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
    value: 'multiSelect1',
    param: 'multiSelect',
    items: [
      {
        text: 'Multi Select One',
        value: 'multiSelect1',
      },
      {
        text: 'Multi Select Two',
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
