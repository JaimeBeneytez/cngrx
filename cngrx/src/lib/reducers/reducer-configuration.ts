import { Action } from "../action/action";

export type ReducerFunction<T> = (state: T, actionPayload: any) => void;

export interface ReducerConfiguration<T> {
    id: string;
    initialState: T;
    handlers: Record<string, (s: T, a: Action) => void>;
}
