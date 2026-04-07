import { bootstrapApp } from '@mono-repo-backend/common';

import { AppModule } from './app/app.module';

bootstrapApp({
  appModule: AppModule,
  swagger: {
    title: 'Admin2 API',
    description: 'Admin backend API',
  },
});
