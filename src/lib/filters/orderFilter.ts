import type { IFilterSelect, OrderItem } from './types';
import { t } from '$lib/translations/config';

type Item = object & {
  label: string;
  value: {
    field: string;
    desc: boolean;
  };
};

export const orderFilter = (orderItems: OrderItem[], options = {}): IFilterSelect => {
  const items: Item[] = [];

  orderItems.forEach(({ label, value, ...o }) => {
    items.push({
      ...o,
      label,
      value: {
        field: value,
        desc: false,
      },
    });
    items.push({
      ...o,
      label,
      value: {
        field: value,
        desc: true,
      },
    });
  });
  const filter = {
    type: 'select',
    param: 'Order',
    label: 'common.order',
    value: [],
    options: {
      placeholder: t.get('common.order'),
      renderer: ({ label, value: { field, desc } }: Item, _isSelection: boolean, _inputValue) => {
        const text = t.get(label),
          arrow = desc ? '↓' : '↑';

        if (_isSelection) return `${arrow} ${text}`;
        return `<span style="flex-grow:1;text-align:left">${text}</span>${arrow}`;
      },
      optionResolver: (opt: Item[], selection: Set<Item['value']>) => {
        console.log(opt, selection);
        return opt.filter(
          ({ value: { field } }) => ![...selection].some(({ field: f }) => f == field),
        ); // exclude the other order of selected one.
      },
      multiple: true,
      max: 3,
      ...options,
    },
    items,
  };

  return filter;
};
