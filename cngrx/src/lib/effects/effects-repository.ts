import { of } from 'rxjs';
import { Repository } from '../repository/index';

export class EffectsRepository extends Repository<any> {
    constructor() {
        super({
            id: 'EffectsRepository',
            fallbackKey: 'default',
        });

        this.addByRecord({
            default: () => of({ type: 'VOID' }),
        });
    }
}
