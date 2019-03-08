export const TypeTag = "_tag"
export const UnionMapping = "_mapping"

export interface TaggedType<T extends string> {
    [TypeTag]: T
}


export type TagMapping = {
    [k in string]: TaggedType<k>
}

export type TaggedUnion<MU extends TagMapping> = MU[keyof MU] & {[UnionMapping]?: MU}

type GetTagMapping<MU extends TaggedUnion<TagMapping>> = Exclude<MU['_mapping'],undefined>

type MatchMapping<MU extends TagMapping, ResultType> = {
    [K in keyof MU]: ((match: MU[K]) => ResultType)
}

export const getTag = <T extends string>(matchable: TaggedType<T>): T => matchable[TypeTag]

export const match = <M extends TaggedUnion<TagMapping>>(matchable: M) =>    
    <ResultType>(mapping: MatchMapping<GetTagMapping<M>, ResultType>) =>
    (mapping)[getTag(matchable)](matchable)

export const match_ = <M extends TaggedUnion<TagMapping>, ResultType>(mapping: MatchMapping<GetTagMapping<M>, ResultType>) =>
    (matchable: M) => (mapping)[getTag(matchable)](matchable)