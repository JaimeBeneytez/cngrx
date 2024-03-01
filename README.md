# @jbt/cngrx

WIP State Management library for angular applications.

This is a configurable wrapper for [ngrx](https:ngrx.io) rxjs redux implementation for angular.
Ngrx is a marvellous library for angular applications state management, but I found to main issues while using it:

- It couples the application that uses it to the library
- Requires to write much boilerplate

This library provides a way to use ngrx, configuring decoupled slices of the app state with a module definition per state slice:
I ues to divide my app in features and each feature is a state slice.

```typescript

const AppState = {
    auth: { // Auth is a slice of the state
        userId: 'foo',
        displayName: 'Jaime'
    },
    featureExample: { // Feature A is a slice of the state
        label: 'bar',
        count: 3
    }
};

const config: StateConfig<ExampleStateDS> = {
    state: {
        id: 'featureExample', // id for the slice of the state
        initialState: { // initial state 
            label: 'foo bar',
            count: 0,
        },
        handlers: {
            // Reducer for 'multiply' Action
            'multiply': (s: MockStateDS, action: Action) => { 
                // changing the state is just modifying it inside the reducer
                // this is a bit of black magic that should be refactored
                s.count = s.count * actions.payload.value
            },
            // Reducer for 'add' Action
            'add': (s: MockStateDS, action: Action) => {
                // changing the state is just modifying it inside the reducer
                // this is a bit of black magic that should be refactored
                s.count += action.payload.value;
            },
        },
    },
    effects: [
        {
            type: EFFECT_TYPE.PARALLEL,
            causes: ['add'], // action which triggers the effect
            handlers: [(a: Action) => {
                // perform sync or async operation
                return of({ type: 'added' }) // return Observable<Action>
            }]
        },
        {
            type: EFFECT_TYPE.ACTION,
            causes: ['add'], // action which triggers the effect
            result: 'multiplied' // action dispatched as an effect with the same payload
        },
    ],
};
```

# Use

## Install

```bash
npm i --save-dev @jbt/cgnrx
```

## Set up

1. Import the StateModule from where the state is going to be configured and/or used

```typescript
import { StateModule, State } from '@jbt/cngrx'; 

@NgModule({
    imports: [StateModule],
    providers: [
        {
            provide: UserStateProvider,
            useFactory: UserStateProviderFactory.createUserStateProvider,
            deps: [State],
        },
    ],
})
export class UserStateModule {}

export class UserStateProviderFactory {
    public static createUserStateProvider(state: State): UserStateProvider {
        return new UserStateProvider(state);
    }
}
```

2. Provide the configuration for the state:

```typescript
import { State, StateConfig } from '@jbt/cngrx'; 

export const userStateConfig: StateConfig = {
    state: {
        id: 'app',
        children: [
            {
                id: 'user',
                initialState: {
                    firstName: '',
                    lastName: '',
                },
            },
        ],
    },
};

export class UserStateProvider {
    private _state: State;

    constructor(state: State) {
        this._state = state;

        state.configure(userStateConfig);
    }
}
```

## Reducers.

### Add reducer handlers to update the state when an action occurs

We are going to add 2 reducer handlers and configure them to act on the slice of the state we want to.

A reducer handler is a function that receives the current state and the action triggered.
It will be called when the actions we are mapping to them are fired.
The value they return will override the slice of the state.

In the following example:

-   `set` handler will be triggered when `SET.USER` action is fired.
-   `patch` handler will be triggered when `PATCH.USER` action is fired.

Both will act on `app.user` slice of the state.

There is also a reducers repository which holds the collection of reducer handlers the application uses.
The reducers configured need to be added to the store before the action is triggered, otherwise you'll get a nice message in your console and they will be ignored.

```typescript
import { State, StateConfig } from '@jbt/cngrx'; 

export const userStateConfig: StateConfig = {
    state: {
        id: 'app',
        children: [
            {
                id: 'user',
                initialState: {
                    firstName: '',
                    lastName: '',
                },
                handlers: {
                    'SET.USER': 'set',
                    [PATCH.USER]: (state, action) => {
                        state.firstName = action.payload.firstName;
                        state.lastName = action.payload.lastName;
                    }
                },
            },
        ],
    },
};

export class UserStateProvider {
    private _state: State;

    constructor(state: State) {
        this._state = state;

        state.addReducerHandlers({
            set: (state, action) => action.payload,
            patch: (state, action) => action.payload,
        });

        state.configure(userStateConfig);
    }
}
```

## Effects

### Add effects so they are fired after the reducers have update the state.

An effect is the mechanism that when a **cause** action is dispatched triggers:

-   a **result** action
-   a calls to an **effectHandler** that will resolve in an action.

the effect configuration have :

-   **causes: string[] :** List of actions that cause the effect
-   **type: EFFECT_TYPE :** ACTION | PARALLEL | SEQUENCE.
    -   **ACTION :** The effect triggers another action as a result bypssing the payload of the initial one.
    -   **PARALLEL :** The effect calls the handlers that will return observables in parallel.
    -   **SEQUENCE :** The effect calls the handlers that will return observables in sequence.
-   **handlers :** The handlers assigned to that effect

```typescript
import { State, StateConfig, EFFECT_TYPE } from '@jbt/cngrx'; 

export const userStateConfig: StateConfig = {
    state: {
        ...
    },
    effects: [{
        causes: [ 'SET.USER' ],
        type: EFFECT_TYPE.ACTION,
        result: [
            'VOID'
        ]
    },{
        causes: [ 'SET.USER' ],
        type: EFFECT_TYPE.SEQUENCE,
        handlers: [
            'delayed',
            'immediate',
            ( state: State, action: Action ) => {
                return of({ type: 'VOID' })
            }
        ]
    }]
};

export class UserStateProvider {

    private _state: State;

    constructor(state: State) {

        this._state = state;

        state.addEffectHandlers({
            'delayed': ( state, action ) => of({ type: 'VOID' }).pipe( delay(1000)),
            'immediate': ( state, action ) => of({ type: 'VOID' }),
        });

        state.configure(userStateConfig);
    }
}
```
