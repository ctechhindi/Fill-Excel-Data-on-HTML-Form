import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
Vue.use(Buefy);

Vue.use(VueRouter)

export default new VueRouter({
  routes
})
