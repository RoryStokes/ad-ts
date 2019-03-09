import { Option, none, some, fromNullable } from 'fp-ts/lib/Option';

interface PatternTag<S, P> {
    _A?: P,
    _O?: S
}

interface OptionalType<P> {
    _URI?: string,
    getOrElse(d?:P):P
}
export type DecodePattern<S, P> = {
    decode: (input: S) => OptionalType<P>
} & PatternTag<S, P>
export type FnIsPattern<S> = ((input: S) => boolean) & PatternTag<S, S>
export type FnDecodePattern<S, P> = ((input: S) => Option<P>) & PatternTag<S, P>

export type Pattern<S, P> = DecodePattern<S, P> | FnIsPattern<S> | FnDecodePattern<S, P>

export type PatternMatchTagMapping<S> = {
    [k in string]: Pattern<S, any>
} & {
    _S?: S
}

type PatternMatchMapping<S, MU extends PatternMatchTagMapping<S>, ResultType> = {
    [K in keyof MU]: ((match: NonNullable<MU[K]['_A']>) => ResultType)
}

const isOption = <P>(o: OptionalType<P>): o is Option<P> => o._URI === "Option"
const isDecodePattern = <S, P>(p: Pattern<S,P>): p is DecodePattern<S,P> => !!(<any> p).decode

const getExtractor = <S, P>(p: Pattern<S,P>): ((s: S) => Option<P>) => (s: S) => {
    if(isDecodePattern(p)) {
        const r = p.decode(s);
        return isOption(r) ? r : fromNullable(r.getOrElse(undefined))
    }
    const r = (<(s:S) => (Option<P> | boolean)>p)(s)
    if(r === true) return some(<any>s)
    if(r === false) return none
    return r
}

type GenericMapping<R> = ({}) => R


export const patternmatch = <S>(patterns: PatternMatchTagMapping<S>) =>
    <ResultType>(mappings: PatternMatchMapping<S,typeof patterns, ResultType>) => {
        const extractors = Object.assign({}, ...Object.keys(mappings).map(k => ({[k]: getExtractor(patterns[k])})));
        return (input: S) =>  Object.keys(patterns).reduce((result: Option<ResultType>, tag: string) => result.orElse(() =>
            extractors[tag](input).map(<GenericMapping<ResultType>> mappings[tag])
        ), none)
    }