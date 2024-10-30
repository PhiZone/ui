import type { IFilters, OrderItem } from './types';

export const eventOrderItems: OrderItem[] = [
  {
    label: 'common.title',
    field: 'Title',
  },
  {
    label: 'common.subtitle',
    field: 'Subtitle',
  },
  {
    label: 'common.illustrator',
    field: 'Illustrator',
  },
  {
    label: 'event.date_unveiled',
    field: 'DateUnveiled',
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

export const eventFilters: IFilters = [
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
    type: 'input',
    label: 'common.subtitle',
    value: '',
    param: 'ContainsSubtitle',
    options: {
      inputType: 'text',
      placeholder: 'common.subtitle',
    },
  },
  {
    type: 'input',
    label: 'common.title',
    value: '',
    param: 'ContainsTitle',
    options: {
      inputType: 'text',
      placeholder: 'common.title',
    },
  },
  {
    type: 'input_group',
    label: 'event.date_unveiled',
    items: [
      {
        value: '',
        param: 'EarliestDateUnveiled',
        options: {
          inputType: 'text',
          placeholder: 'event.earliest_date_unveiled',
        },
      },
      {
        value: '',
        param: 'LatestDateUnveiled',
        options: {
          inputType: 'text',
          placeholder: 'event.latest_date_unveiled',
        },
      },
    ],
  },
];
