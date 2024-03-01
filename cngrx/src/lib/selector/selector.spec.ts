import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule, Store } from '@ngrx/store';
import { ProviderFactory } from '../state.module';
import { ReducersConfigurator } from '../reducers/index';
import { Selector } from './selector';

/******************************************************
 *
 * Selector Test Suite
 *
 ******************************************************/

describe('Selector', () => {
    let actions$: Observable<any>;
    let result$: Observable<any>;
    let store: Store<any>;
    let reducersConfigurator: ReducersConfigurator<any>;
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
                provideMockActions(() => actions$),
            ],
        });

        store = TestBed.inject(Store);
        reducersConfigurator = TestBed.inject(ReducersConfigurator);

        select = (path) => store.pipe(Selector.selectByPath(path));
    });

    describe('[ .selectByPath( path: striog ): Observable ]', () => {
        describe('WHEN the path exists', () => {

            beforeEach(() => {
                reducersConfigurator.addReducers({
                    id: 'foo',
                    initialState: {
                        baz: 'foo',
                    },
                    handlers: {
                        updateBaz: (s, action) => {
                            s.baz = action.payload;
                        },
                    },
                });

                result$ = select('foo.baz');
            });

            describe('AFTER the state has been configured', () => {

                it('returns an observable of the slice of the state provided by the path', () => {

                    result$.subscribe(v => {
                        expect(v).toEqual('foo');
                    });
                });
            });


            describe('WHEN the selected path is updated', () => {

                it('The new value is streamed throught the observable', () => {

                    const results: string[] = [];
                    result$.subscribe(v => results.push(v));
                    store.dispatch({ type: 'updateBaz', payload: 'bar' });

                    expect(results).toEqual(['foo', 'bar']);
                });
            });
        });

        describe('WHEN the path has a non existing segment ', () => {
            let value: any;

            beforeEach(() => {
                reducersConfigurator.addReducers({
                    id: 'foo',
                    initialState: {
                        baz: 'foo',
                    },
                    handlers: {
                        add: (s, action) => {
                            s = {
                                ...s,
                                [action.payload.id]: action.payload.name
                            };

                            console.log(s);

                        },
                    },
                });
            });

            describe('AND the missing segment is the leaf', () => {
                beforeEach((done) => {
                    select('foo.o').subscribe((v) => {
                        value = v;
                        done();
                    });
                });

                it('returns an observable that resolves an undefined value', () => {
                    expect(value).toEqual(undefined);
                });

            });

            describe('AND the missing segment is not the leaf', () => {
                let error: any;

                beforeEach(() => {
                    select('foo.non-existing.o')
                        .pipe(
                            catchError((e) => {
                                error = e;
                                return EMPTY;
                            })
                        )
                        .subscribe();
                });

                it('throws an error in the observable stream', () => {
                    expect(error).toBeDefined();
                });
            });
        });
    });
});
