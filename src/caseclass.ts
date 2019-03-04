import { match, MatchableUnion, Matchable } from "./match";

export interface D<T> { v: T }
type Defaults<T> = Pick<
    { [K in keyof T]: T[K] extends D<any> ? T[K]['v'] : 'undefined' },
    { [K in keyof T]: T[K] extends D<any> ? K : never }[keyof T]
>
type DefaultArgs<T> = ({} extends Defaults<T> ? [] : [Defaults<T>])
type WithDefaults<T> = { [K in keyof T]: T[K] extends D<any> ? T[K]['v'] : T[K] }
type OptionalDefaults<T> = Partial<Defaults<T>>
type NonDefaults<T> = Pick<T,{ [K in keyof T]: T[K] extends D<any> ? never : K }[keyof T]>
type WithOptionalDefaults<T> = OptionalDefaults<T> & NonDefaults<T>

export const CaseClass = <T extends string>(tag: T) => <O extends {}>(...defaults: DefaultArgs<O>) => 
    (args: WithOptionalDefaults<O>): WithDefaults<O> & Matchable<T> =>(<any> {
    _t: tag,
    ...defaults[0] || {},
    ...args
})
