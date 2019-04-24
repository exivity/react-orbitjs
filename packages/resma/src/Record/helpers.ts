import { IRecord, RecordIdentifier } from './'

export function hasRelationship (this: IRecord, relationship: string): boolean {
    return !!this.relationships && this.relationships.hasOwnProperty(relationship)
}

export function getRelationship (this: IRecord, relationship: string): IRecord[]|IRecord|void {
    if (hasRelationship.call(this, relationship)) {
        return this.relationships![relationship].data
    } else {
        throw Error(`Record does not possess ${relationship} relation`)
    }
}

export function removeHasMany (this: IRecord, relationship: string, id: string) {
   return this.relationships![relationship].data.filter((relation: RecordIdentifier ) => id !== relation.id)
}

export function curryFn (fn: Function) {
    return function checkArgs (...args: any) {
        if (arguments.length === 1) {
            return function curriedFunction (value: any) {
               return  fn(...args, value)
            }
        } else {
            return fn(...args)
        }
    }
}
