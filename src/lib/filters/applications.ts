import type { IFilters, OrderItem } from './types';

export const applicationOrderItems: OrderItem[] = [
  {
    label: 'common.name',
    field: 'Name',
  },
  {
    label: 'application.avatar',
    field: 'Avatar',
  },
  {
    label: 'common.illustrator',
    field: 'Illustrator',
  },
  {
    label: 'common.description',
    field: 'Description',
  },
  {
    label: 'application.homepage',
    field: 'Homepage',
  },
  {
    label: 'application.api_endpoint',
    field: 'ApiEndpoint',
  },
  {
    label: 'application.type',
    field: 'Type',
  },
  {
    label: 'application.secret',
    field: 'Secret',
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
export const applicationFilters: IFilters = [
  {
    type: 'input',
    label: 'application.api_endpoint',
    value: '',
    param: 'ContainsApiEndpoint',
    options: {
      inputType: 'text',
      placeholder: 'application.api_endpoint',
    },
  },
  {
    type: 'input',
    label: 'application.homepage',
    value: '',
    param: 'ContainsHomepage',
    options: {
      inputType: 'text',
      placeholder: 'application.homepage',
    },
  },
  {
    type: 'select',
    label: 'application.type',
    value: [],
    param: 'RangeType',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'application.types.0',
        value: 0,
      },
      {
        id: 1,
        label: 'application.types.1',
        value: 1,
      },
      {
        id: 2,
        label: 'application.types.2',
        value: 2,
      },
      {
        id: 3,
        label: 'application.types.3',
        value: 3,
      },
      {
        id: 4,
        label: 'application.types.4',
        value: 4,
      },
      {
        id: 5,
        label: 'application.types.5',
        value: 5,
      },
      {
        id: 6,
        label: 'application.types.6',
        value: 6,
      },
      {
        id: 7,
        label: 'application.types.7',
        value: 7,
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
