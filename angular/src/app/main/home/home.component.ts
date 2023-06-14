import { AfterViewInit, Component, Injector, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppNavigationService } from '@app/shared/layout/nav/app-navigation.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { PermissionCheckerService } from 'abp-ng2-module';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('dynamic_tab') tabElements: QueryList<any>;
  openedTabsObj: Array<any> = []; // { name: string, code: string, active: bool, params: {} }
  currentTabCode: string;
  maxNumberOfTab: Number;
  shortcuts: any[] = [];
  params: any = {};
  interval;

  constructor(
    injector: Injector,
    private eventBus: EventBusService,
    private _router: Router,
    private _localStorageService: LocalStorageService,
    private _permissionCheckService: PermissionCheckerService,
    private _appNavigationService: AppNavigationService,
  ) {
    super(injector);
    // _router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    // window.addEventListener('focus', event => {
    //     const userId =  event.currentTarget['localStorage']['currentUser'] !== 'undefined' ? JSON.parse(event.currentTarget['localStorage']['currentUser'])?.id : undefined;
    //     if (userId != abp.session.userId) {
    //         window.location.reload();
    //     }
    // });

    this.maxNumberOfTab = Number(abp.setting.get("Abp.Zero.HomePage.MaxNumberOfTab"));
    // Load from Local Storage (not need to login)
    this._localStorageService.getItem(AppConsts.STORAGE_KEYS.OPEN_TABS, (_err, data) => {
      let tabKeepParams = [TABS.APPROVE_REQUEST, TABS.UR_CREATE_USER_REQUEST, TABS.PURCHASE_REQUEST, TABS.PURCHASE_ORDERS,TABS.RECEIPT_NOTES,TABS.GOODS_RECEIPT, TABS.FRAMEWORK_CONTRACT_MANAGEMENT];
      if (data && Array.isArray(data)) {
        // Clear all Proposal & Appointment when reload (eg: F5, Close-Reopen browser tab)
        //data = data.filter(x => !(x.code.startsWith("")) || x.code.startsWith(TABS.APPROVE_REQUEST) || x.code.startsWith(TABS.UR_REQUEST) || x.code.startsWith(TABS.UR_CREATE_USER_REQUEST)).map(e => Object.assign(e, { params: tabKeepParams.findIndex(i => e.code.startsWith(i)) !== -1 ? e.params : undefined })); // cmt lại do hiện tại dòng này đang tắt hết các tab hiện mở
        if (data && data.length > 0) {
          this.openedTabsObj = data;
          const tabCode = (data[data.length - 1]).code;
          this.currentTabCode = tabCode;
          this._localStorageService.setItem(AppConsts.STORAGE_KEYS.CURRENT_TAB, tabCode);
          this.displayTab(tabCode);
        }
      }
    });


    if (!this.openedTabsObj?.length) {
      const menus = this._appNavigationService.getMenu().items;
      const index = menus?.findIndex(e => e.route == TABS.MAIN_DASHBOARD);

        // cái bên dưới cmt vì nó mở tab đầu tiên trong navigate => khi nào có dashboard dùng sau
        if (menus[index]?.route) {
            this.openedTabsObj.push({
              code: menus[index]?.route,
              name: menus[index]?.name,
              active: true
            })
        }
        if (menus[index]?.route) this.displayTab(menus[index]?.route);
    }

    this.eventBus.on('openComponent').subscribe(val => {
      let tabCode = val.functionCode;
      let tabName = val.tabHeader;
      let newTabObj = null;
      let oldTabObj = null;
    //   console.log(val)
      let params = Object.assign(val.params?.data ?? val.params ?? {}, { event: 'openComponent' });
      let functionCode = val.functionCode;
      if (val.params?.key > 0 && val.params?.prefix?.length > 0) {
        functionCode = `${val.functionCode}_${val.params.prefix}`;
        tabCode = `${val.functionCode}_${val.params.prefix}`;
      }
      this.params[functionCode] = params;
      let countTab = params.countTab;
      // TODO: Review Code
      // Can open more than one tab
      if ([TABS.CREATE_OR_EDIT_PURCHASE_REQUEST, TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,TABS.DIGITAL_INVOICE_DETAIL,TABS.COMPARE_INVOICE,
        TABS.CREATE_OR_EDIT_RECEIPT_NOTES, TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES, TABS.CREATE_OR_EDIT_GOODS_RECEIPT, TABS.VIEW_GOODS_RECEIPT, TABS.VIEW_RECEIPT_NOTE].indexOf(tabCode) >= 0) {
        switch (tabCode) {
          case TABS.CREATE_OR_EDIT_PURCHASE_REQUEST:
            tabCode = countTab ? `${TABS.CREATE_OR_EDIT_PURCHASE_REQUEST}---${countTab}` : TABS.CREATE_OR_EDIT_PURCHASE_REQUEST;
            params = {
              data: val.params.data,
            };
            break;
          case TABS.CREATE_OR_EDIT_PURCHASE_ORDERS:
            tabCode = countTab ? `${TABS.CREATE_OR_EDIT_PURCHASE_ORDERS}---${countTab}` : TABS.CREATE_OR_EDIT_PURCHASE_ORDERS;
            params = {
              data: val.params.data,
            };
            break;
            case TABS.DIGITAL_INVOICE_DETAIL:
            tabCode = countTab ? `${TABS.DIGITAL_INVOICE_DETAIL}---${countTab}` : TABS.DIGITAL_INVOICE_DETAIL;
            params = {
                data: val.params.data,
            };
            break;
            case TABS.COMPARE_INVOICE:
            tabCode = countTab ? `${TABS.COMPARE_INVOICE}---${countTab}` : TABS.COMPARE_INVOICE;
            params = {
                data: val.params.data,
            };
            break;
            case TABS.CREATE_OR_EDIT_RECEIPT_NOTES:
            tabCode = countTab ? `${TABS.CREATE_OR_EDIT_RECEIPT_NOTES}---${countTab}` : TABS.CREATE_OR_EDIT_RECEIPT_NOTES;
            params = {
                data: val.params.data,
            };
            break;
            case TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES:
            tabCode = countTab ? `${TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES}---${countTab}` : TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES;
            params = {
                data: val.params.data,
            };
            break;
            case TABS.CREATE_OR_EDIT_GOODS_RECEIPT:
              tabCode = countTab ? `${TABS.CREATE_OR_EDIT_GOODS_RECEIPT}---${countTab}` : TABS.CREATE_OR_EDIT_GOODS_RECEIPT;
              params = {
                  data: val.params?.data,
              };
            break;
            case TABS.VIEW_GOODS_RECEIPT:
              tabCode = countTab ? `${TABS.VIEW_GOODS_RECEIPT}---${countTab}` : TABS.VIEW_GOODS_RECEIPT;
              params = {
                  data: val.params?.data,
              };
            break;
            case TABS.VIEW_RECEIPT_NOTE:
              tabCode = countTab ? `${TABS.VIEW_RECEIPT_NOTE}---${countTab}` : TABS.VIEW_RECEIPT_NOTE;
              params = {
                  data: val.params?.data,
              };
            break;
          default:
            break;
        }

        // if (val?.params?.data?.appointment?.roSave) {
        //   this.removeTabHandler({ code: TABS.SERVICE_QUOTATION_COPY_REPAIR_ORDER })
        // }
      }

      // Can not open more than the maximum number of tabs
      newTabObj = { name: tabName, code: tabCode, params: params };

      oldTabObj = this.openedTabsObj.find(item => item.code === newTabObj.code);
      if (this.openedTabsObj.length === this.maxNumberOfTab) {
        if (!oldTabObj) {
          this.message.warn(this.l('OverMaximumNumberOfTab', this.maxNumberOfTab));
          return;
        }
      }

      this._localStorageService.setItem(AppConsts.STORAGE_KEYS.CURRENT_TAB, tabCode);
      this.currentTabCode = tabCode;

      if (!oldTabObj) {
        this.openedTabsObj.push(newTabObj);
        this._localStorageService.setItem(AppConsts.STORAGE_KEYS.OPEN_TABS, this.openedTabsObj);
      }

      this.displayTab(newTabObj.code);
    });
  }

  ngOnDestroy(): void {
    this.eventBus.clearObservers();
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
  }

  displayTab(code: string, event?) {
    if (!code) return;
    if (event && code === this.currentTabCode) return;
    // if (this.currentTabCode === TABS.SERVICE_QUOTATION_RECEPTIONIST_APPOINTMENT)  {
    //   const currentTab  = this.tabElements?.find((e) => e.tabCode === this.currentTabCode);
    //   if (typeof currentTab?.componentRef?.instance?.save === 'function') currentTab?.componentRef?.instance?.save();
    // }

    // name param is used for tabs that can open multi instances
    this.setCurrentTab(code);
    setTimeout(() => this.setTitleTab(), 50);

    // set custom interval
    const currentTab  = this.tabElements?.find((e) => e.tabCode === this.currentTabCode);
    clearInterval(this.interval);
  }


  setTitleTab() {
    this.openedTabsObj.forEach((tab, i) => {
      let id = i + "-link";
      var a = document.getElementById(id);   // Get the first <a> element in the document
      var att = document.createAttribute('title');       // Create a "class" attribute
      att.value = this.l(tab.name);                           // Set the value of the class attribute
      a.setAttributeNode(att);
    });
  }

  setCurrentTab(code: string) {
    this._localStorageService.setItem(AppConsts.STORAGE_KEYS.CURRENT_TAB, code);
    this.currentTabCode = code;

    if (code === '') {
      this._router.navigate(['/']);
    } else {
      // No re-assign new ref to data-bound this.openedTabsObj
      for (const objTab of this.openedTabsObj) {
        if (objTab.code === code) {
          if (!objTab.active) objTab.active = true;
        } else {
          if (objTab.active === true) objTab.active = false;
        }
      }

      this._localStorageService.setItem(AppConsts.STORAGE_KEYS.OPEN_TABS, this.openedTabsObj);

      this.runCustomFunction(code);
    }
  }

  // config phím tắt
  setShortcuts(component) {
    this.shortcuts = [];
  }

  removeTabHandler(tab: any, registerNo?: string): void {
    this._localStorageService.getItem(AppConsts.STORAGE_KEYS.OPEN_TABS, (err, tabs) => {
      if (tabs && Array.isArray(tabs)) {
        // const idx = this.openedTabsObj.findIndex(obj => obj.code === tab.code);
        this.openedTabsObj = this.openedTabsObj.filter(e => e.code !== tab.code);
        this._localStorageService.setItem(AppConsts.STORAGE_KEYS.OPEN_TABS, this.openedTabsObj);
        if (this.openedTabsObj.length == 0) this.displayTab('');
      }
    });
    if (this.interval) clearInterval(this.interval)
  }

  runCustomFunction(code) {
    setTimeout(() => {
      const component = this.tabElements.find((e) => e.tabCode === code);
      if (component) {
        if (this.params[this.currentTabCode]?.reload) {
          if (!this.params.tabCodes) this.params.tabCodes = [];
          this.params.tabCodes.push(this.currentTabCode);
        }
        setTimeout(() => component.runCustomFunction(this.params)); // prevent error: ExpressionChangedAfterItHasBeenCheckedError when close one tab
      }
    });
  }

  autoReloadWhenDisplayTab(event: any) {
    let oldTabCodes = [];
    if (this.currentTabCode.startsWith(event.key)) oldTabCodes = this.params.tabCodes ?? [];
    // if (!this.params[this.currentTabCode]) this.params[this.currentTabCode] = Object.assign(this.params[this.currentTabCode], event);
    this.params.tabCodes = oldTabCodes.concat(event.tabCodes?.filter(e => !oldTabCodes.some(o => e === o)));
    this.params.tabCodes.forEach(tab => {
      if (this.params[tab]) {
        this.params[tab] = Object.assign(this.params[tab], event);
      } else this.params[tab] = event;
      // xóa thuộc tính k dùng của event
      delete this.params[tab]?.tabCodes;
    })
    this.params.reloadTabHasRegisterNo = event.reloadTabHasRegisterNo;
    if (event.reloadTabHasRegisterNo) {
      if (event.key == TABS.PURCHASE_REQUEST) this.params.paramsForTabHasRegisterNo = event;
      else this.params.paramsForTabHasRegisterNo = event?.params;
    }

    if (event.openComponent && (event.reloadTabHasRegisterNo || event.reloadTabHasRegisterNo[0])) {
      this.displayTab(`${event.openComponent}---${event.reloadTabHasRegisterNo[0]}`);
    }

    if (event.openComponent)
      this.displayTab(`${event.openComponent}---${event.reloadTabHasRegisterNo[0]}`);
  }

  changeTabCode(event) {
    if (this.currentTabCode.includes(TABS.CREATE_OR_EDIT_PURCHASE_REQUEST)) {
      const index = this.openedTabsObj.findIndex(e => e.code === this.currentTabCode && e.active);
      this.openedTabsObj[index].code = TABS.CREATE_OR_EDIT_PURCHASE_REQUEST.concat(`---${event.addRegisterNo}`);
      this.openedTabsObj[index].name = this.l('CreateOrEditPurchaseRequest').concat(` - ${event.addRegisterNo}`);
      this.currentTabCode = TABS.CREATE_OR_EDIT_PURCHASE_REQUEST.concat(`---${event.addRegisterNo}`);
      setTimeout(() => this.setTitleTab(), 50);
    }

    if (this.currentTabCode.includes(TABS.CREATE_OR_EDIT_PURCHASE_ORDERS)) {
      const index = this.openedTabsObj.findIndex(e => e.code === this.currentTabCode && e.active);
      this.openedTabsObj[index].code = TABS.CREATE_OR_EDIT_PURCHASE_ORDERS.concat(`---${event.addRegisterNo}`);
      this.openedTabsObj[index].name = this.l('CreateOrEditPurchaseOrders').concat(` - ${event.addRegisterNo}`);
      this.currentTabCode = TABS.CREATE_OR_EDIT_PURCHASE_ORDERS.concat(`---${event.addRegisterNo}`);
      setTimeout(() => this.setTitleTab(), 50);
    }
  }

}
