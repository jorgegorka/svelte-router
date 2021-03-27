import { SvelteComponent } from 'svelte';
import type { SvelteComponentTyped } from 'svelte/internal';

type Language = Record<string, string> | string;

export type Route = {
  name: string;
  component?: typeof SvelteComponent;
  layout?: typeof SvelteComponent;
  nestedRoutes?: Route[];
  redirectTo?: string;
  onlyIf?: {
    guard: (...args: any) => boolean | Promise<boolean>;
    redirect: string;
  };
  lang?: Language;
};

export type RouterOptions = Partial<{
  prefix: string;
  gaPageviews: boolean;
  lang: Language;
  defaultLanguage: string;
}>;

export interface RouterProps {
  routes: Route[];
  options?: RouterOptions;
}

export interface RouterEvents {}

export interface RouterSlots {}

declare class RouterComponent extends SvelteComponentTyped<RouterProps, RouterEvents, RouterSlots> {}

export default RouterComponent;
