import type { SvelteComponent, SvelteComponentTyped } from 'svelte/internal';

export type CurrentRoute = {
  name: string;
  component: SvelteComponent;
  layout?: SvelteComponent;
  queryParams?: Record<string, any>;
  namedParams?: Record<string, any>;
  childRoute?: CurrentRoute;
  language?: string;
};

export interface RouteProps {
  currentRoute: CurrentRoute;
  params?: Record<string, any>;
}

export interface RouteEvents {}

export interface RouteSlots {}

declare class RouteComponent extends SvelteComponentTyped<RouteProps, RouteEvents, RouteSlots> {}

export default RouteComponent;
