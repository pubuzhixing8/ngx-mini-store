import { META_KEY } from './types';
import * as helpers from './helpers';
import { from, Observable, Observer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface DecoratorActionOptions {
    type: string;
    payload?: any;
}

/**
 * Decorates a method with a action information.
 * 修改方法
 * 1.调用原方法
 * 2.返回数据流：单播->多播（非Observable通过操作符改为Observable）
 * 3.自动订阅
 * 4.返回值是Observable类型的数据流
 */
export function Action(action?: DecoratorActionOptions) {
    return function (target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
        // console.log(`target：${target}，name: ${name}，descriptor: ${descriptor}`);
        if (helpers.isFunction(descriptor.value)) {
            const originalFn = descriptor.value;
            descriptor.value = function (...args: any[]) {
                this.snapshot.actionName = name;
                let result = originalFn.call(this, ...args);
                result = _dispatch(result);
                result.subscribe(() => {
                });
                return result;
            };

            const metadata = helpers.findAndCreateStoreMetadata(target);
            metadata.actions[name] = {
                originalFn: originalFn,
                type: name,
                functionName: name
            };
        } else {
            throw new Error(`action decorator must be used on function.`);
        }
    };
}

/**
 * Decorates a method with a action information.
 * 装饰器方法 标识修改数据的行为，并且针对方法做一些修改
 * 1.调用原方法
 * 2.返回数据流：单播->多播（非Observable通过操作符改为Observable）
 * 3.自动订阅
 * 4.返回值是Observable类型的数据流
 */
export function ActionAuto(action?: DecoratorActionOptions) {
    return function (target: any, name: string, descriptor: TypedPropertyDescriptor<any>) {
        // console.log(`target：${target}，name: ${name}，descriptor: ${descriptor}`);
        if (helpers.isFunction(descriptor.value)) {
            const originalFn = descriptor.value;
            descriptor.value = function (...args: any[]) {
                this.snapshot.actionName = name;
                let result = originalFn.call(this, ...args);
                result = _dispatch(result);
                result.subscribe(() => {
                });
                return result;
            };

            const metadata = helpers.findAndCreateStoreMetadata(target);
            metadata.actions[name] = {
                originalFn: originalFn,
                type: name,
                functionName: name
            };
        } else {
            throw new Error(`action decorator must be used on function.`);
        }
    };
}


function _dispatch(result: any): Observable<any> {
    if (result instanceof Promise) {
        result = from(result);
    }
    if (result instanceof Observable) {
        result = result.pipe(map(r => r));
    } else {
        result = Observable.create((observer: Observer<any>) => {
            observer.next({});
        });
    }
    return result.pipe(shareReplay());
}
