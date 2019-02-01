import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { FindRecordsTerm, OffsetLimitPageSpecifier } from '@orbit/data';
import { withQueryParams, IProvidedQueryParams } from '@lib/query-string';

export interface IPaginateProps {
  currentPageSize: number;
  currentPageOffset: number;
  setPageSize: (pageSize: number) => void;
  setOffset: (pageOffset: number) => void;
  applyPagination?: (builder: FindRecordsTerm) => FindRecordsTerm;
  prevPage: () => void;
  nextPage: () => void;
}

interface IOptions {
  pageSize?: number;
  pageOffset?: number;
}

const defaultOptions = {
  pageSize: 20,
  pageOffset: 1,
};

interface IState {
  pageSize?: number;
  pageOffset?: number;
}

interface IQueryParams {
  pageSize: string;
  pageOffset: string;
}

type IProps = RouteComponentProps & IProvidedQueryParams<IQueryParams>;

export function withPagination<TPassedProps>(opts: IOptions = {}) {
  const options = {
    ...defaultOptions,
    ...opts,
  };

  return WrappedComponent => {
    class PaginationWrapper extends React.Component<IProps & TPassedProps, IState> {
      state: IState = {};

      componentDidMount() {
        const { queryParams } = this.props;
        const { pageSize, pageOffset } = queryParams;

        const fromQueryParams = {
          pageSize: parseInt(pageSize || `${defaultOptions.pageSize}`, 10),
          pageOffset: parseInt(pageOffset || `${defaultOptions.pageOffset}`, 10),
        };

        this.setState(fromQueryParams);
      }

      setPageSize = (pageSize: number) => {
        const { updateQueryParams } = this.props;

        this.setState({ pageSize });
        updateQueryParams({ pageSize });
      };

      nextPage = () => {
        const { pageOffset } = this.state;

        this.setPageSize(pageOffset + 1);
      };

      prevPage = () => {
        const { pageOffset } = this.state;

        let prevPageNumber = pageOffset - 1;

        if (prevPageNumber < 0) {
          prevPageNumber = 0;
        }

        this.setPageSize(prevPageNumber);
      };

      setOffset = (pageOffset: number) => {
        const { updateQueryParams } = this.props;

        this.setState({ pageOffset });
        updateQueryParams({ pageOffset });
      };

      applyPagination = (builder: FindRecordsTerm): FindRecordsTerm => {
        const { pageSize, pageOffset } = this.state;

        return builder.page({
          offset: pageOffset || options.pageOffset,
          limit: pageSize || options.pageSize,
        } as OffsetLimitPageSpecifier);
      };

      render() {
        const { pageSize, pageOffset } = this.state;
        const paginationProps = {
          currentPageSize: pageSize || options.pageSize,
          currentPageOffset: pageOffset || options.pageOffset,
          setPageSize: this.setPageSize,
          setOffset: this.setOffset,
          applyPagination: this.applyPagination,
          nextPage: this.nextPage,
          prevPage: this.prevPage,
        };

        return <WrappedComponent {...paginationProps} {...this.props} />;
      }
    }

    return withQueryParams(PaginationWrapper);
  };
}
