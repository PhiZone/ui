import type { IFilterSelect, OrderItem } from './types';
import { t } from '$lib/translations/config';

type Item = {
  id: string | number;
  label: string;
  value: {
    field: string;
    desc: boolean;
  };
};

export const getOrderFieldId = (field: string, desc: boolean) =>
  `${field}_${desc ? 'desc' : 'asc'}`;

export const orderFilter = (orderItems: OrderItem[], options = {}): IFilterSelect => {
  const items: Item[] = [];

  orderItems.forEach(({ label, field, ...o }, i) => {
    items.push({
      ...o,
      label,
      id: field,
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
      // selection: set of id
      optionResolver: (opt: Item[], selection: Set<string>) => {
        return opt.flatMap(({ value: { field }, label, ...o }) =>
          [...selection].some((id) => id.match(field))
            ? []
            : [
                { ...o, id: getOrderFieldId(field, false), label, value: { field, desc: false } },
                { ...o, id: getOrderFieldId(field, true), label, value: { field, desc: true } },
              ],
        );
      },
      multiple: true,
      max: 3,
      ...options,
    },
    items,
  };

  return filter;
};
