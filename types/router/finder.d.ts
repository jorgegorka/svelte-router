import { Route, RouterOptions } from '../components/router';

export function RouterFinder({
  routes,
  currentUrl,
  routerOptions,
  convert,
}: {
  routes: Route[];
  currentUrl: string;
  routerOptions: RouterOptions;
  convert: boolean;
}): Readonly<{
  findActiveRoute: () => {
    redirectTo: string;
  };
}>;
