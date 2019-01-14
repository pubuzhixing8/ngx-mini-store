
import { Observable, Observer, BehaviorSubject, from, of, PartialObserver, Subscription } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { META_KEY, StoreMetaInfo } from './types';
import * as helpers from './helpers';
import { Optional, Inject, Injectable } from '@angular/core';
import { RootContainer } from './root_container';

interface Action {
    type: string;
    payload?: any;
}

let containerId = -1;

@Injectable()
export class Store<TState extends Object> implements Observer<TState> {

    [key: string]: any;

    public state$: BehaviorSubject<TState>;

    private _defaultContainerInstanceId = `${this._getClassName()}@${++containerId}`;


    constructor(
        @Optional()
        @Inject(RootContainer)
        private _rootContainer: RootContainer | null
    ) {
        this.state$ = new BehaviorSubject<TState>(Object.assign(
            { actionName: `init_${this._defaultContainerInstanceId}`}, this.getInitialState()));
        if (this._rootContainer) {
            this._rootContainer.registerContainer(this);
        }
    }

    get snapshot() {
        return this.state$.getValue();
    }

    public dispatch(type: string, payload?: any): Observable<any> {
        const result = this._dispatch(type, payload);
        result.subscribe();
        return result;
    }

    private _dispatch(type: string, payload?: any): Observable<any> {
        const meta = this[META_KEY] as StoreMetaInfo;
        if (!meta) {
            throw new Error(`${META_KEY} is not found, current store has not action`);
        }
        const actionMeta = meta.actions[type];
        if (!actionMeta) {
            throw new Error(`${type} is not found`);
        }
        let result: any = payload ? actionMeta.originalFn.call(this, payload, this.snapshot)
            : actionMeta.originalFn.call(this, this.snapshot);

        if (result instanceof Promise) {
            result = from(result);
        }

        if (result instanceof Observable) {
            result = result.pipe(map(r => r));
        } else {
            result = Observable.create((observer: Observer<any>) => {
                observer.next({});
            });
            // result = of({});
        }
        return result.pipe(shareReplay());
    }

    // select<T>(selector: (state: TState) => T): Observable<T>;
    // select<T>(selector: string, options?: string): Observable<T>;
    select(selector: any): Observable<any> {
        const selectorFn = helpers.getSelectorFn(selector);
        return this.state$.pipe(
            map(selectorFn),
            distinctUntilChanged()
        );
    }

    next(state?: TState) {
        this.state$.next(state || this.snapshot);
    }

    error(error: any) {
        this.state$.error(error);
    }

    complete() {
        this.state$.complete();
    }

    subscribe(next?: (value: TState) => void, error?: (error: any) => void, complete?: () => void): Subscription {
        return this.state$.subscribe(next, error, complete);
    }

    getState(): TState {
        return this.snapshot;
    }

    setState(state: TState) {
        this.next(state);
    }

    /**
     * You can override this method if you want to give your container instance a custom id.
     * The returned id must be unique in the application.
     */
    getContainerInstanceId(): string {
        return this._defaultContainerInstanceId;
    }

    private _getClassName(): string {
        return this.constructor.name;
    }
}
