import * as React from 'react';

import { parseError } from './parse-error';

export interface IProps {
  // TODO: this'll need to be a uninion of types, as we want to support
  // string, JS Error, Http Error, JSONAPI Error, Orbit Error
  //
  // TODO: it may be handy to support an array of errors as well
  error?: any;
}

export default class ErrorMessage extends React.Component<IProps> {
  render() {
    const { error } = this.props;

    if (!error || error.length === 0) {
      return null;
    }

    // title is required, but body is not.
    const { title, body } = parseError(error);

    return (
      <div className="react-orbitjs__error-message-wrapper">
        <div className="react-orbitjs__error-message-title">{title}</div>

        {(body && <p className="react-orbitjs__error-message-body">{body}</p>) || null}
      </div>
    );
  }
}
