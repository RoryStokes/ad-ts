import { Option, none, some, fromEither, alt, map } from "fp-ts/lib/Option";
import { Either } from "fp-ts/lib/Either";

interface PatternTag<S, P> {
  _A?: P;
  _O?: S;
}

type OptionalType<P> = Option<P> | Either<unknown, P>;

export type DecodePattern<S, P> = {
  decode: (input: S) => OptionalType<P>;
} & PatternTag<S, P>;
export type FnIsPattern<S> = ((input: S) => boolean) & PatternTag<S, S>;
export type FnDecodePattern<S, P> = ((input: S) => Option<P>) &
  PatternTag<S, P>;

export type Pattern<S, P> =
  | DecodePattern<S, P>
  | FnIsPattern<S>
  | FnDecodePattern<S, P>;

export type PatternMatchTagMapping<S> = {
  [k in string]: Pattern<S, any>;
} & {
  _S?: S;
};

type PatternMatchMapping<
  S,
  MU extends PatternMatchTagMapping<S>,
  ResultType
> = {
  [K in keyof MU]: ((match: NonNullable<MU[K]["_A"]>) => ResultType);
};

const toOption = <P>(o: OptionalType<P>): Option<P> =>
  o._tag === "Left" || o._tag === "Right" ? fromEither(o) : o;

const isDecodePattern = <S, P>(p: Pattern<S, P>): p is DecodePattern<S, P> =>
  !!(<any>p).decode;

const getExtractor = <S, P>(p: Pattern<S, P>): ((s: S) => Option<P>) => (
  s: S
) => {
  if (isDecodePattern(p)) {
    const r = p.decode(s);
    return toOption(r);
  }
  const r = (<(s: S) => Option<P> | boolean>p)(s);
  if (r === true) return some(<any>s);
  if (r === false) return none;
  return r;
};

type GenericMapping<R> = ({}) => R;

export const patternmatch = <S, P extends PatternMatchTagMapping<S>>(
  patterns: P
) => <ResultType>(mappings: PatternMatchMapping<S, P, ResultType>) => {
  const extractors: Record<
    keyof typeof patterns,
    (s: S) => Option<any>
  > = Object.assign(
    {},
    ...Object.keys(mappings).map(k => ({ [k]: getExtractor(patterns[k]) }))
  );

  return (input: S) =>
    Object.keys(patterns).reduce(
      (result: Option<ResultType>, tag: string) =>
        alt(() =>
          map(<GenericMapping<ResultType>>mappings[tag])(extractors[tag](input))
        )(result),
      none
    );
};
