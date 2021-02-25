import { RouterGuard } from './guard';

const RouterRedirect = (route, currentPath) => {
  const guard = RouterGuard(route.onlyIf);

  const path = () => {
    let redirectTo = currentPath;
    if (route.redirectTo && route.redirectTo.length > 0) {
      redirectTo = route.redirectTo;
    }

    if (guard.valid() && guard.redirect()) {
      redirectTo = guard.redirectPath();
    }

    return redirectTo;
  };

  return Object.freeze({ path });
};

export { RouterRedirect };
