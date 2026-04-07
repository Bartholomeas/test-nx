export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['users2-backend', 'manage2-backend', 'admin2-backend', 'common', 'release'],
    ],
    'scope-empty': [1, 'never'],
  },
};
