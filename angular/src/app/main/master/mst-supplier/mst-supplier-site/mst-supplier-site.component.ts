import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchasePurposeDto, InputPurchasePurposeDto, InputSearchMstCurrency, MstCurrencySelectDto, MstCurrencyServiceProxy, MstPurchasePurposeServiceProxy, MstSupplierServiceProxy, SupplierSiteOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { MstContactComponent } from '../mst-supplier-contact/mst-supplier-contact.component';
import { CreateOrEditMstSupplierSiteComponent } from './create-or-edit-mst-supplier-site/create-or-edit-mst-supplier-site.component';

@Component({
    selector: 'app-mst-supplier-site',
    templateUrl: './mst-supplier-site.component.html',
    styleUrls: ['./mst-supplier-site.component.css']
})
export class MstSupplierSiteComponent extends AppComponentBase implements OnInit {
    // currencyForm: FormGroup;
    @ViewChild('mstContact', { static: true }) mstContact: MstContactComponent;
    @ViewChild('createOrEditMstSupplierSite', { static: true }) createOrEditMstSupplierSite: CreateOrEditMstSupplierSiteComponent;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listSupplierSite: SupplierSiteOutputSelectDto[];
    selectedRow: SupplierSiteOutputSelectDto = new SupplierSiteOutputSelectDto();
    supplierSiteId;
    siteAddress;
    @Input() supplierName;
    @Input() supplierNumber;
    supplierId: number = 0;

    constructor(
        injector: Injector,
        private _mstSupplierServiceProxy: MstSupplierServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // this.buildForm();
        this.searchSupplierSite(0);
        this.gridColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                maxWidth: 60,
            },
            {
                headerName: this.l('Country'),
                headerTooltip: this.l('Country'),
                field: 'country',
                width: 100,
            },

            {
                headerName: this.l('Address'),
                headerTooltip: this.l('Address'),
                field: 'addressLine1',
                width: 100,
            },
            {
                headerName: this.l('BeneficiaryAccount'),
                headerTooltip: this.l('BeneficiaryAccount'),
                field: 'bankAccountNum',
                width: 100,
            },
            {
                headerName: this.l('BankName'),
                headerTooltip: this.l('BankName'),
                field: 'bankName',
                width: 150,
            },
            {
                headerName: this.l('LegalBusinessName'),
                headerTooltip: this.l('LegalBusinessName'),
                field: 'legalBusinessName',
                width: 100,
            },
            {
                headerName: this.l('SiteDefault'),
                headerTooltip: this.l('SiteDefault'),
                field: 'isSiteDefault',
                cellRenderer: (params) => params.value ? `<input type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
                cellClass: ['text-center'],
                maxWidth: 80,

            },
        ]
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow =
            params.api.getSelectedRows()[0] ?? new SupplierSiteOutputSelectDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        // this.supplierSiteId = this.selectedRow.id;
        this.mstContact.searchSupplierContact(this.selectedRow.id, this.supplierName, this.supplierNumber, this.selectedRow.addressLine1);
        this.supplierSiteId = this.selectedRow.id;
        this.siteAddress = this.selectedRow.addressLine1;
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listSupplierSite) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchSupplierSite(this.supplierId);
        this.setlistSupplierContactNull();
    }

    setlistSupplierContactNull() {
        this.mstContact.searchSupplierContact(0, this.supplierName, this.supplierNumber, this.selectedRow.addressLine1);
    }

    searchSupplierSite(_supplierId) {
        this.spinnerService.show();
        this.supplierId = _supplierId;
        this._mstSupplierServiceProxy.getAllSupplierSiteBySupplierId(
            _supplierId,
            this.paginationParams ? this.paginationParams.sorting : '',
            this.paginationParams ? this.paginationParams.pageSize : 20,
            this.paginationParams ? this.paginationParams.skipCount : 1)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listSupplierSite = result.items;
                this.gridParams.api.setRowData(this.listSupplierSite);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
        this.spinnerService.hide();
    }

    addSite() {
        if (this.supplierName == undefined) {
            this.notify.warn('Please select a supplier to create supplier site!');
        }
        else {
            this.createOrEditMstSupplierSite.show(0, this.supplierId);
        }
    }

    editSite() {
        if (this.selectedRow.id && this.selectedRow.id > 0) {
            this.createOrEditMstSupplierSite.show(this.selectedRow.id, this.supplierId);
        } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
        }
    }

    deleteSite() {
        if (this.selectedRow.id && this.selectedRow.id > 0) {
            this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
                if (isConfirmed) {
                    this.spinnerService.show();
                    this._mstSupplierServiceProxy.deleteSite(this.selectedRow.id).subscribe(val => {
                        this.notify.success('Successfully Deleted');
                        this.searchSupplierSite(this.supplierId);
                        this.setlistSupplierContactNull();
                        this.spinnerService.hide();
                    });
                }
            });
        } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
        }
    }
}
