import Home from './Home';
import About from './About';
import PostComponent from './Post';

const routes = [
  {
    path: '/',
    name: 'home',
    exact: true,
    component: Home,
  },
  {
    path: '/post/:slug',
    name: 'post',
    component: PostComponent,
  },
  {
    path: '/about',
    component: About,
    name: 'about',
  },
];

export default routes;
