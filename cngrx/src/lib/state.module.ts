import { of } from 'rxjs';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Actions, EffectsModule, EffectSources } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { State } from './state';
import { ReducersConfigurator } from './reducers/index';
import { EFFECT_TYPE, EffectsConfigurator, EffectsRepository } from './effects/index';

export enum STATE_ACTIONS {
    DESTROY = 'STATE_ACTIONS.DESTROY',
}

export enum APP_LIFECYCLE_EVENTS {
    APP_INITIALISED = 'APP_LIFECYCLE_EVENTS.APP_INITIALISED',
}

export class ProviderFactory {

    public static createState<T>(
        store: Store,
        reducer: ReducersConfigurator<T>,
        effectsConfigurator: EffectsConfigurator,
        effectsRepository: EffectsRepository
    ): State<T> {
        return new State<T>(store, reducer, effectsConfigurator, effectsRepository);
    }

    public static createReducersConfigurator<T>(store: Store<T>): ReducersConfigurator<T> {
        return new ReducersConfigurator(store);
    }

    public static createEffectsConfigurator(
        actions$: Actions,
        store: Store<any>,
        effectRepository: EffectsRepository
    ): EffectsConfigurator {
        return new EffectsConfigurator(effectRepository, actions$, store);
    }

    public static initialise(state: State<void>, effectsConfigurator: EffectsConfigurator): () => void {

        effectsConfigurator.addEffects([{
            type: EFFECT_TYPE.PARALLEL,
            causes: [STATE_ACTIONS.DESTROY],
            handlers: [() => {
                localStorage.clear();
                location.reload();
                return of({});
            }]
        }]);

        return () => {
            state.dispatch(APP_LIFECYCLE_EVENTS.APP_INITIALISED);
        };
    }
}

@NgModule({
    imports: [StoreModule.forRoot({}), EffectsModule.forRoot([])],
    providers: [
        {
            provide: State,
            useFactory: ProviderFactory.createState,
            deps: [Store, ReducersConfigurator, EffectsConfigurator, EffectsRepository],
        },
        {
            provide: ReducersConfigurator,
            useFactory: ProviderFactory.createReducersConfigurator,
            deps: [Store],
        },
        {
            provide: EffectsConfigurator,
            useFactory: ProviderFactory.createEffectsConfigurator,
            deps: [Actions, Store, EffectSources],
        },
        EffectsRepository,
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: ProviderFactory.initialise,
            deps: [State, EffectsConfigurator]
        }
    ],
})
export class StateModule { }
