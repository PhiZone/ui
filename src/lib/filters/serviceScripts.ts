import type { IFilters, OrderItem } from './types';

export const serviceScriptOrderItems: OrderItem[] = [
  {
    label: 'common.name',
    field: 'Name',
  },
  {
    label: 'service_script.target_type',
    field: 'TargetType',
  },
  {
    label: 'common.description',
    field: 'Description',
  },
  {
    label: 'service_script.code',
    field: 'Code',
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
export const serviceScriptFilters: IFilters = [
  {
    type: 'radio',
    label: 'service_script.target_type',
    value: '',
    param: 'RangeTargetType',
    items: [
      {
        label: 'service_script.target_types.0',
        value: 0,
      },
      {
        label: 'service_script.target_types.1',
        value: 1,
      },
      {
        label: 'service_script.target_types.2',
        value: 2,
      },
    ],
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
    label: 'common.name',
    value: '',
    param: 'ContainsName',
    options: {
      inputType: 'text',
      placeholder: 'common.name',
    },
  },
];
