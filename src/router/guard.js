export const RouterGuard = (onlyIf) => {
  const guardInfo = onlyIf;

  const valid = () => {
    return guardInfo && guardInfo.guard && typeof guardInfo.guard === 'function';
  };

  const redirect = () => {
    return !guardInfo.guard();
  };

  const redirectPath = () => {
    let destinationUrl = '/';
    if (guardInfo.redirect && guardInfo.redirect.length > 0) {
      destinationUrl = guardInfo.redirect;
    }

    return destinationUrl;
  };

  return Object.freeze({ valid, redirect, redirectPath });
};
