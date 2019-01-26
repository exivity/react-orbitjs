interface IOptions {
  props: any;
}

export function setupAppForTesting(component: React.Component<any, any>, options: IOptions): any;

export function location(): { pathname: string };
export function visit(path: string): Promise<void>;
