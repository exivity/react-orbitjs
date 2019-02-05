export function interactor<T>(WrappedClass: T): Interactor & T;
export function text(selector?: string): any;
export function clickable(selector?: string): () => Promise<Interactor>;
export function findAll(selector: string): HTMLElement[];
export function isPresent(selector: string): boolean;
export function selectable(selector: string): (text: string) => Promise<void>;
export function fillable(selector: string): (text: string) => Promise<void>;
export function isHidden(selector: string): boolean;
export function hasClass(selector?: string, className?: string): boolean;
export function collection(selector: string, interactors?: any): (index?: number) => any;
export function value(selector: string): string;
export function is(selector: string): boolean;
export function scoped<T>(selector: string, interactors?: T): Interactor & T;
export function attribute(selector: string, otherSelector?: string): string;

export class Interactor {
  constructor(selector?: string);
  isVisible: boolean;
  isPresent: boolean;
  text: string;
  $$(selector: string): [HTMLElement];
  when<T>(condition: (element?: HTMLElement) => T): this;
  scoped(selector?: string): Interactor;
  do<T>(doFn: (element: Interactor) => void): void;

  click(selector?: string): Promise<void>;
  find(findFn: (element: HTMLElement) => boolean): HTMLElement;
}
