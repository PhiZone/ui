import type { IFilters, OrderItem } from './types';

export const userOrderItems: OrderItem[] = [
  {
    label: 'user.gender',
    field: 'Gender',
  },
  {
    label: 'user.bio',
    field: 'Biography',
  },
  {
    label: 'user.role',
    field: 'Role',
  },
  {
    label: 'user.exp',
    field: 'Experience',
  },
  {
    label: 'user.tag',
    field: 'Tag',
  },
  {
    label: 'user.rks',
    field: 'Rks',
  },
  {
    label: 'user.language',
    field: 'Language',
  },
  {
    label: 'user.last_login',
    field: 'DateLastLoggedIn',
  },
  {
    label: 'user.date_joined',
    field: 'DateJoined',
  },
  {
    label: 'user.date_of_birth',
    field: 'DateOfBirth',
  },
  {
    label: 'user.follower_count',
    field: 'FollowerCount',
  },
  {
    label: 'user.followee_count',
    field: 'FolloweeCount',
  },
  {
    label: 'user.username',
    field: 'UserName',
  },
];

export const userFilters: IFilters = [
  {
    type: 'radio',
    label: 'user.gender',
    value: '',
    param: 'RangeGender',
    items: [
      {
        label: 'user.genders.0',
        value: 0,
      },
      {
        label: 'user.genders.1',
        value: 1,
      },
      {
        label: 'user.genders.2',
        value: 2,
      },
    ],
  },
  {
    type: 'input_group',
    label: 'user.date_joined',
    items: [
      {
        value: '',
        param: 'EarliestDateJoined',
        options: {
          inputType: 'text',
          placeholder: 'user.earliest_date_joined',
        },
      },
      {
        value: '',
        param: 'LatestDateJoined',
        options: {
          inputType: 'text',
          placeholder: 'user.latest_date_joined',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'user.date_of_birth',
    items: [
      {
        value: '',
        param: 'EarliestDateOfBirth',
        options: {
          inputType: 'text',
          placeholder: 'user.earliest_date_of_birth',
        },
      },
      {
        value: '',
        param: 'LatestDateOfBirth',
        options: {
          inputType: 'text',
          placeholder: 'user.latest_date_of_birth',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'user.exp',
    items: [
      {
        value: '',
        param: 'MinExperience',
        options: {
          inputType: 'number',
          placeholder: 'user.lowest_exp',
        },
      },
      {
        value: '',
        param: 'MaxExperience',
        options: {
          inputType: 'number',
          placeholder: 'user.highest_exp',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'user.followee_count',
    items: [
      {
        value: '',
        param: 'MinFolloweeCount',
        options: {
          inputType: 'number',
          placeholder: 'user.lowest_followee_count',
        },
      },
      {
        value: '',
        param: 'MaxFolloweeCount',
        options: {
          inputType: 'number',
          placeholder: 'user.highest_followee_count',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'user.follower_count',
    items: [
      {
        value: '',
        param: 'MinFollowerCount',
        options: {
          inputType: 'number',
          placeholder: 'user.lowest_follower_count',
        },
      },
      {
        value: '',
        param: 'MaxFollowerCount',
        options: {
          inputType: 'number',
          placeholder: 'user.highest_follower_count',
        },
      },
    ],
  },
  {
    type: 'input',
    label: 'user.language',
    value: '',
    param: 'ContainsLanguage',
    options: {
      inputType: 'text',
      placeholder: 'user.language',
    },
  },
  {
    type: 'input_group',
    label: 'user.last_login',
    items: [
      {
        value: '',
        param: 'EarliestDateLastLoggedIn',
        options: {
          inputType: 'text',
          placeholder: 'user.earliest_last_login',
        },
      },
      {
        value: '',
        param: 'LatestDateLastLoggedIn',
        options: {
          inputType: 'text',
          placeholder: 'user.latest_last_login',
        },
      },
    ],
  },
  {
    type: 'input_group',
    label: 'user.rks',
    items: [
      {
        value: '',
        param: 'MinRks',
        options: {
          inputType: 'number',
          placeholder: 'user.lowest_rks',
        },
      },
      {
        value: '',
        param: 'MaxRks',
        options: {
          inputType: 'number',
          placeholder: 'user.highest_rks',
        },
      },
    ],
  },
  {
    type: 'select',
    label: 'user.role',
    value: [],
    param: 'RangeRole',
    options: {
      multiple: true,
    },
    items: [
      {
        id: 0,
        label: 'user.roles.Unactivated',
        value: 0,
      },
      {
        id: 1,
        label: 'user.roles.Member',
        value: 1,
      },
      {
        id: 2,
        label: 'user.roles.Sponsor',
        value: 2,
      },
      {
        id: 3,
        label: 'user.roles.Qualified',
        value: 3,
      },
      {
        id: 4,
        label: 'user.roles.Volunteer',
        value: 4,
      },
      {
        id: 5,
        label: 'user.roles.Moderator',
        value: 5,
      },
      {
        id: 6,
        label: 'user.roles.Administrator',
        value: 6,
      },
    ],
  },
  {
    type: 'input',
    label: 'user.tag',
    value: '',
    param: 'ContainsTag',
    options: {
      inputType: 'text',
      placeholder: 'user.tag',
    },
  },
  {
    type: 'input',
    label: 'user.username',
    value: '',
    param: 'ContainsUserName',
    options: {
      inputType: 'text',
      placeholder: 'user.username',
    },
  },
];
