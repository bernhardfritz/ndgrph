type NullaryFunction<T> = () => T;
type UnaryFunction<T, U> = (t: T) => U;
type BinaryFunction<T, U, V> = (t: T, u: U) => V;
type TernaryFunction<T, U, V, W> = (t: T, u: U, v: V) => W;

type MappedParameters<T> = { [P in keyof T]: NullaryFunction<T[P] | undefined> | undefined };

abstract class BaseFunctionNode<T extends (...args: any[]) => any> {
    readonly inputs: MappedParameters<Parameters<T>>;
    readonly output: NullaryFunction<ReturnType<T> | undefined>;

    constructor(f: T) {
        this.inputs = new Array(f.length) as unknown as MappedParameters<Parameters<T>>;
        this.output = () => {
            if ((this.inputs as unknown as Array<any>).indexOf(undefined) !== -1) {
                return undefined;
            }
            const args = (this.inputs as unknown as Array<any>).map(input => input());

            return args.indexOf(undefined) !== -1
                ? undefined
                : f(...args);
        };
    }
}

export class NullaryFunctionNode<T> extends BaseFunctionNode<NullaryFunction<T>> {}
export class UnaryFunctionNode<T, U> extends BaseFunctionNode<UnaryFunction<T, U>> {}
export class BinaryFunctionNode<T, U, V> extends BaseFunctionNode<BinaryFunction<T, U, V>> {}
export class TernaryFunctionNode<T, U, V, W> extends BaseFunctionNode<TernaryFunction<T, U, V, W>> {}
