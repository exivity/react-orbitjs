import * as React from 'react';

export function waitFor<TWrappedProps>(resultKey: string, asyncFn: (props) => Promise<any>) {
  return WrappedComponent => {
    class WaitForWrapper extends React.Component<TWrappedProps> {
      constructor(props) {
        super(props);

        this.state = {};
      }

      componentDidMount() {
        this.runAsync();
      }

      runAsync = async () => {
        const result = await asyncFn(this.props);

        this.setState({ [resultKey]: result });
      };

      render() {
        return <WrappedComponent {...this.state} {...this.props} />;
      }
    }

    return WaitForWrapper;
  };
}
