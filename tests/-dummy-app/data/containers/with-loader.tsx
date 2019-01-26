import * as React from 'react';

export function withLoader<TWrappedProps>(
  isLoading: (props: TWrappedProps) => boolean,
) {
  const Loader = () => <div>Loading...</div>;

  return WrappedComponent => {
    class LoadingWrapper extends React.Component<TWrappedProps> {
      render() {
        const isCurrentlyLoading = isLoading(this.props);

        if (isCurrentlyLoading) {
          return <Loader />;
        }

        return <WrappedComponent {...this.props} />;
      }
    }

    return LoadingWrapper;
  };
}
