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
