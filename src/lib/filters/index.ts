import { chartFilters, chartOrderItems } from './chartFilters';
import { getOrderFieldId, orderFilter } from './orderFilter';
import { songFilters, songOrderItems } from './songFilters';
import { testFilters, testOrderItems } from './testFilters';
import type { IFilter, IFilterInputItem, IFilterSelect, IFilters } from './types';

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

export const setFilterValue = (filters: IFilters, data: Record<string, unknown>) => {
  if (!data) return;
  filters.forEach((filter) => {
    if (filter instanceof Array) setFilterValue(filter, data);
    else {
      if (filter.type == 'input_group') {
        filter.items.forEach((item) => {
          if (data[item.param] !== undefined) {
            filter.isEnable = true;
            item.value = data[item.param];
          }
        });
      } else {
        const { param } = filter;
        if (param === 'Order') {
          const value = data['Order'] as IFilterSelect['items'];
          if (value) {
            filter.isEnable = true;
            filter.value = value;
          }
        } else if (param instanceof Array) {
          param.forEach((p, i) => {
            if (data[p] !== undefined) {
              filter.isEnable = true;
              filter.value[i] = data[p];
            }
          });
        } else {
          if (data[param] !== undefined) {
            filter.isEnable = true;
            filter.value = data[param];
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
export const getFilterValue = (filters: IFilters) => {
  const data: Record<string, unknown> = {};
  filters.flat().forEach((filter) => {
    if (!filter.isEnable) return;
    if (filter.type == 'input_group') {
      filter.items.forEach(({ param, value }) => {
        if (value) data[param] = value;
      });
    } else {
      const { value, param } = filter;
      if (param instanceof Array) {
        param.forEach((p, i) => {
          data[p] = (value as unknown[])[i];
        });
      } else {
        data[param] = value;
      }
    }
  });
  return data;
};

export const storeFilterValue = (type: SearchFilterType, data: Record<string, any>) => {
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
