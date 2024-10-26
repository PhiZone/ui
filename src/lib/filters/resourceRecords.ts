import type { IFilters, OrderItem } from './types';

export const resourceRecordOrderItems: OrderItem[] = [
  {
    label: 'resource_record.type',
    field: 'Type',
  },
  {
    label: 'resource_record.title',
    field: 'Title',
  },
  {
    label: 'resource_record.edition_type',
    field: 'EditionType',
  },
  {
    label: 'resource_record.edition',
    field: 'Edition',
  },
  {
    label: 'common.author_name',
    field: 'AuthorName',
  },
  {
    label: 'common.description',
    field: 'Description',
  },
  {
    label: 'resource_record.strategy',
    field: 'Strategy',
  },
  {
    label: 'resource_record.source',
    field: 'Source',
  },
  {
    label: 'resource_record.copyright_owner',
    field: 'CopyrightOwner',
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
export const resourceRecordFilters: IFilters = [
  {
    type: 'radio',
    label: 'resource_record.type',
    value: '',
    param: 'RangeType',
    items: [
      {
        label: 'resource_record.types.0',
        value: 0,
      },
      {
        label: 'resource_record.types.1',
        value: 1,
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
    label: 'resource_record.copyright_owner',
    value: '',
    param: 'ContainsCopyrightOwner',
    options: {
      inputType: 'text',
      placeholder: 'resource_record.copyright_owner',
    },
  },
  {
    type: 'input',
    label: 'resource_record.edition',
    value: '',
    param: 'ContainsEdition',
    options: {
      inputType: 'text',
      placeholder: 'resource_record.edition',
    },
  },
  {
    type: 'select',
    label: 'resource_record.edition_type',
    value: [],
    param: 'RangeEditionType',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'resource_record.edition_types.0',
        value: 0,
      },
      {
        id: 1,
        label: 'resource_record.edition_types.1',
        value: 1,
      },
      {
        id: 2,
        label: 'resource_record.edition_types.2',
        value: 2,
      },
      {
        id: 3,
        label: 'resource_record.edition_types.3',
        value: 3,
      },
      {
        id: 4,
        label: 'resource_record.edition_types.4',
        value: 4,
      },
      {
        id: 5,
        label: 'resource_record.edition_types.5',
        value: 5,
      },
    ],
  },
  {
    type: 'input',
    label: 'resource_record.source',
    value: '',
    param: 'ContainsSource',
    options: {
      inputType: 'text',
      placeholder: 'resource_record.source',
    },
  },
  {
    type: 'select',
    label: 'resource_record.strategy',
    value: [],
    param: 'RangeStrategy',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'resource_record.strategies.0',
        value: 0,
      },
      {
        id: 1,
        label: 'resource_record.strategies.1',
        value: 1,
      },
      {
        id: 2,
        label: 'resource_record.strategies.2',
        value: 2,
      },
      {
        id: 3,
        label: 'resource_record.strategies.3',
        value: 3,
      },
      {
        id: 4,
        label: 'resource_record.strategies.4',
        value: 4,
      },
    ],
  },
  {
    type: 'input',
    label: 'resource_record.title',
    value: '',
    param: 'ContainsTitle',
    options: {
      inputType: 'text',
      placeholder: 'resource_record.title',
    },
  },
];
