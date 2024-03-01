import { createSelector, select } from '@ngrx/store';
import { Observable } from 'rxjs';

const ERROR = {
    PATH_SEGMENT_MISSING: `
    @jbt/cngrx Selector Error.
    path "#path" is not valid. property "#segment" is not defined
    `,
};

export class Selector {
    public static selectByPath(path: string): (source$: Observable<any>) => Observable<any> {
        const slices = path.split('.');
        const initialSelector = createSelector(
            // @ts-expect-error remove this ts-ignore, the error rose when moving to nx and upgrading to angular 17
            (state) => state[slices[0]],
            (state) => state
        );

        return select(
            slices.slice(1).reduce(
                (acc, current, index) =>
                    createSelector(acc, (state) => {
                        try {
                            return state[current];
                        } catch (e) {
                            throw new Error(
                                ERROR.PATH_SEGMENT_MISSING.replace('#path', path).replace('#segment', slices[index])
                            );
                        }
                    }),
                initialSelector
            )
        );
    }
}
