import type { IFilters, OrderItem } from './types';

export const recordOrderItems: OrderItem[] = [
  {
    label: 'record.score',
    field: 'Score',
  },
  {
    label: 'record.accuracy',
    field: 'Accuracy',
  },
  {
    label: 'record.is_full_combo',
    field: 'IsFullCombo',
  },
  {
    label: 'record.max_combo',
    field: 'MaxCombo',
  },
  {
    label: 'record.perfect',
    field: 'Perfect',
  },
  {
    label: 'record.good_early',
    field: 'GoodEarly',
  },
  {
    label: 'record.good_late',
    field: 'GoodLate',
  },
  {
    label: 'record.bad',
    field: 'Bad',
  },
  {
    label: 'record.miss',
    field: 'Miss',
  },
  {
    label: 'record.std_deviation',
    field: 'StdDeviation',
  },
  {
    label: 'record.rks',
    field: 'Rks',
  },
  {
    label: 'record.perfect_judgment',
    field: 'PerfectJudgment',
  },
  {
    label: 'record.good_judgment',
    field: 'GoodJudgment',
  },
  {
    label: 'record.device_info',
    field: 'DeviceInfo',
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
export const recordFilters: IFilters = [
  {
    type: 'toggle',
    label: 'record.is_full_combo',
    value: false,
    param: 'IsFullCombo',
  },
  {
    type: 'slider',
    label: 'record.accuracy',
    value: [0.6, 1.0],
    param: ['MinAccuracy', 'MaxAccuracy'],
    options: {
      isRange: true,
      range: [0.0, 1.0],
      step: 0.01,
      pipstep: 10.0,
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
    label: 'record.bad',
    items: [
      {
        value: '',
        param: 'MinBad',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_bad',
        },
      },
      {
        value: '',
        param: 'MaxBad',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_bad',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'record.device_info',
    value: '',
    param: 'ContainsDeviceInfo',
    options: {
      inputType: 'text',
      placeholder: 'record.device_info',
    },
  },
  {
    type: 'input_group',
    label: 'record.good_early',
    items: [
      {
        value: '',
        param: 'MinGoodEarly',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_good_early',
        },
      },
      {
        value: '',
        param: 'MaxGoodEarly',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_good_early',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.good_judgment',
    items: [
      {
        value: '',
        param: 'MinGoodJudgment',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_good_judgment',
        },
      },
      {
        value: '',
        param: 'MaxGoodJudgment',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_good_judgment',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.good_late',
    items: [
      {
        value: '',
        param: 'MinGoodLate',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_good_late',
        },
      },
      {
        value: '',
        param: 'MaxGoodLate',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_good_late',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.max_combo',
    items: [
      {
        value: '',
        param: 'MinMaxCombo',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_max_combo',
        },
      },
      {
        value: '',
        param: 'MaxMaxCombo',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_max_combo',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.miss',
    items: [
      {
        value: '',
        param: 'MinMiss',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_miss',
        },
      },
      {
        value: '',
        param: 'MaxMiss',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_miss',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.perfect',
    items: [
      {
        value: '',
        param: 'MinPerfect',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_perfect',
        },
      },
      {
        value: '',
        param: 'MaxPerfect',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_perfect',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.perfect_judgment',
    items: [
      {
        value: '',
        param: 'MinPerfectJudgment',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_perfect_judgment',
        },
      },
      {
        value: '',
        param: 'MaxPerfectJudgment',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_perfect_judgment',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.rks',
    items: [
      {
        value: '',
        param: 'MinRks',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_rks',
        },
      },
      {
        value: '',
        param: 'MaxRks',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_rks',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.score',
    items: [
      {
        value: '',
        param: 'MinScore',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_score',
        },
      },
      {
        value: '',
        param: 'MaxScore',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_score',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'record.std_deviation',
    items: [
      {
        value: '',
        param: 'MinStdDeviation',
        options: {
          inputType: 'number',
          placeholder: 'record.lowest_std_deviation',
        },
      },
      {
        value: '',
        param: 'MaxStdDeviation',
        options: {
          inputType: 'number',
          placeholder: 'record.highest_std_deviation',
        },
      },
    ],
  },
];
