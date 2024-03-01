import { Subject, of } from 'rxjs';
import { concatAll, concatMap, filter, map, mergeAll, mergeMap, takeUntil } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { mergeHotStreamHandlerArray } from '../../rxjs/index';

import { Effect } from '../effect';
import { EFFECT_TYPE } from '../effect-type';
import { EffectConfiguration, EffectsConfiguration } from '../effects-configuration';
import { EffectsRepository } from '../effects-repository';

/******************************************************
 *
 * EffectsConfigurator
 *
 ******************************************************/

export class EffectsConfigurator {
    private _setupMethodMap: any = {
        [EFFECT_TYPE.SEQUENCE]: this._setUpSequentialEffect,
        [EFFECT_TYPE.PARALLEL]: this._setUpParallelEffect,
        [EFFECT_TYPE.ACTION]: this._setUpActionEffect,
    };

    private _effectsRepository: EffectsRepository;

    private _effect: any;
    private _effects: Effect[] = [];
    private _unsubscribe$: Subject<void> = new Subject<void>();

    constructor(effectsRepository: EffectsRepository, actions$: Actions, store: Store<any>) {
        this._effectsRepository = effectsRepository;

        this._effect = actions$.pipe(
            mergeHotStreamHandlerArray(this._effects),
            filter((action) => this._isAction(action))
        );

        this._effect.pipe(
            takeUntil(this._unsubscribe$)
        ).subscribe((action: any) => {
            store.dispatch(action);
        });
    }

    public addEffects(effectsConfig: EffectsConfiguration = []): any {
        effectsConfig.forEach((config) => {
            const method = this._setupMethodMap[config.type].call(this, config);
            this._effects.push(method);
        });
    }

    public destroy(): void {
        this._unsubscribe$.next();
        this._unsubscribe$.complete();
    }

    private _isAction(action: any): boolean {
        return action && action.type && typeof action.type === 'string';
    }

    private _setUpSequentialEffect(config: EffectConfiguration): Effect {
        return (action: any) =>
            of(action).pipe(
                filter((_action) => this._filterAction(_action, config)),
                concatMap((_action) =>
                    config.handlers?.map((handler: Effect | string) => {
                        const handlerFn = this._getHandler(handler, config);
                        return handlerFn(_action, config);
                    }) || []
                ),
                concatAll()
            );
    }

    private _setUpParallelEffect(config: EffectConfiguration): Effect {
        return (action) =>
            of(action).pipe(
                filter((_action) => this._filterAction(_action, config)),
                mergeMap((_action) =>
                    config.handlers?.map((handler: Effect | string) => {
                        const handlerFn = this._getHandler(handler, config);
                        return handlerFn(_action, config);
                    }) || []
                ),
                mergeAll()
            );
    }

    private _setUpActionEffect(config: EffectConfiguration): Effect {
        return (action) =>
            of(action).pipe(
                filter((_action) => this._filterAction(_action, config)),
                map((_action) => {
                    return {
                        type: config.result,
                        payload: _action['payload'],
                    };
                })
            );
    }

    private _filterAction(action: any, effectsConfig: EffectConfiguration): boolean {
        const isCause = effectsConfig.causes.indexOf(action.type) > -1;
        const isWildcard = effectsConfig.causes.indexOf('*') > -1;

        return isWildcard || isCause;
    }

    private _getHandler(handler: string | Effect, config: any): Effect {
        return typeof handler === 'function' ? (handler as Effect) : this._effectsRepository.get(handler);
    }
}
