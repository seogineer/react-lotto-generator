import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 콘솔에 등록한 영문명(appName)과 같아야 한다. 딥링크는 intoss://numberlab
  appName: 'numberlab',
  brand: {
    primaryColor: '#10B981',
  },
  permissions: [],
  // CRA 빌드 산출물 폴더 (index.html 포함)
  webBundleDir: 'build',
});
