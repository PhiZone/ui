import type Svelecte from 'svelecte';

type Item = {
  label: string;
  value: string | number;
};
type Range = [min: number, max: number];

interface IFilterBase {
  label: string;
  param?: string[] | string; // converting the value to the corresponding param
  isEnable?: boolean;
  type:
    | 'input'
    | 'input_group'
    | 'number'
    | 'range'
    | 'slider'
    | 'checkbox'
    | 'radio'
    | 'select'
    | 'switch'
    | 'toggle';
  options?: object;
}

interface IFilterInputOptions {
  inputType: HTMLInputElement['type'];
  placeholder?: string;
  isInt?: this['inputType'] extends 'number' ? boolean : never;
  range?: Range;
}

interface IFilterInput extends IFilterBase {
  type: 'input';
  value: string | number;
  param: string;
  options: IFilterInputOptions;
}

interface IFilterInputItem extends Omit<Omit<IFilterInput, 'label'>, 'type'> {}

interface IFilterInputGroup extends IFilterBase {
  type: 'input_group';
  label: string;
  items: IFilterInputItem[];
}

export type IFilterSelectItem = {
  id: string | number;
  label: string;
  value: string | number;
};

interface IFilterSelect extends IFilterBase {
  type: 'select';
  value:
    | Record<string, never>
    | { id: string | number }
    | { id: string | number }[]
    | IFilterSelectItem
    | IFilterSelectItem[];
  param: string;
  // items: Svelecte['$$prop_def']['options']
  items: IFilterSelectItem[];
  // see https://svelecte.vercel.app/options for more information
  options?: Svelecte['$$prop_def'];
}

export type IFilterOrderItem = {
  id: string | number;
  label: string;
  value: { field: string; desc: boolean };
};

interface IFilterOrder extends IFilterBase {
  type: 'select';
  value: Record<string, never> | { id: string | number }[] | IFilterOrderItem[];
  param: 'Order';
  // items: Svelecte['$$prop_def']['options']
  items: IFilterOrderItem[];
  // see https://svelecte.vercel.app/options for more information
  options?: Svelecte['$$prop_def'];
}

interface IFilterToggle extends IFilterBase {
  type: 'toggle';
  value: boolean;
  param: string;
}

interface IFilterSlider extends IFilterBase {
  type: 'slider';
  value: [low: number, high: number] | number[];
  param: string | string[];
  options: {
    step?: number;
    isRange?: boolean;
    range: [min: number, max: number];
    pipstep?: number;
  };
}

interface IFilterCheckbox extends IFilterBase {
  type: 'checkbox';
  value: Item['value']; // selected one
  param: string;
  items: Item[];
}

interface IFilterRadio extends IFilterBase {
  type: 'radio';
  value: Item['value']; // selected one
  param: string;
  items: Item[];
}

export type {
  IFilterBase,
  IFilterInput,
  IFilterInputItem,
  IFilterInputGroup,
  IFilterSelect,
  IFilterOrder,
  IFilterSlider,
  IFilterToggle,
  IFilterRadio,
};
export type IFilter =
  | IFilterInput
  | IFilterInputGroup
  | IFilterSelect
  | IFilterOrder
  | IFilterSlider
  | IFilterToggle
  | IFilterRadio
  | IFilterCheckbox;

export type IFilters = (IFilter | IFilter[])[];
export type OrderItem = {
  label: string;
  field: string;
};
