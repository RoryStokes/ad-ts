import { TaggedType, TypeTag } from "./match";

export interface Default<T> { v: T }
type Defaults<T> = Pick<
    { [K in keyof T]: T[K] extends Default<any> ? T[K]['v'] : 'undefined' },
    { [K in keyof T]: T[K] extends Default<any> ? K : never }[keyof T]
>
type DefaultArgs<T> = ({} extends Defaults<T> ? [] : [Defaults<T>])
type WithDefaults<T> = { [K in keyof T]: T[K] extends Default<any> ? T[K]['v'] : T[K] }
type OptionalDefaults<T> = Partial<Defaults<T>>
type NonDefaults<T> = Pick<T,{ [K in keyof T]: T[K] extends Default<any> ? never : K }[keyof T]>
type WithOptionalDefaults<T> = OptionalDefaults<T> & NonDefaults<T>

/**
 * Constructs a new Case Class function that can initialise tagged objects.
 * Structure is defined as a type parameter to the second argument list, where default values must be specified.
 * @param tag The unique tag value that identifies instances of the Case Class
 */
export const CaseClass = <T extends string>(tag: T) => <O extends {}>(...defaults: DefaultArgs<O>) => 
    (args: WithOptionalDefaults<O>): WithDefaults<O> & TaggedType<T> =>(<any> {
    [TypeTag]: tag,
    ...defaults[0] || {},
    ...args
})
