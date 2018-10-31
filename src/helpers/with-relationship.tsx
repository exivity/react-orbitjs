import * as React from 'react';
import Store from '@orbit/store';
import { compose, withProps } from 'recompose';
import { Resource } from '@orbit/jsonapi';
import { withOrbit, IOrbitProviderProps } from '../index';

interface MapFnResult {
  [propKey: string]: [any, string, string];
}

interface IState {
  isLoading: boolean;
  error?: any;
  result: object;
}

interface IProvidedProps {
  isLoading: boolean;
  error?: any;
}

// NOTE: all relationships should already be fetched / in the cache
//
// example:
//
// withRelationships((props) => {
//   const { currentUser, currentOrganization } = props;
//
//   return {
//     // many-to-many
//     organizations: [currentUser, 'organizationMemberships', 'organizations'],
//     groups: [currentUser, GROUP_MEMBERSHIPS, GROUPS],
//
//     // has-many
//     ownedProjects: [currentUser, 'projects'],
//
//     // has-one / belongs-to
//     organizationOwner: [currentOrganization, 'owner']
//
//   }
// })
export function withRelationships<T>(mappingFn: (props: T) => MapFnResult) {
  return (WrappedComponent: React.ComponentType<T & IProvidedProps>) => {
    class WithRelationship extends React.PureComponent<T & MapFnResult & IOrbitProviderProps, IState> {
      state = { isLoading: false, error: undefined, result: {} };

      fetchRelationships = async (): Promise<object> => {
        const { dataStore, relationshipsToFind } = this.props;

        const resultingRelationshipProps = {};

        const promises = Object.keys(relationshipsToFind).map(async resultKey => {
          const relationshipArgs = relationshipsToFind[resultKey];

          const relation = await retrieveRelation(dataStore, relationshipArgs);

          resultingRelationshipProps[resultKey] = relation;
        });

        try {
          await Promise.all(promises);
        } catch (e) {
          this.setState({ error: e });
        }

        return resultingRelationshipProps;
      }

      asyncStarter = async () => {
        if (this.state.isLoading) { return; }

        try {
          this.setState({ isLoading: true, error: undefined });
          const result = await this.fetchRelationships();

          this.setState({ result, isLoading: false, error: undefined });
        } catch (error) {
          this.setState({ isLoading: false, error });
        }
      }

      componentDidMount() {
        this.asyncStarter();
      }

      render() {
        const { result, isLoading, error } = this.state;

        const nextProps = {
          ...(this.props as object),
          ...( result || {} ),
          isLoading,
          error
        };

        return <WrappedComponent { ...nextProps } />;
      }
    }

    return compose(
      withProps((props: T) => {
        const mapResult = mappingFn(props);

        return {
          relationshipsToFind: mapResult,
        };
      }),
      withOrbit({}),
    )(WithRelationship);
  };
}


type RelationshipArgs =
| [Resource, string, string]
| [Resource, string];

async function retrieveRelation(dataStore: Store, relationshipArgs: RelationshipArgs): Promise<any> {
  const sourceModel = relationshipArgs[0];
  const relationshipPath = relationshipArgs.slice(1) as [string, string] | [string];

  if (relationshipPath.length === 2) {
    return await retrieveManyToMany(dataStore, sourceModel, relationshipPath);
  }

  return await retriveDirectRelationship(dataStore, sourceModel, relationshipPath[0]);
}

async function retrieveManyToMany(dataStore: Store, sourceModel: Resource, relationshipPath: [string, string]) {
  const [joinRelationship, targetRelationship] = relationshipPath;

  const joins = dataStore.cache.query(q => q.findRelatedRecords(sourceModel, joinRelationship));

  // for each join record....
  const targets: Resource[] = [];
  const promises = joins.map(async (joinRecord: Resource) => {
    const target = await dataStore.cache.query(q => q.findRelatedRecord(joinRecord, targetRelationship));

    targets.push(target);
  });

  await Promise.all(promises);

  return targets;
}

async function retriveDirectRelationship(dataStore: Store, sourceModel: Resource, relationshipName: string) {
  // TODO: add detection for hasOne vs hasMany, via lookup of the schema from dataStore
  throw new Error('not implemented');

}

