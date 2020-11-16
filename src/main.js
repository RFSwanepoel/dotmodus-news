import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import vuetify from './plugins/vuetify';
import '@fortawesome/fontawesome-free/css/all.css'
import './assets/fonts/blackchancery/stylesheet.scss'
import './styles/main.style.scss'


Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
