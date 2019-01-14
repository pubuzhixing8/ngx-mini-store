import { Store } from './store';
import { TinyStatePlugin, TINY_STATE_PLUGINS } from './plugin';
import { Inject, SkipSelf, Optional, OnDestroy } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export type ContainerInstanceMap = Map<string, Store<any>>; // Map key：string，value：状态数据

/**
 * @internal
 */
export class RootContainer implements OnDestroy {
  /**
   * 数据流 数据是一个Map，k,v键值对，关键字->状态数据
   */
  private readonly _containers = new BehaviorSubject<ContainerInstanceMap>(
    new Map<string, Store<any>>()
  );
  private _plugins: TinyStatePlugin[];
  private _combinedStateSubscription: Subscription = new Subscription();

  constructor(
    @Optional()
    @Inject(TINY_STATE_PLUGINS)
    plugins: TinyStatePlugin[] | null,
    @SkipSelf()
    @Optional()
    rootContainer: RootContainer
  ) {
    if (rootContainer) {
      throw new Error('TinyState: Multiple instances of RootContainer found!');
    }
    this._plugins = Array.isArray(plugins) ? plugins : [];
    this._assignCombinedState(); // 最终调用handleNewState
  }

  private _assignCombinedState() {
    this._combinedStateSubscription = this._containers
      .pipe(switchMap(containers => this._getCombinedState(containers)))
      .pipe(
        map(states =>
          states.reduce(
            (acc, curr) => {
              acc[curr.containerName] = curr.state;
              return acc;
            },
            <{ [key: string]: any }>{}
          )
        )
      )
      .subscribe(c => {
        for (const plugin of this._plugins) {
          plugin.handleNewState('No Name', c);
        }
      });
  }

  /**
   * 合并数据流
   * 合并状态数据，把状态数据转换为这样的数据：{ containerName: string, state: any }，并且
   * 通过combineLatest合并成一个数据数据流，这样状态数据只有涉及更新，那么这边就会得到通知
   * @param containers 状态数据的Map
   */
  private _getCombinedState(containers: ContainerInstanceMap) {
    return combineLatest(
      ...Array.from(containers.entries()).map(([containerName, container]) => {
        return container.state$.pipe(map(state => ({ containerName, state })), tap((data) => {
        }));
      })
    );
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this._combinedStateSubscription.unsubscribe();
  }

  /**
   * @internal
   */
  registerContainer(container: Store<any>) {
    const containers = new Map(this._containers.value);
    if (containers.has(container.getContainerInstanceId())) {
      throw new Error(
        `TinyState: Container with duplicate instance ID found! ${container.getContainerInstanceId()}` +
        ` is already registered. Please check your getContainerInstanceId() methods!`
      );
    }
    containers.set(container.getContainerInstanceId(), container);
    this._containers.next(containers);
  }

  /**
   * @internal
   */
  unregisterContainer(container: Store<any>) {
    const containers = new Map(this._containers.value);
    containers.delete(container.getContainerInstanceId());
    this._containers.next(containers);
  }
}
