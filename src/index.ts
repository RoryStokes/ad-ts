import { match, MatchableUnion, Matchable } from "./match";
import { CaseClass, D } from "./caseclass";



// Options
class Some<A> {
    readonly _t = "Some"
    constructor(readonly value: A) { }
}

class None {
    readonly _t = "None"
}

type Option<A> = MatchableUnion<{
    Some: Some<A>
    None: None
}> // Some<A> | None

const valueOrEmpty = (a: Option<string>) => match(a)({
    Some: ({value}) => value,
    None: () => "Empty"
})

console.log(valueOrEmpty(new Some("text")))
console.log(valueOrEmpty(new None()))




// Case Classes

const Foo = CaseClass("Foo")<{
    name: string
    colour: D<"Red" | "Green" | "Blue">
    size?: number
}>({
    colour: "Red"
})

const Bar = CaseClass("Bar")<{
    label: string
}>()

type Foobar = MatchableUnion<{
    Foo: ReturnType<typeof Foo>
    Bar: ReturnType<typeof Bar>
}>

const getLabel = (fb: Foobar) => match(fb)({
    Foo: ({name, colour}) => `${colour} ${name}`,
    Bar: ({label}) => label
});

console.log(getLabel(Foo({ name: "Foo" })))
console.log(getLabel(Bar({ label: "Bar" })))