import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faMinus, faEdit, faTrash, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Add icons to the library
library.add(faPlus, faMinus, faEdit, faTrash, faSun, faMoon);

// Create Vue app
const app = createApp(App);

// Add Pinia
const pinia = createPinia();
app.use(pinia);

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon);

// Mount the app
app.mount('#app');