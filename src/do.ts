import { HKT, URIS, Type, URIS2, Type2 } from "fp-ts/lib/HKT";
import { Monad, Monad1, Monad2 } from "fp-ts/lib/Monad";

type DoExpr<URI extends string, Context extends {}, Output> = HKT<URI, Output> | ((context: Context) => HKT<URI, Output>)

type EqExpr<Context extends {}, Output extends Exclude<any, Function>> = ((context: Context) => Output) | Output

type NewContext<Context extends {}, NewProps extends string, Output> = Context & {
    [prop in NewProps]: Output
}

const isFn = (fn: any): fn is Function => typeof fn === "function"

export class DoContextImpl<URI extends string, Context extends {}> {
    constructor(private readonly monad: Monad<URI>, readonly context: HKT<URI, Context>) { }

    bind<Output, NewProp extends string>(prop: NewProp, value: DoExpr<URI, Context, Output>) {
        return new DoContextImpl<URI, NewContext<Context, NewProp, Output>>(this.monad, this.monad.chain(this.context, (context) => {
            const wrappedValue = isFn(value) ? value(context) : value
            return this.monad.map(wrappedValue, newValue => (<NewContext<Context, NewProp, Output>>{
                ...context,
                [prop]: newValue
            }))
        }))
    }
    
    with<Output, NewProp extends string>(prop: NewProp, valueOrFn: EqExpr<Context, Output>) {
        return new DoContextImpl<URI, NewContext<Context, NewProp, Output>>(this.monad, this.monad.map(this.context, (context) => (
            <NewContext<Context, NewProp, Output>>{
                ...context,
                [prop]: isFn(valueOrFn) ? valueOrFn(context) : valueOrFn
            }
        )))
    }

    yield<Output>(fn: (context: Context) => Output) {
        return this.monad.map(this.context, fn);
    }
}

// Monad 1 type defs
type DoExpr1<URI extends URIS, Context extends {}, Output> = Type<URI, Output> | ((context: Context) => Type<URI, Output>)

export type DoContext<URI extends URIS, Context extends {}> = {
    /**
     * Binds a property in the context to a wrapped value derived from the current context
     * @param prop the name of the property
     * @param value the wrapped value to be bound, or a function from the current context to a wrapped value to be bound
     */
    bind<Output, NewProp extends string>(prop: NewProp, value: DoExpr1<URI, Context, Output>):
        DoContext<URI, NewContext<Context, NewProp, Output>>

    /**
     * Assigns a property in the context to a value derived from the current context
     * @param prop the name of the property
     * @param fn a function from the current context to the value to be assigned
     */
    with<Output, NewProp extends string>(prop: NewProp, fn: EqExpr<Context, Output>): 
        DoContext<URI, NewContext<Context, NewProp, Output>>
        
    yield<Output>(fn: (context: Context) => Output): Type<URI, Context>
}

// Monad 2 type defs
type DoExpr2<URI extends URIS2, Context extends {}, A, Output> = Type2<URI, A, Output> | ((context: Context) => Type2<URI, A, Output>)

export type DoContext2<URI extends URIS2, Context extends {}, A> = {
    /**
     * Binds a property in the context to a wrapped value derived from the current context
     * @param prop the name of the property
     * @param value the wrapped value to be bound, or a function from the current context to a wrapped value to be bound
     */
    bind<Output, NewProp extends string, NewA>(prop: NewProp, value: DoExpr2<URI, Context, NewA, Output>):
        DoContext2<URI, NewContext<Context, NewProp, Output>, A | NewA>

    /**
     * Assigns a property in the context to a value derived from the current context
     * @param prop the name of the property
     * @param fn a function from the current context to the value to be assigned
     */
    with<Output, NewProp extends string>(prop: NewProp, fn: EqExpr<Context, Output>): 
        DoContext2<URI, NewContext<Context, NewProp, Output>, A>

    /**
     * Extracts a wrapped value from the context
     * @param fn a function from the current context to the value to be returned
     */
    yield<Output>(fn: (context: Context) => Output): Type2<URI, A, Context>
}

/**
 * Initialises a new "do" comprehesion over the specified monad with an empty context
 * @param monad the fp-ts Monad1 definition
 */
export function doOn<URI extends URIS>(monad: Monad1<URI>): DoContext<URI, {}>;
/**
 * Initialises a new "do" comprehesion over the specified monad with an empty context
 * @param monad the fp-ts Monad2 definition
 */
export function doOn<URI extends URIS2>(monad: Monad2<URI>): DoContext2<URI, {}, never>;
export function doOn<URI>(monad: any) {
    return <any> new DoContextImpl(monad, monad.of({}))
}