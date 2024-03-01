import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { StateConfig } from './state-config';
import { ReducerConfiguration, ReducersConfigurator } from './reducers/index';
import { EffectsConfiguration, EffectsConfigurator, EffectsRepository } from './effects/index';
import { Selector } from './selector/index';

export class State<T> {

    private _store: Store<any>;
    private _reducersConfigurator: ReducersConfigurator<T>;
    private _effectsConfigurator: EffectsConfigurator;
    private _effectsRepository: EffectsRepository;

    // This is highliy insecute and should be removed
    // @TODO find another way to allow offline mode
    // private _cachedState: any;
    // private _unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        store: Store<any>,
        reducersConfigurator: ReducersConfigurator<T>,
        effectsConfigurator: EffectsConfigurator,
        effectsRepository: EffectsRepository
    ) {
        this._store = store;
        this._reducersConfigurator = reducersConfigurator;
        this._effectsConfigurator = effectsConfigurator;
        this._effectsRepository = effectsRepository;

        // This is highliy insecute and should be removed
        // @TODO find another way to allow offline mode
        // this._setupStateCache();
    }

    public configure(config: StateConfig<T>): void {

        if (config.state) {

            // This is highliy insecute and should be removed
            // @TODO find another way to allow offline mode
            // if (config.state.cache === STATE_CACHE.ENABLED) {
            //     const cachedState = this._cachedState[config.state.id];
            //     config.state.initialState = cachedState || config.state.initialState;
            // }

            this.configureReducers(config.state);
        }

        if (config.effects) {
            this.configureEffects(config.effects);
        }
    }

    public configureReducers(config: ReducerConfiguration<T>): void {
        this._reducersConfigurator.addReducers(config);
    }

    public configureEffects(config: EffectsConfiguration): void {
        this._effectsConfigurator.addEffects(config);
    }

    public addEffectHandlers(effectsMap: any): void {
        this._effectsRepository.addByRecord(effectsMap);
    }

    public dispatch(type: string, payload?: any): void {
        this._store.dispatch({
            type,
            payload,
        });
    }

    public select(path: string): Observable<any> {
        return this._store.pipe(Selector.selectByPath(path));
    }

    public destroy(): void {
        this._effectsConfigurator.destroy();
    }

    // This is highliy insecute and should be removed
    // @TODO find another way to allow offline mode
    // private _setupStateCache(): void {
    //     this._cachedState = JSON.parse(localStorage.getItem('state') || '{}');
    //
    //     this._store.pipe(
    //         debounceTime(1000),
    //         takeUntil(this._unsubscribe$),
    //     ).subscribe(s => {
    //         localStorage.setItem('state', JSON.stringify(s));
    //     });
    // }
}
