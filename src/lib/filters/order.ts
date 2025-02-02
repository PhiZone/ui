import { t } from '$lib/translations/config';

import type { IFilterOrder, OrderItem } from './types';

interface Item {
  id: string | number;
  label: string;
  value: {
    field: string;
    desc: boolean;
  };
}

export const getOrderFieldId = (field: string, desc: boolean) =>
  `${field}_${desc ? 'desc' : 'asc'}`;

export const orderFilter = (orderItems: OrderItem[], options = {}): IFilterOrder => {
  const items: Item[] = [];

  orderItems.forEach(({ label, field, ...o }) => {
    items.push({
      ...o,
      label,
      id: field,
      value: {
        field,
        desc: false,
      },
    });
  });
  const filter: IFilterOrder = {
    type: 'select',
    param: 'Order',
    label: 'common.order',
    value: [],
    options: {
      renderer: (value, _isSelection?: boolean) => {
        const {
          label,
          value: { desc },
        } = value as Item;
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
      max: 5,
      ...options,
    },
    items,
  };

  return filter;
};
