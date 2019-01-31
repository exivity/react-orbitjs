import Store from "@orbit/store";
export declare function modelForRelationOf(dataStore: Store, type: string, relationship: string): string | undefined;
export declare function modelOfType(dataStore: Store, type: string): import("@orbit/data").ModelDefinition;
export declare function relationshipsForType(dataStore: Store, type: string): import("@orbit/utils").Dict<import("@orbit/data").RelationshipDefinition>;
export declare function areArraysShallowlyEqual<T>(a: T[], b: T[]): boolean;
