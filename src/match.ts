export const TypeTag = "_tag";
export const UnionMapping = "_mapping";

export interface TaggedType<T extends string> {
  [TypeTag]: T;
}

export type TagMapping = {
  [k in string]: TaggedType<k>;
};

/**
 * Constructs a Tagged Union of several tagged types, persisting the mapping between tags and
 * their associated types for later access by the type system
 */
export type TaggedUnion<MU extends TagMapping> = MU[keyof MU] & {
  [UnionMapping]?: MU;
};

type GetTagMapping<MU extends TaggedUnion<TagMapping>> = Exclude<
  MU["_mapping"],
  undefined
>;

type MatchMapping<MU extends TagMapping, ResultType> = {
  [K in keyof MU]: ((match: MU[K]) => ResultType);
};

export const getTag = <T extends string>(matchable: TaggedType<T>): T =>
  matchable[TypeTag];

/**
 * Matches on a member of a Tagged Union, returning the result of the defined mapping for
 * the corresponding type.
 * @param matchable the Tagged Union member to match on
 */
export const match = <M extends TaggedUnion<TagMapping>>(matchable: M) => <
  ResultType
>(
  mapping: MatchMapping<GetTagMapping<M>, ResultType>
) => {
  const fn: (m: M) => ResultType = <() => ResultType>mapping[getTag(matchable)];
  return fn(matchable);
};

export const match_ = <M extends TaggedUnion<TagMapping>, ResultType>(
  mapping: MatchMapping<GetTagMapping<M>, ResultType>
) => (matchable: M) => {
  const fn: (m: M) => ResultType = <() => ResultType>mapping[getTag(matchable)];
  return fn(matchable);
};
