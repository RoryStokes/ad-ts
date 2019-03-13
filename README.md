# AD-Ts
[![build status](https://img.shields.io/travis/RoryStokes/ad-ts/master.svg?style=flat-square)](https://travis-ci.org/RoryStokes/ad-ts)
[![npm downloads](https://img.shields.io/npm/dt/@rorystokes/ad-ts.svg)](https://www.npmjs.com/package/@rorystokes/ad-ts)

Bringing Pattern Matching and other ADT and Functional Programming based niceness to TypeScript

## Getting Started

### Do syntax (NEW)
```ts
import { doOn } from './do';
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
    .with("s", () => s)
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
