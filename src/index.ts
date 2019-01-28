// NOTE: for legacy reasons / compatibility with upstream,
//       all the data* names need to be maintained
//       a major version update will remove those in favor of 
//       - OrbitProvider
//       - withOrbit

export { 
  OrbitProvider,
  DataProvider, 
  IProps as IOrbitProviderProps 
} from './components/DataProvider';

export { 
  withOrbit, 
  withData 
} from './components/withData';

export {
  MapRecordsToProps
} from './components/shared';