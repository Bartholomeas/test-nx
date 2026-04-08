import { bootstrapApp } from '@mono-repo-backend/common';

import { AppModule } from './app/app.module';

bootstrapApp({
  appModule: AppModule,
  swagger: {
    title: 'Manage2 API',
    description: 'Manage backend API',
  },
});
