import * as React from 'react';
export interface IProps {
    error?: any;
}
export default class ErrorMessage extends React.Component<IProps> {
    render(): JSX.Element | null;
}
