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

/**
 * Initialises a new "do" comprehesion over the specified monad with an empty context
 * @param monad the fp-ts Monad1 definition
 */
export function doOn<URI extends URIS>(monad: Monad<URI>) {
    return new DoContextImpl(monad, monad.of({}))
}