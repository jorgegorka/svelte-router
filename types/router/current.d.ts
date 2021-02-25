export function RouterCurrent(trackPage: any): Readonly<{
    active: () => string;
    isActive: (queryPath: any, includePath?: boolean) => boolean;
    setActive: (newRoute: any, updateBrowserHistory: any) => void;
}>;
