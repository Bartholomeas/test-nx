import { bootstrapApp } from '@mono-repo-backend/common';

import { AppModule } from './app/app.module';

// Comment test c
// Comment test c damksjdkajsdasjd
// Comment test c damksjdkajsdasjd
// Comment test c damksjdkajsdasjd
// Comment test c damksjdkajsdasjd
// Promote to release prod ok fffff
// Promote to release prod ok test test

bootstrapApp({
  appModule: AppModule,
  swagger: {
    title: 'Users2 API test v222',
    description: 'Users backend API description v222',
  },
});
