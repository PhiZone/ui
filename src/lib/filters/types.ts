import type Svelecte from 'svelecte';

type Item = {
  label: string;
  value: unknown;
};
type Range = [min: number, max: number];

interface IFilterBase {
  label: string;
  value: unknown;
  param: string[] | string; // converting the value to the corresponding param
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

interface IFilterInputGroup {
  type: 'input_group';
  label: string;
  isEnable?: boolean;
  items: Omit<Omit<IFilterInput, 'label'>, 'type'>[];
}

interface IFilterSelect extends IFilterBase {
  type: 'select';
  value: string;
  param: string;
  // basically it's { label:string, value:string }
  items: Svelecte['options'];
  // props of svelecte. see https://svelecte.vercel.app/options for more information
  options?: object & {
    multiple: boolean;
    placeholder: string;
  };
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
  IFilterInputGroup,
  IFilterSelect,
  IFilterSlider,
  IFilterToggle,
  IFilterRadio,
};
export type IFilter =
  | IFilterInput
  | IFilterInputGroup
  | IFilterSelect
  | IFilterSlider
  | IFilterToggle
  | IFilterRadio
  | IFilterCheckbox;

export type IFilters = (IFilter | IFilter[])[];
export type OrderItem = {
  label: string;
  field: string;
};
