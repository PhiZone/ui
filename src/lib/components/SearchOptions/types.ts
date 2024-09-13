import type { SvelecteProps } from 'svelecte';

type Item = {
  label: string;
  value: unknown;
}; // value: label
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

interface IFilterInput extends IFilterBase {
  type: 'input';
  value: string | number;
  param: string;
  options: {
    inputType: 'number' | 'text';
    placeholder?: string;
    isInt?: boolean;
    range?: Range;
  };
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
  // see https://svelecte.vercel.app/options for more information
  // basically it's { text:string, value:string }
  items: SvelecteProps['options'][];
  options?: {
    isMultiple?: boolean;
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
  param: string|string[];
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
