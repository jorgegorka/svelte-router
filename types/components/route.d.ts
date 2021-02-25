import type { SvelteComponent, SvelteComponentTyped } from 'svelte/internal';

type CurrentRoute = {
  layout?: SvelteComponent;
  component?: SvelteComponent;
  childRoute?: CurrentRoute;
};

export interface RouteProps {
  currentRoute: CurrentRoute;
  params?: Record<string, any>;
}

export interface RouteEvents {}

export interface RouteSlots {}

declare class Route extends SvelteComponentTyped<RouteProps, RouteEvents, RouteSlots> {}

export default Route;
