import { bootstrapApp } from '@mono-repo-backend/common';

import { AppModule } from './app/app.module';

// Comment test c
// Comment test c
// Promote to release prod ok

bootstrapApp({
  appModule: AppModule,
  swagger: {
    title: 'Users2 API test',
    description: 'Users backend API',
  },
});
