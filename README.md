# AD-Ts
[![build status](https://img.shields.io/travis/RoryStokes/ad-ts/master.svg?style=flat-square)](https://travis-ci.org/RoryStokes/ad-ts)
[![npm downloads](https://img.shields.io/npm/dt/@rorystokes/ad-ts.svg)](https://www.npmjs.com/package/@rorystokes/ad-ts)

A vague attempt to bring Pattern matching and other ADT based niceness to TypeScript

## Getting Started

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
