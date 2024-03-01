// import { TestBed } from '@angular/core/testing';
// import { Actions, EffectsModule } from '@ngrx/effects';
// import { provideMockActions } from '@ngrx/effects/testing';
// import { Action, Store, StoreModule } from '@ngrx/store';
// import { Observable, Subject, of } from 'rxjs';
// import { ProviderFactory } from '../../../state.module';
// import { EffectsConfigurator } from './effects-configurator';
// import { EFFECT_TYPE } from '../effect-type';
// import { delay, concat, throttleTime, tap } from 'rxjs/operators';
// import { TestScheduler } from 'rxjs/testing';

/******************************************************
 *
 * EffectsConfigurator Test Suite
 *
 ******************************************************/

// Need to re-write these tests as jest-marbles are not working as jasmine-marbles
// Try to use jest-marbles with rxjs-marbles
// or test wiithout marbles at all

it('dummy', () => {
    expect(true).toBe(true);
});

// xdescribe('EffectsConfigurator', () => {
//     let actions$: Observable<Action>;
//     let actions: any;
//     let effects$: Observable<any>;
//     let expectation: any;
//     let effectsConfigurator: EffectsConfigurator;
//     let scheduler: TestScheduler;
//     let store: Store<any>;
//
//     beforeEach(() => {
//         actions = {
//             a: { type: 'foo', payload: 1 },
//             b: { type: 'bar', payload: 1 },
//             c: { type: 'baz', payload: 1 },
//             d: { type: 'doo', payload: 1 },
//         };
//
//         actions$ = new Subject<Action>();
//
//         scheduler = new TestScheduler((actual, expected) => {
//             expect(actual).toEqual(expected);
//         });
//
//         TestBed.configureTestingModule({
//             imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])],
//             providers: [
//                 {
//                     provide: EffectsConfigurator,
//                     useFactory: ProviderFactory.createEffectsConfigurator,
//                     deps: [Actions, Store],
//                 },
//                 provideMockActions(() => actions$),
//             ],
//         });
//
//         store = TestBed.inject(Store);
//         effectsConfigurator = TestBed.inject(EffectsConfigurator);
//         effects$ = effectsConfigurator['_effect'];
//     });
//
//     describe('[ .addEffects( configuration: EffectsConfiguration ): void ]', () => {
//         describe('EffectsConfiguration', () => {
//             describe('.causes: the action type that causes the effect', () => {
//                 beforeEach(() => {
//                     effectsConfigurator.addEffects([
//                         {
//                             type: EFFECT_TYPE.ACTION,
//                             causes: ['foo'],
//                             result: 'bar',
//                         },
//                         {
//                             type: EFFECT_TYPE.ACTION,
//                             causes: ['bar'],
//                             result: 'baz',
//                         },
//                     ]);
//                 });
//
//                 describe('WHEN the configured action is triggered', () => {
//
//
//                     fit('runs the effect', () => {
//
//                         scheduler.run(({ hot, cold, expectObservable, flush }) => {
//                             actions$ = hot('--a-a--', actions);
//                             expectation = cold('--b-b', actions);
//
//                             expectObservable(effects$).toBe(expectation);
//                         });
//                     });
//
//                     // fit('runs the effect', () => {
//                     //     scheduler.run(({ hot, cold, expectObservable, flush }) => {
//                     //         hot('--a-a--', actions).pipe(
//                     //             tap(a => {
//                     //                 console.log('a', a);
//                     //                 actions$.next(actions[a]);
//                     //             })
//                     //         );
//                     //
//                     //         expectation = cold('--b-b', actions);
//                     //         expectObservable(effects$).toBe('--b-b', actions);
//                     //     });
//                     // });
//
//                     // fit('dummy', () => {
//                     //     scheduler.run((helpers) => {
//                     //         debugger;
//                     //         const { cold, time, expectObservable, expectSubscriptions } = helpers;
//                     //         const e1 = cold(' -a--b--c---|');
//                     //         const e1subs = '  ^----------!';
//                     //         const t = time('   ---|       '); // t = 3
//                     //         const expected = '-a--b--c---|';
//                     //
//                     //         expectObservable(e1).toBe(expected);
//                     //         // expectSubscriptions(e1.subscriptions).toBe(e1subs);
//                     //     });
//                     // });
//
//                 });
//
//                 describe('WHEN a different actions than the configured action is triggered', () => {
//                     // beforeEach(() => {
//                     //     actions$ = hot('--b-a--', actions);
//                     //     expectation = cold('--c-b', actions);
//                     // });
//                     //
//                     // it('DOES NOT run the effect', () => {
//                     //     expect(effects$).toBeObservable(expectation);
//                     // });
//                 });
//
//                 describe('WHEN * is assigned to an effect', () => {
//                     // beforeEach(() => {
//                     //     effectsConfigurator.addEffects([
//                     //         {
//                     //             type: EFFECT_TYPE.ACTION,
//                     //             causes: ['*'],
//                     //             result: 'doo',
//                     //         },
//                     //     ]);
//                     //
//                     //     actions$ = hot('--b---a-', actions);
//                     //     expectation = cold('--(cd)(bd)', actions);
//                     // });
//                     //
//                     // it('it will be fired for all actions', () => {
//                     //     expect(effects$).toBeObservable(expectation);
//                     // });
//                 });
//             });
//
//             describe('.result: the action type that will be triggered by the effect', () => {
//                 // beforeEach(() => {
//                 //     effectsConfigurator.addEffects([
//                 //         {
//                 //             type: EFFECT_TYPE.ACTION,
//                 //             causes: ['foo'],
//                 //             result: 'bar',
//                 //         },
//                 //         {
//                 //             type: EFFECT_TYPE.ACTION,
//                 //             causes: ['bar'],
//                 //             result: 'baz',
//                 //         },
//                 //     ]);
//                 // });
//
//                 describe('WHEN the configured action is triggered', () => {
//                     // beforeEach(() => {
//                     //     actions$ = hot('--b-a--', actions);
//                     //     expectation = cold('--c-b', actions);
//                     // });
//                     //
//                     // it('runs the effect ( Only in EFFECT_TYPE.ACTION )', () => {
//                     //     expect(effects$).toBeObservable(expectation);
//                     // });
//                 });
//             });
//
//             describe('type: EFFECT_TYPE.ACTION', () => {
//                 describe('WHEN the "cause" action is triggered the "result" action is triggered by the effect', () => {
//                     // beforeEach(() => {
//                     //     effectsConfigurator.addEffects([
//                     //         {
//                     //             causes: ['foo'],
//                     //             type: EFFECT_TYPE.ACTION,
//                     //             result: 'bar',
//                     //         },
//                     //     ]);
//                     //
//                     //     actions$ = hot('--a-a--', actions);
//                     //     expectation = cold('--b-b', actions);
//                     // });
//                     //
//                     // it('fires the action configured as result', () => {
//                     //     expect(effects$).toBeObservable(expectation);
//                     // });
//                 });
//             });
//
//             describe('type: EFFECT_TYPE.SEQUENCE', () => {
//                 // describe('WHEN the "cause" action is triggered ', () => {
//                 //     describe('the handlers assigned', () => {
//                 //         beforeEach(() => {
//                 //             effectsConfigurator.addEffects([
//                 //                 {
//                 //                     causes: ['foo'],
//                 //                     type: EFFECT_TYPE.SEQUENCE,
//                 //                     handlers: [
//                 //                         () => {
//                 //                             return of(actions.b).pipe(delay(10, scheduler));
//                 //                         },
//                 //                         () => {
//                 //                             return of(actions.a).pipe(delay(20, scheduler));
//                 //                         },
//                 //                     ],
//                 //                 },
//                 //             ]);
//                 //
//                 //             actions$ = hot('--a---', actions);
//                 //             expectation = cold('---b-a', actions);
//                 //         });
//                 //
//                 //         it('are runned in sequence ( waiting for the observable returned by the previous is completed )', () => {
//                 //             expect(effectsConfigurator['_effect']).toBeObservable(expectation);
//                 //         });
//                 //     });
//                 // });
//             });
//
//             describe('type: EFFECT_TYPE.PARALLEL', () => {
//                 // describe('WHEN the "cause" action is triggered ', () => {
//                 //     beforeEach(() => {
//                 //         effectsConfigurator.addEffects([
//                 //             {
//                 //                 causes: ['foo'],
//                 //                 type: EFFECT_TYPE.PARALLEL,
//                 //                 handlers: [
//                 //                     () => {
//                 //                         return of(actions.b).pipe(delay(10, scheduler));
//                 //                     },
//                 //                     () => {
//                 //                         return of(actions.a).pipe(delay(10, scheduler));
//                 //                     },
//                 //                 ],
//                 //             },
//                 //         ]);
//                 //
//                 //         actions$ = hot('--a---', actions);
//                 //         expectation = cold('---(ba)', actions);
//                 //     });
//                 //
//                 //     it('the handlers assigned are runned in parrallel( not waiting for the observable returned by the previous is completed )', () => {
//                 //         expect(effectsConfigurator['_effect']).toBeObservable(expectation);
//                 //     });
//                 // });
//             });
//         });
//     });
//});
