import { SvelteComponent } from 'svelte';
import type { SvelteComponentTyped } from 'svelte/internal';

type CurrentRouteProp = {
  name: string;
  path: string;
  hash: string;
  component?: typeof SvelteComponent;
  layout?: typeof SvelteComponent;
  queryParams: Record<string, string>;
  namedParams: Record<string, string>;
  childRoute: CurrentRoute;
  language?: string;
};

export type CurrentRoute = Omit<CurrentRouteProp, 'childRoute'>;

export interface RouteProps {
  currentRoute: CurrentRouteProp;
  params?: Record<string, string>;
}

export interface RouteEvents {}

export interface RouteSlots {}

declare class RouteComponent extends SvelteComponentTyped<RouteProps, RouteEvents, RouteSlots> {}

export default RouteComponent;
