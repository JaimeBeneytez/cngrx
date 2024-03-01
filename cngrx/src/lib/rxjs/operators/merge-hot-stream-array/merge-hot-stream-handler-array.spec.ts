import 'zone.js/testing'; // zone-testing needs to be first import!
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { mergeHotStreamHandlerArray } from './merge-hot-stream-handler-array';

describe('mergeHotStreamHandlerArray(streamArray: (value: any) => Observable<any>[] ): Observable<any>', () => {
    let scheduler: TestScheduler;

    let mocks: any;
    let handlers: any;
    let transformations: any;
    let expectations: any;

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        });

        transformations = {
            multiply: (value: number) => {
                return value * 2;
            },
            prependString: (value: string) => {
                return `value: ${value}`;
            },
        };

        handlers = [
            (value: number) => of(value).pipe(map(transformations.multiply)),
            (value: string) => of(value).pipe(map(transformations.prependString)),
        ];

        mocks = {
            a: 1,
            b: 2,
            c: 3,
        };

        expectations = {
            e: 2,
            f: 'value: 1',
            g: 4,
            h: 'value: 2',
        };
    });

    describe('GIVEN an array of "(value) => Observables<any>"', () => {
        it('pipes the stream through all of them merging the observables returned by the functions in the array', () => {
            scheduler.run((helpers) => {
                const { hot, expectObservable } = helpers;
                const observable = hot('-a---b', mocks);

                expectObservable(observable.pipe(mergeHotStreamHandlerArray(handlers))).toBe(
                    '-(ef)(gh)-',
                    expectations
                );
            });
        });

        describe('WHEN the array is empty', () => {
            beforeEach(() => {
                handlers = [];
            });

            it('does not output anything', () => {
                scheduler.run((helpers) => {
                    const { hot, expectObservable } = helpers;
                    const observable = hot('-a---b', mocks);

                    expectObservable(observable.pipe(mergeHotStreamHandlerArray(handlers))).toBe(
                        '----------',
                        expectations
                    );
                });
            });
        });

        describe('WHEN the array is undefined', () => {
            beforeEach(() => {
                handlers = undefined;
            });

            it('does not output anything', () => {
                scheduler.run((helpers) => {
                    const { hot, expectObservable } = helpers;
                    const observable = hot('-a---b', mocks);

                    expectObservable(observable.pipe(mergeHotStreamHandlerArray(handlers))).toBe(
                        '----------',
                        expectations
                    );
                });
            });
        });

        describe('WHEN the array contains a value that is not an observable', () => {
            beforeEach(() => {
                handlers = [1];
            });

            it('ignores the handler', () => {
                scheduler.run((helpers) => {
                    const { hot, expectObservable } = helpers;
                    const observable = hot('-a---b', mocks);

                    expectObservable(observable.pipe(mergeHotStreamHandlerArray(handlers))).toBe(
                        '----------',
                        expectations
                    );
                });
            });
        });

        describe('WHEN the array contains a function that returns a value that is not an observable', () => {
            beforeEach(() => {
                handlers = [(value: any) => value];
            });

            it('ignores the handler', () => {
                scheduler.run((helpers) => {
                    const { hot, expectObservable } = helpers;
                    const observable = hot('-a---b', mocks);

                    expectObservable(observable.pipe(mergeHotStreamHandlerArray(handlers))).toBe(
                        '----------',
                        expectations
                    );
                });
            });
        });
    });
});
