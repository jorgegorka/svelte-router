import type { SvelteComponentTyped } from 'svelte/internal';

export interface RouterProps {
  routes: any[];
  options: Partial<{
    gaPageviews: string;
    lang: string;
    defaultLanguage: string;
  }>;
}

export interface RouterEvents {}

export interface RouterSlots {}

declare class Router extends SvelteComponentTyped<RouterProps, RouterEvents, RouterSlots> {}

export default Router;
