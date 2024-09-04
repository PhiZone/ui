type Items = Record<string, string>; // value: label
type Range = [min: number, max: number];

interface IFilterBase {
  label: string;
  value: unknown;
  param: string[] | string; // converting the value to the corresponding param
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
  items: Omit<Omit<IFilterInput, 'label'>, 'type'>[];
}

interface IFilterSelect extends IFilterBase {
  type: 'select';
  value: string;
  param: string;
  items: Items;
}

interface IFilterToggle extends IFilterBase {
  type: 'toggle';
  value: boolean;
  param: string;
}

interface IFilterSlider extends IFilterBase {
  type: 'slider';
  value: [low: number, high: number] | number[];
  options: {
    step?: number;
    isRange?: boolean;
    range: [min: number, max: number];
    pipstep?: number;
  };
}
/** TODO unknown relationship between param and value
 interface IFilterCheckbox extends IFilterBase {
      type: 'checkbox';
      value: (keyof this['items'])[]; // selected ones
      param: string[];
      items: Record<string, string>; // value: label
  }
   */

interface IFilterRadio extends IFilterBase {
  type: 'radio';
  value: keyof this['items']; // selected one
  param: string;
  items: Record<string, string>; // value: label
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
  | IFilterRadio;
export type IFilters = (IFilter | IFilter[])[];
