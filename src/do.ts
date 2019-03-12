import { URIS, Type, URIS2, Type2 } from "fp-ts/lib/HKT";
import { Monad1, Monad2 } from "fp-ts/lib/Monad";
import { URI } from "fp-ts/lib/Either";

type ForFn<URI extends URIS, Context extends {}, Output> = ((context: Context) => Type<URI, Output>)
type ForExpr<URI extends URIS, Context extends {}, Output> = Type<URI, Output> | ForFn<URI, Context, Output>

type ForFn2<URI extends URIS2, Context extends {}, A, Output> = ((context: Context) => Type2<URI, A, Output>)
type ForExpr2<URI extends URIS2, Context extends {}, A, Output> = Type2<URI, A, Output> | ForFn2<URI, Context, A, Output>

type EqFn<Context extends {}, Output> = (context: Context) => Output

type NewContext<Context extends {}, NewProps extends string, Output> = Context & {
    [prop in NewProps]: Output
}

const isFn = (fn: any): fn is Function => typeof fn === "function"

const isFn2 = <URI extends URIS, Context extends {}, Output>(fn: ForExpr<URI, Context, Output>): 
    fn is ForFn<URI, Context, Output> => typeof fn === "function"


export class DoContext<URI extends URIS, Context extends {}> {
    constructor(private readonly monad: Monad1<URI>, readonly context: Type<URI, Context>) { }
    /**
     * Binds a property in the context to a wrapped value derived from the current context
     * @param prop the name of the property
     * @param value the wrapped value to be bound, or a function from the current context to a wrapped value to be bound
     */
    bind<Output, NewProp extends string>(prop: NewProp, value: ForExpr<URI, Context, Output>) {
        return new DoContext<URI, NewContext<Context, NewProp, Output>>(this.monad, this.monad.chain(this.context, (context) => {
            const wrappedValue = isFn(value) ? value(context) : value
            return this.monad.map(wrappedValue, newValue => (<NewContext<Context, NewProp, Output>>{
                ...context,
                [prop]: newValue
            }))
        }))
    }
    
    /**
     * Assigns a property in the context to a value derived from the current context
     * @param prop the name of the property
     * @param fn a function from the current context to the value to be assigned
     */
    with<Output, NewProp extends string>(prop: NewProp, fn: EqFn<Context, Output>) {
        return new DoContext<URI, NewContext<Context, NewProp, Output>>(this.monad, this.monad.map(this.context, (context) => (
            <NewContext<Context, NewProp, Output>>{
                ...context,
                [prop]: fn(context)
            }
        )))
    }
    /**
     * Extracts a wrapped value from the context
     * @param fn a function from the current context to the value to be returned
     */
    yield<Output>(fn: (context: Context) => Output) {
        return this.monad.map(this.context, fn);
    }
}

export class DoContext2<URI extends URIS2, Context extends {}, A> {
    constructor(private readonly monad: Monad2<URI>, readonly context: Type2<URI, A, Context>) { }
    /**
     * Binds a property in the context to a wrapped value derived from the current context
     * @param prop the name of the property
     * @param value the wrapped value to be bound, or a function from the current context to a wrapped value to be bound
     */
    bind<Output, NewProp extends string, NewA>(prop: NewProp, value: ForExpr2<URI, Context, NewA, Output>) {
        const broaderContext: Type2<URI, A | NewA, Context> = this.context;
        return new DoContext2<URI, NewContext<Context, NewProp, Output>, A | NewA>(this.monad, this.monad.chain(broaderContext, (context) => {
            const wrappedValue = isFn(value) ? value(context) : value
            return this.monad.map(wrappedValue, newValue => (<NewContext<Context, NewProp, Output>>{
                ...context,
                [prop]: newValue
            }))
        }))
    }
    
    /**
     * Assigns a property in the context to a value derived from the current context
     * @param prop the name of the property
     * @param fn a function from the current context to the value to be assigned
     */
    with<Output, NewProp extends string>(prop: NewProp, fn: EqFn<Context, Output>) {
        return new DoContext2<URI, NewContext<Context, NewProp, Output>, A>(this.monad, this.monad.map(this.context, (context) => (
            <NewContext<Context, NewProp, Output>>{
                ...context,
                [prop]: fn(context)
            }
        )))
    }
    /**
     * Extracts a wrapped value from the context
     * @param fn a function from the current context to the value to be returned
     */
    yield<Output>(fn: (context: Context) => Output) {
        return this.monad.map(this.context, fn);
    }
}

/**
 * Initialises a new "do" comprehesion over the specified monad with an empty context
 * @param monad the fp-ts Monad1 definition
 */
export const doOn = <URI extends URIS>(monad: Monad1<URI>) => new DoContext(monad, monad.of({}))
export const doOn2 = <URI extends URIS2>(monad: Monad2<URI>) => new DoContext2<URI, {}, never>(monad, monad.of({}))