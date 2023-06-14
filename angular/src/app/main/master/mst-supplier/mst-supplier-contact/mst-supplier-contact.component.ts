import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstSupplierServiceProxy, SupplierContacOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrResetMstSupplierContactComponent } from './create-or-reset-mst-supplier-contact/create-or-reset-mst-supplier-contact.component';

@Component({
  selector: 'app-mst-supplier-contact',
  templateUrl: './mst-supplier-contact.component.html',
  styleUrls: ['./mst-supplier-contact.component.css']
})
export class MstContactComponent extends AppComponentBase implements OnInit {
  @ViewChild('createOrResetMstSupplierContact', { static: true }) createOrResetMstSupplierContact: CreateOrResetMstSupplierContactComponent;
  currencyForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listSupplierContact: SupplierContacOutputSelectDto[];
  selectedRow: SupplierContacOutputSelectDto = new SupplierContacOutputSelectDto();
  @Input() supplierSiteId;
  @Input() supplierName;
  @Input() siteAddress; 
  @Input() supplierNumber; 
  @Input() supplierId;
  _supplierSiteId;
  constructor(
    injector: Injector,
    private _mstSupplierServiceProxy: MstSupplierServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.searchSupplierContact(0);
    this.gridColDef = [
      {
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 60,
      },
      {
        headerName: this.l('FullName'),
        headerTooltip: this.l('FullName'),
        field: 'fullName',
        width: 50,
      },
      {
        headerName: this.l('EmailAddress'),
        headerTooltip: this.l('EmailAddress'),
        field: 'emailAddress',
        width: 50,
      },
      {
        headerName: this.l('UserName'),
        headerTooltip: this.l('UserName'),
        field: 'userName',
        width: 30,
      },
      {
        headerName: this.l('PhoneNumber'),
        headerTooltip: this.l('PhoneNumber'),
        field: 'phone',
        width: 30,
      }
    ]
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new SupplierContacOutputSelectDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listSupplierContact) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchSupplierContact(this.supplierSiteId);
  }

  
  addContact() {
    if(this.supplierName == undefined ||  this.siteAddress == undefined )
    {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_In_List_Supplier_Site_To_Add_Contact))
    }
    else
    {
      this.createOrResetMstSupplierContact.show(0,this.supplierName, this.supplierNumber, this.supplierSiteId, this.siteAddress, 0, this.supplierId );
    }
    
  }

  edit(statusId) {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrResetMstSupplierContact.show(this.selectedRow.id, this.supplierName, this.supplierNumber, this.supplierSiteId, this.siteAddress, statusId, this.supplierId );
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_In_List_Contact_To_Reset_Password))
    }
  }

  searchSupplierContact(_supplierSiteId, supplierName?, supplierNumber?, _siteAddress?) {
    this._supplierSiteId = _supplierSiteId;
    this.spinnerService.show();
    this._mstSupplierServiceProxy.getAllSupplierContactBySupplierSiteId(_supplierSiteId, 
      this.paginationParams ? this.paginationParams.sorting : '',
      this.paginationParams ? this.paginationParams.pageSize : 20,
      this.paginationParams ? this.paginationParams.skipCount : 1)
      .pipe(finalize(() => {
        this.spinnerService.hide();
    }))
      .subscribe((result) => {
      this.listSupplierContact = result.items;
      this.gridParams.api.setRowData(this.listSupplierContact);
      this.paginationParams.totalCount = result.totalCount;
      this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
      this.gridParams.api.sizeColumnsToFit();
    });
    this.spinnerService.hide();
  }

  deleteContact() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      if(this.selectedRow.userName != null )
      {
        this.notify.warn('Supplier contact had an account, you can not delete it!');
        return;
      }
      else
      {
        this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
          if (isConfirmed) {
            this.spinnerService.show();
            this._mstSupplierServiceProxy.deleteContact(this.selectedRow.id).subscribe(val => {
              this.notify.success('Successfully Deleted');
              this.searchSupplierContact(this._supplierSiteId);
              this.spinnerService.hide();
            });
          }
        });
      }
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

}
