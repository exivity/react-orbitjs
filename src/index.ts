// NOTE: for legacy reasons / compatibility with upstream,
//       all the data* names need to be maintained
//       a major version update will remove those in favor of 
//       - OrbitProvider
//       - withOrbit

export { 
  OrbitProvider,
  DataProvider, 
  IProps as IOrbitProviderProps,
  IProvidedProps as ILegacyProvidedProps
} from './components/DataProvider';

export {
  APIProvider,
  IProps as IAPIProps
} from './components/api-provider';

export { 
  withOrbit, 
  withData 
} from './components/withData';

export {
  MapRecordsToProps
} from './components/shared';

export { default as strategies } from './strategies';