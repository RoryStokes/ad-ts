import { Some, None, some, none, fromNullable}  from 'fp-ts/lib/Option'
import { Left, Right, left, right }  from 'fp-ts/lib/Either'
import { match, TaggedUnion } from "../src/match";
import { patternmatch, Pattern } from "../src/patternmatch";
import * as t from 'io-ts'

test('fp-ts options', () => {
    type TaggedOption<A> = TaggedUnion<{
        Some: Some<A>
        None: None<A>
    }>
    
    const someResult = Symbol('some')
    const noneResult = Symbol('none')
    const someFn = jest.fn((s: Some<{}>) => someResult)
    const noneFn = jest.fn((i: None<{}>) => noneResult)

    const doMatch = (a: TaggedOption<{}>): symbol => match(a)({
        Some: someFn,
        None: noneFn,
    })

    const s = some({})
    expect(doMatch(s)).toBe(someResult)
    expect(someFn).toHaveBeenCalledWith(s)
    expect(noneFn).not.toHaveBeenCalled()
    someFn.mockReset()

    const n = none
    expect(doMatch(n)).toBe(noneResult)
    expect(noneFn).toHaveBeenCalledWith(n)
    expect(someFn).not.toHaveBeenCalled()
})


test('fp-ts eithers', () => {
    type TaggedEither<A,B> = TaggedUnion<{
        Left: Left<A,B>
        Right: Right<A,B>
    }>
    
    const leftResult = Symbol('L')
    const rightResult = Symbol('R')
    const leftFn = jest.fn((s: Left<'L', any>) => leftResult)
    const rightFn = jest.fn((i: Right<any, 'R'>) => rightResult)

    const doMatch = (a: TaggedEither<'L', 'R'>) => match(a)({
        Left: leftFn,
        Right: rightFn
    })

    const l = left<'L', any>('L')
    expect(doMatch(l)).toBe(leftResult)
    expect(leftFn).toHaveBeenCalledWith(l)
    expect(rightFn).not.toHaveBeenCalled()
    leftFn.mockReset()

    const r = right<any, 'R'>('R')
    expect(doMatch(r)).toBe(rightResult)
    expect(rightFn).toHaveBeenCalledWith(r)
    expect(leftFn).not.toHaveBeenCalled()
})

test('io-ts types', () => {
    const HasNumber = t.type({
        val: t.number
    })
    
    const HasString = t.type({
        val: t.string
    })
    
    const numberResult = Symbol('num')
    const stringResult = Symbol('str')
    const numberFn = jest.fn(({}) => numberResult)
    const stringFn = jest.fn(({}) => stringResult)
    
    const doPatternMatch = patternmatch({HasNumber, HasString})({
        HasNumber: numberFn,
        HasString: stringFn
    })

    
    const n = {val: 1}
    expect(doPatternMatch(n)).toEqual(some(numberResult))
    expect(numberFn).toHaveBeenCalledWith(n)
    expect(stringFn).not.toHaveBeenCalled()
    numberFn.mockReset()

    const s = {val: 'a'}
    expect(doPatternMatch(s)).toEqual(some(stringResult))
    expect(stringFn).toHaveBeenCalledWith(s)
    expect(numberFn).not.toHaveBeenCalled()
    stringFn.mockReset()
    
    
    const u = {val: ['someting else']}
    expect(doPatternMatch(u)).toBe(none)
    expect(stringFn).not.toHaveBeenCalled()
    expect(numberFn).not.toHaveBeenCalled()
})