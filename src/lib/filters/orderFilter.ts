import type { IFilterSelect, OrderItem } from './types';
import { t } from '$lib/translations/config';

export const orderFilter = (orderItems: OrderItem[], options = {}): IFilterSelect => {
  const items = [];

  orderItems.forEach(({ label, value, ...o }) => {
    items.push({
      ...o,
      label: `↑ ${t.get(label)}`,
      raw: { label, value },
      value: [value, false],
    });
    items.push({
      ...o,
      label: `↓ ${t.get(label)}`,
      raw: { label, value },
      value: [value, true],
    });
  });
  const filter = {
    type: 'select',
    param: 'Order',
    label: 'common.order',
    value: [],
    options: {
      optionResolver: (opt: typeof items, selection) => {
        console.log(opt, selection);
        return opt.filter(({ raw: { value } }) => ![...selection].some(([v]) => v == value)); // exclude the other order of selected one.
      },
      multiple: true,
      max:3,
      ...options,
    },
    items,
  };

  return filter;
};
