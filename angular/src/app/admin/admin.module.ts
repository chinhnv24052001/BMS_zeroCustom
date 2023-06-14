import {NgModule} from '@angular/core';
import {AdminRoutingModule} from './admin-routing.module';
import {
    BsDatepickerConfig,
    BsDatepickerModule,
    BsDaterangepickerConfig,
    BsLocaleService
} from '@node_modules/ngx-bootstrap/datepicker';
import {NgxBootstrapDatePickerConfigService} from '../../assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface} from '@node_modules/ngx-perfect-scrollbar';
import {ModalModule} from '@node_modules/ngx-bootstrap/modal';
import {TabsModule} from '@node_modules/ngx-bootstrap/tabs';
import {TooltipModule} from '@node_modules/ngx-bootstrap/tooltip';
import {PopoverModule} from '@node_modules/ngx-bootstrap/popover';
import {BsDropdownModule} from '@node_modules/ngx-bootstrap/dropdown';
import { TreeDragDropService } from 'primeng/api';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    // suppressScrollX: true
};

@NgModule({
    imports: [
        AdminRoutingModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot()
    ],
    declarations: [],
    exports: [],
    providers: [
        TreeDragDropService,
        {provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig},
        {provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig},
        {provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale},
        {provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
    ]
})
export class AdminModule {
}
