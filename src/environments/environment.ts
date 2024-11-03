declare const require: any;

export const environment = {
  production: false,
  appName: 'cec App',
  home: '/painel/collaborator',
  // api: 'http://127.0.0.1:8000/api',
  api: 'https://assinador.certificadodigitalcec.com.br:3001/api',
  version: require('../../package.json').version
};
