import { bootstrapApp } from '@mono-repo-backend/common';

import { AppModule } from './app/app.module';

bootstrapApp({
  appModule: AppModule,
  swagger: {
    title: 'Users2 API',
    description: 'Users backend API',
  },
});
