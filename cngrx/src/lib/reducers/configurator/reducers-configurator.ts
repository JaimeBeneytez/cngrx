import { produce } from 'immer';
import { Store } from '@ngrx/store';
import { ReducerConfiguration } from '../reducer-configuration';
import { Action } from '../../index';

export class ReducersConfigurator<T> {

    private _store: Store<T>;
    private _configurations: Record<string, ReducerConfiguration<T>> = {};

    constructor(store: Store<T>) {
        this._store = store;
    }

    public addReducers(config: ReducerConfiguration<T>): void {
        this._configurations[config.id] = config;
        this._addReducer(config);
    }

    private _addReducer(reducerConfig: ReducerConfiguration<T>): void {

        // @ts-expect-error remove this ts-ignore, the error rose when moving to nx and upgrading to angular 17
        this._store.addReducer(reducerConfig.id, this._createReducerFn(reducerConfig));
    }

    private _createReducerFn(config: ReducerConfiguration<T>): (state: T, actionPayload: any) => T {
        return (state: T, action) => this._mainReducer(state, action, config);
    }

    private _mainReducer(state: T, action: Action, config: ReducerConfiguration<T>): T {
        state = state || config.initialState;

        // @ts-expect-error remove this ts-ignore, the error rose when moving to nx and upgrading to angular 17
        const handler = config.handlers[action.type];
        if (!handler) {
            return state;
        }

        return produce(state, (draft) => {
            handler(draft, action);
        });

    }
}
