
import HomePage from '../pages/home.f7';
import AboutPage from '../pages/about.f7';
import LookAndArrangeHome from '../pages/look-and-arrange/home.f7';
import LookAndArrangeGame from '../pages/look-and-arrange/game.f7';

var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/home',
    component: HomePage
  },
  {
    path: '/about',
    component: AboutPage
  },
  {
    path: '/look-and-arrange/home',
    component: LookAndArrangeHome
  },
  {
    path: '/look-and-arrange/game',
    component: LookAndArrangeGame
  }
];

export default routes;