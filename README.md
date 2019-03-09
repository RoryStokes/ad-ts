# AD.Ts
[![build status](https://img.shields.io/travis/RoryStokes/ad.ts/master.svg?style=flat-square)](https://travis-ci.org/RoryStokes/ad.ts)
[![npm downloads](https://img.shields.io/npm/dt/@rorystokes/ad.ts.svg)](https://www.npmjs.com/package/@rorystokes/ad.ts)

A vague attempt to bring Pattern matching and other ADT based niceness to TypeScript

## Getting Started

```ts
import { match, TaggedUnion } from '@rorystokes/ad.ts/lib/match'
import { CaseClass, Default } from '@rorystokes/ad.ts/lib/caseclass'


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


getName(Foo({ name: "Alan" }))                   // "Alan"
getName(Bar({ label: "Bob" }))                   // "Bar: Bob"
getName(Bar({ label: "Carol", prefix: ">>" }))   // ">> Carol"
```