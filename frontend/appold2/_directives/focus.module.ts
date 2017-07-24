/**
 * Created by cdunnink on 30-11-2016.
 */

import {NgModule, ModuleWithProviders} from '@angular/core';
import {FocusDirective} from './focus.directive';

@NgModule({
    declarations: [FocusDirective],
    exports: [FocusDirective]
})
export class FocusModule {
    static forRoot (): ModuleWithProviders {
        return {
            ngModule: FocusModule
        };
    }
}
