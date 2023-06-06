import FilterviewsComponent from './Filterviews.vue';
import icon from '../assets/icon.svg';

export default {
  name: 'FilterviewsPlugin', // The name of the plugin
  component: FilterviewsComponent,
  addToWindows: ['3d',],
  button: {
    position: 'left', // Add an icon in the left or right panel. Value can be 'left' or 'right'
    content: 'panel',  // How the viewer show the plugin content. Value can be 'panel', 'simple' or 'free'
    keepOpen: true, // If true, the window won't be closed if user click somewhere else.
    tooltip: 'Filterviews', // Can be an i18n path or a string shown in all languages
    icon: {
      imgUri: icon,
    },
  },
  i18n: {
    de: {
      elementType: "Element",
      pset: "Pset",
      property: "Eigenschaft",
      operator: "Operator",
      value: "Wert",
      action: "Aktion",
      equals: "ist gleich",
      defined: "ist definiert",
      contains: "enthält",
      in: "enthalten in"
    },
    en: {
      elementType: "Element",
      pset: "Pset",
      property: "Property",
      operator: "Operator",
      value: "Value",
      action: "Action",
      equals: "equals",
      defined: "is defined",
      contains: "contains",
      in: "is in"
    },
  },
};
