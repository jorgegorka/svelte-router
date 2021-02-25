import type { SvelteComponentTyped } from 'svelte/internal';

export interface NavigateProps {
  to: string;
  title?: string;
  styles?: string;
  lang?: string;
}

export interface NavigateEvents {}

export interface NavigateSlots {
  default: {};
}

declare class Navigate extends SvelteComponentTyped<NavigateProps, NavigateEvents, NavigateSlots> {}

export default Navigate;
