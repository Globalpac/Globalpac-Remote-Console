import type { ProLayoutProps } from '@ant-design/pro-components';

const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Globalpac Console',
  pwa: true,
  logo: '/logo.svg',
  iconfontUrl: '',
  token: {
    colorPrimary: '#1890ff',
  },
};

export default Settings;
