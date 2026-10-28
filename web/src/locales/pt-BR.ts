import webClient from './pt-BR/webClient';
import component from './pt-BR/component';
import globalHeader from './pt-BR/globalHeader';
import menu from './pt-BR/menu';
import pages from './pt-BR/pages';
import remoto from './pt-BR/remoto';
import pwa from './pt-BR/pwa';
import settingDrawer from './pt-BR/settingDrawer';
import settings from './pt-BR/settings';

export default {
  ...serverNetwork,
  ...webClient,
  'navBar.lang': 'Idiomas',
  'layout.user.link.help': 'Ajuda',
  'layout.user.link.privacy': 'Privacidade',
  'layout.user.link.terms': 'Termos',
  'layout.user.logout': 'Sair',
  'layout.user.accountCenter': 'Gerenciar Conta',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
  ...remoto,
};
import serverNetwork from './pt-BR/serverNetwork';
