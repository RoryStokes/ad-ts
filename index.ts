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

type OptionTagMap<A> = {
    Some: Some<A>
    None: None
}

type Option<A> = MatchableUnion<OptionTagMap<A>> // Option<A> | None

const valueOrEmpty = (a: Option<string>) => match(a)({
    Some: () => 'value',
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

type FoobarTagMap = {
    Foo: ReturnType<typeof Foo>
    Bar: ReturnType<typeof Bar>
}
type Foobar = MatchableUnion<FoobarTagMap>

const getLabel = (fb: Foobar) => match<FoobarTagMap, string>(fb)({
    Foo: ({name, colour}) => `${colour} ${name}`,
    Bar: ({label}) => label
});

console.log(getLabel(Foo({ name: "Foo" })))
console.log(getLabel(Bar({ label: "Bar" })))