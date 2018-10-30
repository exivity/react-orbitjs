import React from 'react';

const defaultValue = {};

const OrbitContext = React.createContext(defaultValue);

export const OrbitProvider = OrbitContext.Provider;
export const OrbitConsumer = OrbitContext.Consumer;