import { TestBed } from "@angular/core/testing";
import { Subject, finalize, merge, of, take, takeUntil, tap } from "rxjs";
import { Actions } from "@ngrx/effects";
import { EFFECT_TYPE, State, StateConfig, StateModule, Action as A } from "../index";
import { Action } from "@ngrx/store";
import { MockStateDS, MOCK_STATE_ACTIONS, MockStateProvider } from "./mocks";

describe('ng-state. intergation tests', () => {

    let state: State<MockStateDS>;
    let provider: MockStateProvider;
    let actions: Action[];
    let _unsubscribe$: Subject<void>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StateModule],
        });

        const actions$ = TestBed.inject(Actions);
        _unsubscribe$ = new Subject<void>();
        state = TestBed.inject(State<MockStateDS>);
        provider = new MockStateProvider(state);
        actions = [];

        actions$.pipe(
            tap(action => actions.push(action)),
            takeUntil(_unsubscribe$)
        ).subscribe();

        const config: StateConfig<MockStateDS> = {
            state: {
                id: 'example',
                initialState: {
                    label: 'foo bar',
                    count: 0,
                },
                handlers: {
                    [MOCK_STATE_ACTIONS.SYN]: (s: MockStateDS, action: A) => s,
                    [MOCK_STATE_ACTIONS.ADD]: (s: MockStateDS, action: A) => {
                        s.count += action.payload.value;
                    },
                },
            },
            effects: [
                {
                    type: EFFECT_TYPE.PARALLEL,
                    causes: [MOCK_STATE_ACTIONS.SYN],
                    handlers: [(a, c) => of({ type: MOCK_STATE_ACTIONS.ACK })]
                },
                {
                    type: EFFECT_TYPE.ACTION,
                    causes: [MOCK_STATE_ACTIONS.ADD],
                    result: MOCK_STATE_ACTIONS.ADDED,
                },
            ],
        };

        state.configure(config);
    });

    afterEach(() => {
        state.destroy();
        _unsubscribe$.next();
        _unsubscribe$.complete();
    });

    describe('StateProvider', () => {

        describe('WHEN the state is initialized', () => {

            const countUpdates: number[] = [];
            const labelUpdates: string[] = [];

            beforeEach((done) => {

                merge(
                    provider.label$.pipe(tap(label => labelUpdates.push(label)), take(1)),
                    provider.count$.pipe(tap(count => countUpdates.push(count)), take(2))
                ).pipe(
                    finalize(() => done())
                ).subscribe();

                provider.add();
            });

            it('the selectors stream the initialState', () => {
                expect(countUpdates).toEqual([0, 1]);
                expect(labelUpdates).toEqual(['foo bar']);
            });
        });

        describe('WHEN the state is initialized', () => {

            const countUpdates: number[] = [];

            beforeEach((done) => {
                provider.count$.pipe(
                    take(2),
                    finalize(() => {
                        provider.count$.pipe(
                            tap(count => countUpdates.push(count)),
                            take(1),
                            finalize(() => done())
                        ).subscribe();
                    })
                ).subscribe();

                provider.add(5);
            });

            it('the selectors stream the last state value prior to the subscription to a selector', () => {
                expect(countUpdates).toEqual([5]);
            });
        });

        describe('WHEN the state is updated', () => {

            describe('the selectors stream the updated value', () => {

                const countUpdates: number[] = [];

                beforeEach((done) => {
                    provider.count$.pipe(
                        tap((count) => countUpdates.push(count)),
                        take(3),
                        finalize(() => done())
                    ).subscribe();

                    provider.add();
                    provider.add(2);
                });

                it('works', () => {
                    expect(countUpdates).toEqual([0, 1, 3]);
                });
            });
        });
    });

    describe('Effects', () => {

        describe('WHEN configured as action', () => {

            describe('AFTER the cause action is dispached', () => {

                beforeEach(() => {
                    provider.add();
                    provider.add(2);
                });

                it('triggers the resulting action with the same payload', () => {
                    expect(actions.map(a => a.type)).toContain(MOCK_STATE_ACTIONS.ADDED);
                });
            });
        });

        describe('WHEN configured as PARALLEL', () => {

            describe('AFTER the cause action is dispached', () => {

                beforeEach(() => {
                    provider.syn();
                });

                it('executes the effect function provided', () => {
                    expect(actions.map(a => a.type)).toContain(MOCK_STATE_ACTIONS.ACK);
                });
            });
        });
    });
});
