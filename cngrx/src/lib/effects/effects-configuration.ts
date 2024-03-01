import { EFFECT_TYPE } from './effect-type';
import { Effect } from './effect';

export type EffectsConfiguration = EffectConfiguration[];

export interface EffectConfiguration {
    type: EFFECT_TYPE;
    causes: string[];
    result?: string;
    handlers?: Effect[];
}
