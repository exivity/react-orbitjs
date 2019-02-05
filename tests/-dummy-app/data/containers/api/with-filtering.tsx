import * as React from 'react';
import { FindRecordsTerm } from '@orbit/data';
import { camelize } from '@orbit/utils';
import { isEmpty } from '@lib/collection';

export interface IFilter {
  attribute: string;
  value: string | number;
  op?: string;
  key?: string;
}

export interface IProvidedProps {
  filters: IFilter[];
  updateFilter: (filter: IFilter) => void;
  applyFilter: (
    builder: FindRecordsTerm,
    onCache?: boolean,
    ignoreRequired?: boolean
  ) => FindRecordsTerm;
  removeFilter: (filter: IFilter | string) => void;
}

interface IFilterOptions {
  defaultFilters?: IFilter[];
  requiredFilters?: IFilter[];
}

interface IState {
  filters: IFilter[];
  options: IFilterOptions;
}

const defaultOptions = {
  defaultFilters: [],
  requiredFilters: [],
};

const validKeys = ['op', 'attribute', 'value'];

export function withoutFilter(filters: IFilter[], filter: IFilter) {
  const result = filters.filter(currentFilter => {
    const keys = Object.keys(filter);
    // ignore the value key, and make sure we only pull out
    // the existing filter(s) that are the same as the target filter
    const matches = keys
      .map(key => {
        if (key === 'value') {
          return true;
        }

        return currentFilter[key] === filter[key];
      })
      .every(b => b);

    return !matches;
  });

  return result;
}

// example hookup
//
//
// const mapNetworkToProps = ({ applyFilter }) => ({
//   projects: [
//     q => applyFilter(q.findRecords(PROJECT)))
//            .sort('name'),
//   ]
// });
export function withFiltering<TPassedProps>(opts: FnOrObject<TPassedProps, IFilterOptions> = {}) {
  let optionsFunction;

  if (typeof opts !== 'function') {
    optionsFunction = props => opts;
  } else {
    optionsFunction = opts;
  }

  return WrappedComponent => {
    class FilterWrapper extends React.Component<{}, IState> {
      constructor(props) {
        super(props);

        const options = {
          ...defaultOptions,
          ...optionsFunction(props),
        };

        const filters = [...options.defaultFilters];

        this.state = { filters, options };
      }

      updateFilter = (filter: IFilter) => {
        const { filters } = this.state;

        const newFilters = withoutFilter(filters, filter);

        newFilters.push(filter);

        this.setState({ filters: newFilters });
      };

      removeFilter = (filter: IFilter | string) => {
        const { filters } = this.state;
        const attrToRemove = (filter as IFilter).attribute || filter;

        const newFilters = withoutFilter(filters, filter);

        this.setState({ filters: newFilters });
      };

      // NOTE: onCache signifies that that the filtering will only happen on the cache store.
      //       This, unfortunately is needed due to the backend and frontend not having
      //       the same filter implementation.
      //       For example:
      //       - on the backend: { attribute: 'date-archived', value: 'isnull:' }
      //       - on the frontend: { attribute: 'dateArchived', value: null },
      //       these are equivalent.
      //       this technical limitation also stems from the fact that all values
      //       are strings when sent across the network.
      applyFilter = (
        builder: FindRecordsTerm,
        onCache = false,
        ignoreRequired = false
      ): FindRecordsTerm => {
        const { filters, options } = this.state;

        if (isEmpty(filters) && isEmpty(options.requiredFilters)) {
          return builder;
        }

        const required = ignoreRequired ? [] : options.requiredFilters;
        const allFilters = [...filters, ...required];
        const filtersToApply = onCache ? allFilters.map(this._filterOperationMap) : allFilters;

        const withMetaRemoved = filtersToApply.map(filter => {
          const scrubbed = {};
          validKeys.forEach(key => {
            if (filter[key]) {
              scrubbed[key] = filter[key];
            }
          });

          return scrubbed;
        });

        return builder.filter(...withMetaRemoved);
      };

      _filterOperationMap(filter: IFilter): IFilter {
        const attribute = camelize(filter.attribute);

        switch (filter.value) {
          // TODO: need a mapping for dates, as Date.toString() is not
          //       in an iso format.
          case 'isnull:':
            return { ...filter, attribute, value: null };
          case 'isnotnull:':
            return { ...filter, attribute, value: '', op: 'gt' };
          case /ge:/.test(filter.value):
            return { ...filter, value: filter.value.split(':')[1], op: 'gte' };
          case /le:/.test(filter.value):
            return { ...filter, value: filter.value.split(':')[1], op: 'lte' };
          // TODO: write a mapping for like for locale query
          // TODO: also consider a different scheme of mapping remote filtering
          //       with local filtering
          // case 'like:': return { ...filter, attribute, value:}
          default:
            return { ...filter, attribute };
        }
      }

      render() {
        const { filters } = this.state;
        const filterProps: IProvidedProps = {
          filters,
          updateFilter: this.updateFilter,
          applyFilter: this.applyFilter,
          removeFilter: this.removeFilter,
        };

        return <WrappedComponent {...this.props} {...filterProps} />;
      }
    }

    return FilterWrapper;
  };
}
