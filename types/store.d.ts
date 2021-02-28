export namespace activeRoute {
    export const subscribe: (run: (value: {}) => void, invalidate?: (value?: {}) => void) => () => void;
    export { set };
    export { remove };
}
declare function set(route: any): void;
declare function remove(): void;
export {};
