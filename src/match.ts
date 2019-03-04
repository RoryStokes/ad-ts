export interface Matchable<T extends string> {
    _t: T
}

export type MatchableTagMapping = {
    [k in string]: Matchable<k>
}

export type MatchableUnion<MU extends MatchableTagMapping> = MU[keyof MU] & {_m?: MU}

type GetTagMapping<MU extends MatchableUnion<MatchableTagMapping>> = Exclude<MU['_m'],undefined>
type MatchMapping<MU extends MatchableTagMapping, ResultType> = {
    [K in keyof MU]: ((match: MU[K]) => ResultType)
}

export const match = <M extends MatchableUnion<MatchableTagMapping>>(matchable: M) =>    
    <ResultType>(mapping: MatchMapping<GetTagMapping<M>, ResultType>) =>
    (mapping)[matchable._t](matchable)