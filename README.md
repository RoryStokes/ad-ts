# AD-Ts
[![build status](https://img.shields.io/travis/RoryStokes/ad-ts/master.svg?style=flat-square)](https://travis-ci.org/RoryStokes/ad-ts)
[![npm downloads](https://img.shields.io/npm/dw/@rorystokes/ad-ts.svg?style=flat-square)](https://www.npmjs.com/package/@rorystokes/ad-ts)

Bringing Pattern Matching and other ADT and Functional Programming concepts to TypeScript. Borrows
heavily from and builds on top of @gcanti's [`fp-ts`](https://github.com/gcanti/fp-ts) library.

## Submodules

### `match`
The `match` submodule provides simple, type-safe 'pattern matching' across a 
[`TaggedUnion`](https://en.wikipedia.org/wiki/Tagged_union). This requires each instance of any of
the types in the union to have an explicit `_tag` value to uniquely identify the type they belong
to.

Many of the types provided by [`fp-ts`](https://github.com/gcanti/fp-ts) including Option and Either
already have such tags, and as such a `TaggedUnion` can be constructed using these types.

`TaggedUnions` must be used instead of native TypeScript Unions as they encode the mapping from tags
to types in a form that the type system can leverage to provide safety in match methods.

### `caseclass`
The `caseclass` submodule is designed to supplement the usage of `match`, providing an easy way to
define a tagged type, including specifying default values.

### `patternmatch`
The `patternmatch` submodule allows for more generic pattern matching across any values. It always
returns a [`fp-ts`](https://github.com/gcanti/fp-ts) Option, as exhaustivity testing is not 
possible.

Patterns can either be simple boolean guards, or extractor methods that return optional extracted
results.

### `do`
The `do` submodule aims to provide equivalent syntax to `for` comprehensions in Scala or `do` in 
Haskell (see [Wikipedia's page on Monads](https://en.wikipedia.org/wiki/Monad_(functional_programming)#Syntax_Sugar))

This depends heavily on the `Monad` HKT defined by [`fp-ts`](https://github.com/gcanti/fp-ts).

## Examples

### Do syntax
```ts
import { doOn } from '@rorystokes/ad-ts/do';
import { Either, either, left, right } from 'fp-ts/lib/Either';

const numberOrError = (s: string): Either<string, number> => {
    const n = Number.parseFloat(s)
    return Number.isNaN(n) ? left(`'${s}' is not a number`) : right(n)
}

const sqrtOrError = (n: number): Either<string, number> => {
    const sqrt = Math.sqrt(n)
    return Number.isInteger(sqrt) ? right(sqrt) : left(`${n} is not a square number]`)
}

const testString = (s: string) => doOn(either)
    .with("s", s)
    .bind("n", ({s}) => numberOrError(s))
    .bind("sqrt", ({n}) => sqrtOrError(n))
    .yield(({sqrt}) => sqrt)

testString("9")       // right(3)
testString("8")       // left("8 is not a square number")
testString("seven")   // left("'seven' is not a number")
```

### Matching on Classes
```ts
import { match, TaggedUnion, TypeTag } from '@rorystokes/ad-ts/match'

class Foo {
    readonly [TypeTag]: "Foo"
    constructor(readonly name: string) { }
}

class Bar {
    readonly [TypeTag]: "Bar"
    constructor(readonly fn: string, readonly sn: string) { }
}

type FooBar = TaggedUnion<{
    Foo: Foo,
    Bar: Bar
}>


const getName = (foobar: FooBar) => match(foobar)({
    Foo: ({ name }) => name,
    Bar: ({ fn, sn }) => `${fn} ${sn}`
})

getName(new Foo("Alan"))           // "Alan"
getName(new Bar("Bob", "Brown"))   // "Bob Brown"
```

### Matching on Case Class
```ts
import { match, TaggedUnion } from '@rorystokes/ad-ts/match'
import { CaseClass, Default } from '@rorystokes/ad-ts/caseclass'


const Foo = CaseClass("Foo")<{
    name: string,
    size?: number
}>()
type Foo = ReturnType<typeof Foo>

const Bar = CaseClass("Bar")<{
    label: string,
    prefix: Default<string>
}>({
    prefix: "Bar:"
})
type Bar = ReturnType<typeof Bar>

type FooBar = TaggedUnion<{
    Foo: Foo,
    Bar: Bar
}>


const getName = (foobar: FooBar) => match(foobar)({
    Foo: ({ name }) => name,
    Bar: ({ label, prefix }) => `${prefix} ${label}`
})


getName(Foo({ name: "Alan" }))                 // "Alan"
getName(Bar({ label: "Bob" }))                 // "Bar: Bob"
getName(Bar({ label: "Carol", prefix: ">>" })) // ">> Carol"
```

### Pattern matching
```ts
import { patternmatch, Pattern } from '@rorystokes/ad-ts/patternmatch'
import { none, some } from 'fp-ts/lib/Option';

const IsInteger: Pattern<number, number> = Number.isInteger

const Square: Pattern<number, { i: number, sqrt: number }> = (i: number) => {
    const sqrt = Math.sqrt(i)
    return Number.isInteger(sqrt) ? some({ i, sqrt }) : none
}

const checkNumber = patternmatch<number>({ Square, IsInteger })({
    Square: ({ sqrt, i }) => `${i} is ${sqrt}^2`,
    IsInteger: (i) => `${i} is an integer`
})

checkNumber(3)    // some("3 is an integer")
checkNumber(4)    // some("4 is 2^2")
checkNumber(5.6)  // none
```

## With fp-ts
See https://github.com/gcanti/fp-ts

### Options
```ts
import { match, TaggedUnion } from '@rorystokes/ad-ts/match'
import { Some, None, some, none } from 'fp-ts/lib/Option'

type TaggedOption<A> = TaggedUnion<{
    Some: Some<A>,
    None: None<A>
}>

const valueOrEmpty = (opt: TaggedOption<string>) => match(opt)({
    Some: ({value}) => value,
    None: () => "Empty"
})


valueOrEmpty(some("Full")) // "Full"
valueOrEmpty(none)         // "Empty"
```

### Eithers

```ts
import { match, TaggedUnion } from '@rorystokes/ad-ts/match'
import { Left, Right, left, right } from 'fp-ts/lib/Either'

type TaggedEither<A,B> = TaggedUnion<{
    Left: Left<A, B>,
    Right: Right<A, B>
}>

const getString = (either: TaggedEither<number, string>) => match(either)({
    Left: ({value}) => `#${value}`,
    Right: ({value}) => `'${value}'`
})


getString(left(42))        // "#42"
getString(right("hello"))  // "'hello'"
```
