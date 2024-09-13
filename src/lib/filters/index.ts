import { chartFilters, chartOrderItems } from './chartFilters';
import { orderFilter } from './orderFilter';
import { songFilters, songOrderItems } from './songFilters';
import { testFilters, testOrderItems } from './testFilters';
import type { IFilter } from './types';

export const searchFilters = {
  charts: chartFilters,
  songs: songFilters,
  users: [],
  events: [],
  chapters: [],
  collections: [],
  test: testFilters,
};

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

export const getFullFilters = (type: keyof typeof searchFilters) => [
  orderFilter(chartOrderItems),
  perPageFilter,
  ...searchFilters[type],
];
/*
 *export const readValueFromLocalStorege = (type: keyof typeof searchFilters) => {
 *  searchFilters[type].flat().forEach(({ value }) => {
 *  });
 *};
 */
