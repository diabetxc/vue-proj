import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Import stylesheets in the correct order
import './assets/base.css';
import './styles/main.css';
import './styles/modern-styles.css';

// Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faPlus, 
  faMinus, 
  faEdit, 
  faTrash, 
  faSun, 
  faMoon,
  faSearch,
  faBell,
  faDownload,
  faUpload,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(
  faPlus, 
  faMinus, 
  faEdit, 
  faTrash, 
  faSun, 
  faMoon, 
  faSearch, 
  faBell, 
  faDownload, 
  faUpload,
  faCheck
);

// Create Vue app
const app = createApp(App);

// Add Pinia
const pinia = createPinia();
app.use(pinia);

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon);

// Mount the app
app.mount('#app');