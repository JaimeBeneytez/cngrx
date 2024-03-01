import { Observable } from "rxjs";
import { State } from "../state";
import { MockStateDS } from "./mock-state.ds";
import { MOCK_STATE_ACTIONS } from "./mock-state-actions";

export class MockStateProvider {
    public label$: Observable<string>;
    public count$: Observable<number>;

    private _state: State<MockStateDS>;

    constructor(state: State<MockStateDS>) {
        this._state = state;
        this.count$ = this._select('count');
        this.label$ = this._select('label');
    }

    public add(value = 1): void {
        this._dispatch(MOCK_STATE_ACTIONS.ADD, { value });
    }

    public syn(): void {
        this._dispatch(MOCK_STATE_ACTIONS.SYN, {});
    }

    private _dispatch(type: string, payload: any): void {
        this._state.dispatch(type, payload);
    }

    private _select(path: string): Observable<any> {
        return this._state.select(`example.${path}`);
    }
}
