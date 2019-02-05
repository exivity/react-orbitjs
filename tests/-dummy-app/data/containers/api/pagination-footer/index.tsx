import * as React from 'react';
import * as pick from 'lodash/pick';
import Pagination from 'semantic-ui-react/dist/commonjs/addons/Pagination';
import { GENERIC_ATTRIBUTES, IAttributeProps } from '@lib/dom';

import { IPaginateProps } from '../pagination';

type IProps = IPaginateProps & IAttributeProps;

export class PaginationFooter extends React.Component<IProps, {}> {
  onPageChange = (e, options) => {
    const { activePage } = options;
    const { setOffset } = this.props;

    setOffset(activePage);
  };

  render() {
    // TODO: figure out how to get total pages from the response

    const { currentPageOffset, ...otherProps } = this.props;
    const attributeProps = pick(otherProps, GENERIC_ATTRIBUTES);

    return (
      <Pagination
        {...attributeProps}
        data-test-pagination-footer
        totalPages={1000}
        boundaryRange={0}
        siblingRange={0}
        lastItem={null}
        activePage={currentPageOffset}
        onPageChange={this.onPageChange}
      />
    );
  }
}
