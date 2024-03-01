import { Subscriber, merge, Observable, isObservable, Observer } from 'rxjs';
import { mergeAll } from 'rxjs/operators';
import { Action } from '../../../index';

const ERRORS = {
    HEADER: `
    MergeHotStreamHandlerArraySubscriber Error.

    `,
    NOT_A_FUNCTION: `
    Supplied handler ignored: It is not a function

    `,
    NOT_AN_OBSERVABLE: `
    Supplied handler ignored: It does not return an observable

    `,
};

type HotStreamHandler = (action: Action) => Observable<Action>;

class MergeHotStreamHandlerArraySubscriber extends Subscriber<Action> {
    private _handlers: HotStreamHandler[] = [];

    constructor(sub: Observer<Action>, effects: HotStreamHandler[]) {
        super(sub);
        this._handlers = effects || this._handlers;
    }

    public override _next(value: Action): void {
        const inner$ = merge(
            this._handlers
                .filter((handler: HotStreamHandler) => {
                    const condition = typeof handler === 'function';

                    if (!condition) {
                        console.warn(ERRORS.HEADER + ERRORS.NOT_A_FUNCTION, handler);
                    }

                    return condition;
                })
                .filter((handler: HotStreamHandler) => {
                    const condition = isObservable(handler(value));

                    if (!condition) {
                        console.warn(ERRORS.HEADER + ERRORS.NOT_AN_OBSERVABLE, handler);
                    }

                    return condition;
                })
                .map((handler: HotStreamHandler) => {
                    return handler(value);
                })
        ).pipe(mergeAll());

        inner$.subscribe({
            next: (v: any) => {
                this.destination.next(v);
            },
        });
    }
}

export const mergeHotStreamHandlerArray = (handlers: HotStreamHandler[]) => (source: Observable<any>) =>
    source.lift({
        call: (sub: Observer<Action>, s: Observable<Action>) => {
            s.subscribe(new MergeHotStreamHandlerArraySubscriber(sub, handlers));
        },
    });
