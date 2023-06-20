import RoombookComponent from './Roombook.vue';

export default {
  name: 'RoombookPlugin', // The name of the plugin
  component: RoombookComponent,
  window: {
    name: 'Roombook',
    label: 'RoombookPlugin.window_label',
    plugins: ['fullscreen'],
  },
  i18n: {
    en: {
      window_label: 'Roombook'
    },
    fr: {
      window_label: 'Roombook'
    },
  },
};
