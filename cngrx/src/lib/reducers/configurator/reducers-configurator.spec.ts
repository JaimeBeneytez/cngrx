import { Observable, ReplaySubject } from 'rxjs';

import { TestBed } from '@angular/core/testing';

import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { ProviderFactory } from '../../state.module';
import { Selector } from '../../selector/selector';
import { ReducersConfigurator } from './reducers-configurator';

describe('ReducersConfigurator', () => {
    let store: Store<any>;
    let reducersConfigurator: ReducersConfigurator<any>;
    let causeActions: ReplaySubject<any>;
    let select: (s: string) => Observable<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot({})],
            providers: [
                {
                    provide: ReducersConfigurator,
                    useFactory: ProviderFactory.createReducersConfigurator,
                    deps: [Store],
                },
                provideMockActions(() => causeActions),
            ],
        });

        causeActions = new ReplaySubject(1);
        store = TestBed.inject(Store);
        reducersConfigurator = TestBed.inject(ReducersConfigurator);
        select = (path) => store.pipe(Selector.selectByPath(path));
    });

    describe('[ .addReducers(config: ReducerConfiguration): void ]', () => {
        describe('WHEN passing a leave ( State without children )', () => {
            describe('ReducerConfiguration.initialState', () => {
                describe('WHEN provided', () => {
                    beforeEach(() => {
                        reducersConfigurator.addReducers({
                            id: 'foo',
                            initialState: {
                                bar: 'baz',
                            },
                            handlers: {},
                        });
                    });

                    it('initialises the state with it', (done) => {
                        store.subscribe((state) => {
                            expect(state).toEqual({
                                foo: {
                                    bar: 'baz',
                                },
                            });
                            done();
                        });
                    });
                });
            });

            describe('ReducerConfiguration.handlers', () => {
                describe('WHEN provided', () => {
                    beforeEach(() => {
                        reducersConfigurator.addReducers({
                            id: 'foo',
                            initialState: {
                                bar: 'baz',
                            },
                            handlers: {
                                SomeAction: (state) => {
                                    state.bar = 42;
                                },
                            },
                        });

                        store.dispatch({
                            type: 'SomeAction',
                            payload: {},
                        });
                    });

                    it('invokes the handlers assigning their result to the state', (done) => {
                        select('foo').subscribe((state) => {
                            expect(state).toEqual({ bar: 42 });
                            done();
                        });
                    });
                });
            });
        });
    });
});
