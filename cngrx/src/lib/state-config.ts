import { EffectsConfiguration } from './effects/index';
import { ReducerConfiguration } from './reducers/index';

export interface StateConfig<T> {
    state?: ReducerConfiguration<T>;
    effects?: EffectsConfiguration;
}
