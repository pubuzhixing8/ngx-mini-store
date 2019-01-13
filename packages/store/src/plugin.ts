import { InjectionToken } from '@angular/core';

export abstract class TinyStatePlugin {
  abstract handleNewState(state: Readonly<object>): void;
}
/**
 * 提供给provide
 * TINY_STATE_PLUGINS is used as a multi provider in Angular.
 * 通过 关键字：`TINY_STATE_PLUGINS`获取依赖
 */
export const TINY_STATE_PLUGINS = new InjectionToken<Plugin>('TINY_STATE_PLUGINS');
