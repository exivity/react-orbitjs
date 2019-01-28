import * as React from 'react';
import { ErrorMessage } from 'react-orbitjs';

export function withError<TWrappedProps>(
  key: string,
  hasErrored: (props: TWrappedProps) => boolean
) {
  return (WrappedComponent: any) => {
    class ErrorWrapper extends React.Component<TWrappedProps> {
      render() {
        const isErrorPresent = hasErrored(this.props);

        if (isErrorPresent) {
          return <ErrorMessage error={this.props[key]} />;
        }

        return <WrappedComponent {...this.props} />;
      }
    }

    return ErrorWrapper;
  };
}
