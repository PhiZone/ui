type Items = Record<string, string>; // value: label

interface IFilterBase {
  label: string;
  value: unknown;
  param: string[] | string; // converting the value to the corresponding param
  type:
    | 'input'
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
  options: {
    inputType: 'number' | 'text';
    isInt?: boolean;
    range?: [min: number, max: number];
  };
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
  IFilterSelect,
  IFilterSlider,
  IFilterToggle,
  IFilterRadio,
};
export type IFilter = IFilterInput | IFilterSelect | IFilterSlider | IFilterToggle | IFilterRadio;
export type IFilters = (IFilter | IFilter[])[];
