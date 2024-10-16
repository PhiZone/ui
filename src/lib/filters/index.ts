import { chartFilters, chartOrderItems } from './chartFilters';
import { orderFilter } from './orderFilter';
import { songFilters, songOrderItems } from './songFilters';
import { testFilters, testOrderItems } from './testFilters';
import type { IFilterSelectItem, IFilter, IFilterOrder, IFilterOrderItem, IFilters } from './types';
export const searchFilters = {
  charts: chartFilters,
  songs: songFilters,
  users: [],
  events: [],
  chapters: [],
  collections: [],
  test: testFilters,
};

export type SearchFilterType = keyof typeof searchFilters;

export const orders = {
  charts: chartOrderItems,
  songs: songOrderItems,
  users: [],
  events: [],
  chapters: [],
  collections: [],
  test: testOrderItems,
};

const perPageFilter: IFilter = {
  type: 'input',
  label: 'common.entries_per_page',
  value: 30,
  param: 'PerPage',
  options: {
    inputType: 'number',
    placeholder: 'common.entries_per_page',
  },
};

type Value =
  | string
  | number
  | boolean
  | IFilterSelectItem[]
  | IFilterOrderItem[]
  | (string | number | boolean)[];

type Data = Record<string, Value>;
export const isOrderFilter = (filter: IFilter): filter is IFilterOrder =>
  filter.type === 'select' && filter.param === 'Order';

export const setFilterValue = (filters: IFilters, data: Data) => {
  if (!data) return;
  filters.forEach((filter) => {
    if (filter instanceof Array) setFilterValue(filter, data);
    else {
      if (filter.type == 'input_group') {
        filter.items.forEach((item) => {
          if (data[item.param] !== undefined) {
            filter.isEnable = true;
            item.value = data[item.param] as string;
          }
        });
      } else {
        if (isOrderFilter(filter)) {
          const value = data['Order'] as IFilterOrderItem[];
          if (value) {
            filter.isEnable = true;
            filter.value = value;
          }
        } else if (filter.param instanceof Array) {
          filter.param.forEach((p, i) => {
            if (data[p] !== undefined && filter.value instanceof Array) {
              filter.isEnable = true;
              filter.value[i] = data[p] as number | IFilterSelectItem;
            }
          });
        } else {
          if (data[filter.param] !== undefined) {
            filter.isEnable = true;
            filter.value = data[filter.param] as typeof filter.value;
          }
        }
      }
    }
  });
};

export const getFullFilters = (type: keyof typeof searchFilters, fromLocalStorage = true) => {
  const filters = [orderFilter(chartOrderItems), perPageFilter, ...searchFilters[type]];

  if (fromLocalStorage && typeof localStorage !== 'undefined') {
    const storage = JSON.parse(localStorage.getItem('searchFilters') ?? '{}')[type];
    if (storage) setFilterValue(filters, storage);
  }

  return filters;
};

//string | number | (string|number)[] |  | null | undefined
const isEmpty = (v: unknown): v is '' | null | undefined =>
  v === '' || v === null || v === undefined;
export const getFilterValue = (filters: IFilters) => {
  const data: Data = {};
  const add = (p: string, v: Value | null | undefined) => (!isEmpty(v) ? (data[p] = v) : 0);

  filters.flat().forEach((filter) => {
    if (!filter.isEnable) return;

    switch (filter.type) {
      case 'input_group':
        filter.items.forEach(({ param, value }) => {
          add(param, value);
        });
        break;
      case 'select': {
        const { param, value } = filter;
        if (isEmpty(value)) break;

        if (filter.value instanceof Array) add(param, filter.value as IFilterSelectItem[]);
        else add(param, [value as IFilterSelectItem]);
        break;
      }

      default: {
        const { param, value } = filter;

        const isParamArray = param instanceof Array;
        const isValueArray = value instanceof Array;

        if (isParamArray) {
          param.forEach((p, i) => {
            add(p, isValueArray ? value[i] : value);
          });
        } else {
          add(param, value);
        }

        break;
      }
    }
  });
  return data;
};

export const storeFilterValue = (type: SearchFilterType, data: Data) => {
  if (typeof localStorage === 'undefined') return false;

  const storage = JSON.parse(localStorage.getItem('searchFilters') ?? '{}');

  storage[type] = data;

  try {
    localStorage.setItem('searchFilters', JSON.stringify(storage));
  } catch (error) {
    console.error(error);
    localStorage.removeItem('searchFilters');
  }
};

export const generateParams = (data: Data) => {
  const params = new URLSearchParams();

  Object.entries(data).forEach(([param, value]) => {
    //return
    if (isEmpty(value)) return;
    if (param === 'Order') {
      (value as unknown as IFilterOrderItem[]).forEach(({ value: { field, desc } }) => {
        params.append('Order', field);
        params.append('Desc', desc.toString());
      });
    } else if (value instanceof Array) {
      value.forEach((v) => {
        if (typeof v === 'object' && 'value' in v) params.append(param, v.value.toString());
        else if (v) params.append(param, v.toString());
      });
    } else {
      params.append(param, value.toString());
    }
  });

  console.log(params);
  return params;
};
