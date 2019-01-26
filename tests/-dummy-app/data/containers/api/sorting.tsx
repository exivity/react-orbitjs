import * as React from 'react';
import { FindRecordsTerm } from '@orbit/data';

export enum SortDirection {
  Up = 0,
  Down = 1,
}

export interface ISortProps {
  isDescending: boolean;
  isAscending: boolean;
  defaultSort: string;
  sortProperty: string;
  sortDirection: string;
  sort: (property: string, direction: SortDirection) => void;
  toggleSort: (property: string) => void;
  applySort: (builder: FindRecordsTerm) => FindRecordsTerm;
}

export interface ISortOptions {
  defaultSort: string | string[];
}

// TODO: allow multi-property sort?
//       currently this only allows sorting of one property at a time
export function withSorting(options) {
  const { defaultSort } = options;

  return (WrappedComponent) => {
    class SortWrapper extends React.Component<any, { sortProperty: string }> {
      state = { sortProperty: defaultSort || '' };

      toggleSort = (by: string) => {
        const { sortProperty } = this.state;
        const isDescending = sortProperty.startsWith('-');

        this.sort(by, isDescending ? SortDirection.Up : SortDirection.Down);
      };

      sort = (by: string, direction: SortDirection) => {
        const prefix = direction === SortDirection.Up ? '' : '-';

        const sortProperty = `${prefix}${by}`;

        this.setState({ sortProperty });
      };

      applySort = (builder: FindRecordsTerm) => {
        const { sortProperty } = this.state;
        const sorts = [sortProperty];

        // builder.sort support multi-property sort
        return builder.sort(...sorts);
      };

      render() {
        const { sortProperty } = this.state;
        const isDescending = sortProperty.startsWith('-');

        const sortProps = {
          isDescending,
          isAscending: !isDescending,
          sort: this.sort,
          toggleSort: this.toggleSort,
          sortProperty,
          defaultSort,
          applySort: this.applySort,
        };

        return <WrappedComponent {...this.props} {...sortProps} />;
      }
    }

    return SortWrapper;
  };
}
