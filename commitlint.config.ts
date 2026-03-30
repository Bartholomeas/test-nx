export default {
  extends: ['@commitlint/config-conventional'],
   rules: {
    'scope-enum': [
      2,
      'always',
      [
        'users2-backend',
        'mng-admin-backend',
        'common',
        'release',
      ],
    ],
    'scope-empty': [1, 'never'],
  },
};
