import { PermissionCheckerService } from 'abp-ng2-module';
import {
    Injector,
    ElementRef,
    Component,
    OnInit,
    ViewEncapsulation,
    Inject,
    Renderer2,
    AfterViewInit,
} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppMenu } from './app-menu';
import { AppNavigationService } from './app-navigation.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuOptions } from '@metronic/app/core/_base/layout/directives/menu.directive';
import { FormattedStringValueExtracter } from '@shared/helpers/FormattedStringValueExtracter';
import * as objectPath from 'object-path';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppMenuItem } from './app-menu-item';
import { EventBusService } from '@app/shared/services/event-bus.service';

@Component({
    templateUrl: './side-bar-menu.component.html',
    selector: 'side-bar-menu',
    encapsulation: ViewEncapsulation.None,
})
export class SideBarMenuComponent extends AppComponentBase
    implements OnInit, AfterViewInit {
    menu: AppMenu = null;

    currentRouteUrl = '';
    insideTm: any;
    outsideTm: any;
    parameters: { reportType?: number, categoryType?: number, viewChildName?: string, type?: string } = { reportType: 0, categoryType: 0, viewChildName: '', type: '' };
    menuOptions: MenuOptions = {
        submenu: {
            desktop: {
                default: 'dropdown',
            },
            tablet: 'accordion',
            mobile: 'accordion',
        },

        accordion: {
            expandAll: false,
        }
    };

    constructor(
        injector: Injector,
        private el: ElementRef,
        private router: Router,
        public permission: PermissionCheckerService,
        private _appNavigationService: AppNavigationService,
        private render: Renderer2,
        private eventBus: EventBusService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.menu = this._appNavigationService.getMenu();

        this.currentRouteUrl = this.router.url.split(/[?#]/)[0];

        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(
                (event) =>
                    (this.currentRouteUrl = this.router.url.split(/[?#]/)[0])
            );
    }

    ngAfterViewInit(): void {
        this.scrollToCurrentMenuElement();
    }

    showMenuItem(menuItem): boolean {
        return this._appNavigationService.showMenuItem(menuItem);
    }

    isMenuItemIsActive(item): boolean {
        if (item.items.length) {
            return this.isMenuRootItemIsActive(item);
        }

        if (!item.route) {
            return false;
        }

        let urlTree = this.router.parseUrl(
            this.currentRouteUrl.replace(/\/$/, '')
        );
        let urlString =
            '/' +
            urlTree.root.children.primary.segments
                .map((segment) => segment.path)
                .join('/');
        let exactMatch = urlString === item.route.replace(/\/$/, '');
        if (!exactMatch && item.routeTemplates) {
            for (let i = 0; i < item.routeTemplates.length; i++) {
                let result = new FormattedStringValueExtracter().Extract(
                    urlString,
                    item.routeTemplates[i]
                );
                if (result.IsMatch) {
                    return true;
                }
            }
        }
        return exactMatch;
    }

    isMenuRootItemIsActive(item): boolean {
        let result = false;

        for (const subItem of item.items) {
            result = this.isMenuItemIsActive(subItem);
            if (result) {
                return true;
            }
        }

        return false;
    }

     /**
   * Use for fixed left aside menu, to show menu on mouseenter event.
   * @param e Event
   */
  mouseEnter(e: Event) {
    // check if the left aside menu is fixed
    if (document.body.classList.contains('aside-fixed')) {
      if (this.outsideTm) {
        clearTimeout(this.outsideTm);
        this.outsideTm = null;
      }

      this.insideTm = setTimeout(() => {
        // if the left aside menu is minimized
        if (document.body.classList.contains('aside-minimize') && KTUtil.isInResponsiveRange('desktop') && document.body.classList.contains('aside-minimize-hoverable')) {
          // show the left aside menu
          this.render.removeClass(document.body, 'aside-minimize');
          this.render.addClass(document.body, 'aside-minimize-hover');
        }
      }, 50);
    }
  }

  /**
   * Use for fixed left aside menu, to show menu on mouseenter event.
   * @param e Event
   */
  mouseLeave(e: Event) {
    if (document.body.classList.contains('aside-fixed')) {
      if (this.insideTm) {
        clearTimeout(this.insideTm);
        this.insideTm = null;
      }

      this.outsideTm = setTimeout(() => {
        // if the left aside menu is expand
        if (document.body.classList.contains('aside-minimize-hover') && KTUtil.isInResponsiveRange('desktop')) {
          // hide back the left aside menu
          this.render.removeClass(document.body, 'aside-minimize-hover');
          this.render.addClass(document.body, 'aside-minimize');
        }
      }, 100);
    }
  }

    scrollToCurrentMenuElement(): void {
        const path = location.pathname;
        const menuItem = document.querySelector('a[href=\'' + path + '\']');
        if (menuItem) {
            menuItem.scrollIntoView({ block: 'center' });
        }
    }

    getItemAttrSubmenuToggle(item) {
        let toggle = 'hover';
        if (objectPath.get(item, 'toggle') === 'click') {
            toggle = 'click';
        } else if (objectPath.get(item, 'submenu.type') === 'tabs') {
            toggle = 'tabs';
        } else {
            // submenu toggle default to 'hover'
        }

        return toggle;
    }

    getItemCssClasses(item) {
        let classes = 'menu-item';

        if (objectPath.get(item, 'submenu')) {
            classes += ' menu-item-submenu';
        }

        if (!item.items && this.isMenuItemIsActive(item)) {
            classes += ' menu-item-active menu-item-here';
        }

        if (item.items && this.isMenuItemIsActive(item)) {
            classes += ' menu-item-open menu-item-here';
        }

        // custom class for menu item
        const customClass = objectPath.get(item, 'custom-class');
        if (customClass) {
            classes += ' ' + customClass;
        }

        if (objectPath.get(item, 'icon-only')) {
            classes += ' menu-item-icon-only';
        }

        return classes;
    }

      /**
   * Open the selected component. Display in placeholder of dynamic tab,
   * or open a dedicated tab, or open a specific tab.
   *
   * @param event
   * @param item
   */
  openComponent(event, item: AppMenuItem) {
    if (item.route.startsWith('SERVICE_REPORT') || item.name.startsWith('SALE_REPORT') || item.route.startsWith('CRM_REPORT') || item.route.startsWith('CRAM_IMPORT') || item.route.startsWith('NPS_EXPORT') || item.route == 'GET_DATA_MODAL') {
        if (item.parameters && item.parameters['viewChildName']) {
            this.parameters = item.parameters;
            setTimeout(() => {
                this[item.parameters['viewChildName']].show();
            });
        }
        else this[item.name.charAt(0).toLowerCase() + item.name.slice(1)].show();
        return;
    }
    // const functionCode = (item.parameters && item.parameters.functionCode) || item.route; // origin
    const functionCode = item.route;
    if (!functionCode) { return; }

    // Only emit event for TABS
    if (Object.values(TABS).indexOf(functionCode) < 0) { return; }
    event.stopPropagation();
    // TODO: Review Code. Replace this.eventBus.
    // TODO:
    // - 1st Show Modal Filter Tabs
    // - 2nd Show a new browser tab
    // - 3rd emit event 'openComponent' to immediatly show tab
    // console.log(item.parameters)

    this.eventBus.emit({
        type: 'openComponent',
        functionCode: functionCode,
        tabHeader: this.l(item.name),
        params: item.parameters
        // params: {key:1,prefix:'lmao'}
    });
}
}
