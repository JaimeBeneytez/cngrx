import { Observable } from 'rxjs';
import { Action } from '../action/action';
import { EffectConfiguration } from './effects-configuration';

export type Effect = (action: Action, config?: EffectConfiguration) => Observable<Action>;
