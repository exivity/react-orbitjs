import * as React from 'react';
import { ErrorMessage } from 'dummy-app/ui/components/errors';

export function withError<TWrappedProps>(
  key: string,
  hasErrored: (props: TWrappedProps) => boolean
) {
  return (WrappedComponent) => {
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
