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

  orderItems.forEach(({ label, field, ...o }) => {
    items.push({
      ...o,
      label,
      value: {
        field,
        desc: false,
      },
    });
    items.push({
      ...o,
      label,
      value: {
        field,
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
      renderer: ({ label, value: { desc } }: Item, _isSelection: boolean, _inputValue) => {
        const text = t.get(label),
          type = desc ? 'desc' : 'asc';

        if (_isSelection) return `<span class='${type}'>${text}</span>`;
        return `<span class='${type}'>${text}</span>`;
      },
      optionResolver: (opt: Item[], selection: Set<Item['value']>) => {
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
