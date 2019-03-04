export interface Matchable<T extends string> {
    _t: T
}

export type MatchableTagMapping = {
    [k in string]: Matchable<k>
}

export type MatchableUnion<MU extends MatchableTagMapping> = MU[keyof MU]
export type MatchMapping<MU extends MatchableTagMapping, ResultType> = {
    [K in keyof MU]: ((match: MU[K]) => ResultType)
}

export const match = <M extends MatchableTagMapping, ResultType>(matchable: MatchableUnion<M>) =>    
    (mapping: MatchMapping<M, ResultType>) =>
    (<any> mapping)[matchable._t](matchable)