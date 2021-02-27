export function RouterCurrent(
  trackPage: undefined | boolean
): Readonly<{
  active: () => string;
  isActive: (queryPath: any, includePath?: boolean) => boolean;
  setActive: (newRoute: any, updateBrowserHistory: any) => void;
}>;
