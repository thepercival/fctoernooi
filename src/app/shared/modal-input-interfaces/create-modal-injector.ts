import { InjectionToken, Injector } from '@angular/core';

type ExactShape<TExpected, TActual extends TExpected> = TExpected & {
    [K in Exclude<keyof TActual, keyof TExpected>]: never;
};

export function createModalInjector<TExpected, TActual extends TExpected>(
    parent: Injector,
    token: InjectionToken<TExpected>,
    value: ExactShape<TExpected, TActual>
): Injector {
    return Injector.create({
        providers: [{ provide: token, useValue: value }],
        parent
    });
}
