import { ChangeDetectorRef, Compiler, Component, ComponentRef, EventEmitter, Injector, Input, NgModuleFactory, NgModuleRef, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { TmssCheckboxComponent } from '@app/shared/common/input-types/tmss-checkbox/tmss-checkbox.component';
import { TmssDatepickerComponent } from '@app/shared/common/input-types/tmss-datepicker/tmss-datepicker.component';
import { MODULE_COMPONENT_MAP } from '@app/shared/constants/module-component-map';
import { TABS } from '@app/shared/constants/tab-keys';

@Component({
  selector: 'dynamic-tab',
  templateUrl: './dynamic-tab.component.html',
  styleUrls: ['./dynamic-tab.component.css']
})
export class DynamicTabComponent implements OnInit, OnChanges, OnDestroy {

    @ViewChild('componentPlaceholder', {
      read: ViewContainerRef,
      static: false,
  })
  componentPlaceholder: ViewContainerRef;
  @Input() tabCode;
  @Input() params;
  @Input() currentTabCode;
  @Output() event$: EventEmitter<any> = new EventEmitter();
  @Output() setShortcuts: EventEmitter<any> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<any> = new EventEmitter();
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> =
      new EventEmitter();
  @Output() removeRegisterNo: EventEmitter<{ removeRegisterNo: string }> =
      new EventEmitter();

  private moduleRef: NgModuleRef<any>;
  private componentRef: ComponentRef<any>;
  isLoading: boolean = false;


  constructor(
    private cdr: ChangeDetectorRef,
    private injector: Injector,
    private compiler: Compiler
  ) { }


  ngOnDestroy() {
    this.moduleRef?.destroy();
    this.componentRef?.destroy();
}


   ngOnChanges(changes: SimpleChanges) {
        if (changes.params && this.moduleRef && this.componentRef) {
            // if (changes.params && this.componentRef) {
            if (this.params) {
                // Why 'this'.params but not changes.params
                const _changes = {};
                // tslint:disable-next-line: forin
                for (const prop in this.params) {
                    const oldValue = this.componentRef.instance[prop];
                    if (this.params.hasOwnProperty(prop)) {
                        // not inherited properties
                        this.componentRef.instance[prop] = this.params[prop];
                    }
                    if (oldValue !== this.params[prop]) {
                        _changes[prop] = new SimpleChange(
                            oldValue,
                            this.params[prop],
                            false
                        );
                    }
                }
                if (
                    Object.keys(_changes).length &&
                    this.componentRef.instance.ngOnChanges
                ) {
                    this.componentRef.instance.ngOnChanges(_changes);
                }
            }
        }
    }

    runCustomFunction(params) {
      if (this.componentRef) {
          this.setShortcuts.emit(this.componentRef);
          if (this.componentRef.instance.defaultFocusField) {
              let elementRef = '';
              if (this.componentRef.instance[this.componentRef.instance.defaultFocusField] instanceof TmssDatepickerComponent)
                  elementRef = 'datepicker';
              else if (this.componentRef.instance[this.componentRef.instance.defaultFocusField] instanceof TmssCheckboxComponent)
                  elementRef = 'iCheckBox';
              else elementRef = 'input';
              this.componentRef.instance.defaultFocusField[elementRef]?.nativeElement.focus();
          }
      } else {
          const module = this.getModulePath(this.currentTabCode);
          this.importModule(module, params);
      }
  }

      /**
     * Get the Module's path by tabCode. Use this path for dynamic create Module and Component instance
     *
     * @param tabCode
     */
      private getModulePath(tabCode) {
        const multiTabs = [
            TABS.CREATE_OR_EDIT_PURCHASE_REQUEST,
            TABS.DIGITAL_INVOICE_DETAIL,
            TABS.COMPARE_INVOICE,
            TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
            TABS.APPROVE_REQUEST,
            TABS.PURCHASE_REQUEST,
            TABS.RECEIPT_NOTES,
            TABS.GOODS_RECEIPT,
            TABS.PURCHASE_ORDERS,
            TABS.FRAMEWORK_CONTRACT_MANAGEMENT,
            TABS.UR_CREATE_USER_REQUEST,
            TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES,
            TABS.CREATE_OR_EDIT_RECEIPT_NOTES,
            TABS.CREATE_OR_EDIT_GOODS_RECEIPT,
            TABS.VIEW_GOODS_RECEIPT,
            TABS.VIEW_RECEIPT_NOTE,
            TABS.BMS_BUDGET_TRANSFER,
            TABS.BMS_BUDGET_REVIEW,
            TABS.BMS_BUDGET_PLAN_REVIEW
        ];
        const index = multiTabs.findIndex((e) => tabCode.startsWith(e));
        tabCode = index !== -1 ? multiTabs[index] : tabCode;
        for (const modulePath in MODULE_COMPONENT_MAP) {
            if (MODULE_COMPONENT_MAP[modulePath].toString().includes(tabCode)) {
                return modulePath;
            }
        }

        return '';
    }

       /**
     *
     * @param t
     */
       private loadModuleFactorySync(t: any) {
        if (t instanceof NgModuleFactory)  return t;
        else  return this.compiler.compileModuleSync(t);
    }
    /**
     * You have to set the Module Name and Module File Name as this convention:
     * + File name: lower-and-hyphen-separtor-name.module.ts
     * + Module name: LowerAndHyphenSeparatorNameModule (Remove hyphen and Upper first letter of each word)
     */
    private importModule(path: string, params: any) {
        let transformed = this.getMiddlePathAndModuleName(path);
        import(`app/${transformed.MiddlePath}/${transformed.RawModuleName.toLowerCase()}.module`)
            .then((m) => this.renderComponent(m[`${transformed.ModuleName}Module`], params))
            // .catch(async (ex) => {
            //     abp.notify.warn(ex);
            //     const chunkFailedMessage = /Loading chunk [\d]+ failed/;
            //     if (chunkFailedMessage.test(ex)) {
            //         await abp.message.confirm(
            //             'Đã có phiên bản mới, cần tải lại trang',
            //             '',
            //             async (confirmed) => {
            //                 if (confirmed) await window.location.reload();
            //             }
            //         );
            //     }
            // });
            .catch((ex) => {
                localStorage.setItem('importModuleError', ex);
                abp.message.confirm(ex);
            });
    }
    /**
     *
     * @param module
     */
    private renderComponent(module: any, params: any) {
        const _modFac = this.loadModuleFactorySync(module);
        this.moduleRef = _modFac.create(this.injector);
        const _comp = (_modFac.moduleType as any).getComponent(this.normalizeTabCode(this.tabCode));
        if (_comp) {
            const _compFactory = this.moduleRef.componentFactoryResolver.resolveComponentFactory(_comp);

            if (!this.componentRef) this.componentRef = this.componentPlaceholder.createComponent(_compFactory);

            this.componentRef.instance.autoReloadWhenDisplayTab = this.autoReloadWhenDisplayTab;
            this.componentRef.instance.changeTabCode = this.changeTabCode;
            this.setShortcuts.emit(this.componentRef);
            this.componentRef.instance.removeRegisterNo = this.removeRegisterNo;
            this.componentRef.instance.params = this.params?.data ?? this.params;

            if (this.componentRef.instance.defaultFocusField) {
                let elementRef = '';
                if (this.componentRef.instance[this.componentRef.instance.defaultFocusField] instanceof TmssDatepickerComponent)
                    elementRef = 'datepicker';
                else if (this.componentRef.instance[this.componentRef.instance.defaultFocusField] instanceof TmssCheckboxComponent)
                    elementRef = 'iCheckBox';
                else elementRef = 'input';
                this.componentRef.instance.defaultFocusField[elementRef]?.nativeElement.focus();
            }
            params[this.currentTabCode] = undefined;
            this.cdr.detectChanges();
        }
    }

    private normalizeTabCode(rawCode: string) {
        const multiTabs = [
            TABS.CREATE_OR_EDIT_PURCHASE_REQUEST,
            TABS.DIGITAL_INVOICE_DETAIL,
            TABS.COMPARE_INVOICE,
            TABS.APPROVE_REQUEST,
            TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
            TABS.PURCHASE_REQUEST,
            TABS.RECEIPT_NOTES,
            TABS.GOODS_RECEIPT,
            TABS.PURCHASE_ORDERS,
            TABS.FRAMEWORK_CONTRACT_MANAGEMENT,
            TABS.UR_CREATE_USER_REQUEST,
            TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES,
            TABS.CREATE_OR_EDIT_RECEIPT_NOTES,
            TABS.CREATE_OR_EDIT_GOODS_RECEIPT,
            TABS.VIEW_GOODS_RECEIPT,
            TABS.VIEW_RECEIPT_NOTE,
            TABS.BMS_BUDGET_TRANSFER,
            TABS.BMS_BUDGET_REVIEW,
            TABS.BMS_BUDGET_PLAN_REVIEW
        ];
        const index = multiTabs.findIndex((e) => this.tabCode.startsWith(e));
        if (rawCode.indexOf('---') >= 0) return rawCode.substr(0, rawCode.indexOf('---'));
        else if (index !== -1) return multiTabs[index];
        else return rawCode;

    }

    private getMiddlePathAndModuleName(path: string) {
        const separator = '/';
        const period = '.';
        const idxFirstSep = path.indexOf(separator);
        const idxLastSep = path.lastIndexOf(separator);
        const idxLastPeriod = path.lastIndexOf(period);

        // remove 'app/' and '/module-name.module'
        const middlePath = path.substr(
            idxFirstSep + 1,
            idxLastSep - idxFirstSep - 1
        );
        const rawModuleName = path.substr(
            idxLastSep + 1,
            idxLastPeriod - idxLastSep - 1
        );

        // Transform module name to Pascal Case
        let p = rawModuleName;
        p = p[0]?.toUpperCase() + p.substr(1, p.length - 1);

        const regex = /(-\w){1}/gi;

        return {
            MiddlePath: middlePath,
            ModuleName: p.replace(regex, (match) => match[1].toUpperCase()),
            RawModuleName: rawModuleName,
        };
    }

  ngOnInit(): void {
  }

}
