import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PurchaseRequestServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'import-purchase-request',
  templateUrl: './import-purchase-request.component.html',
  styleUrls: ['./import-purchase-request.component.less']
})
export class ImportPurchaseRequestComponent extends AppComponentBase implements OnInit {

  @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;
  @Output() close = new EventEmitter<any>();
  createOrEditForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listContractCatalog;
  selectedRow;
  listRecordImports;
  fileName: string;
  uploadData = [];
  formData: FormData = new FormData();
  processInfo: any[] = [];
  uploadUrl: string;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private _http: HttpClient,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
    private _fileDownloadService: FileDownloadService,
    private dataFormatService: DataFormatService,
  ) {
    super(injector);
    this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/ImportPr/ImportPrFromExcel';
  }

  ngOnInit(): void {
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('Remark'),
        headerTooltip: this.l('Remark'),
        field: 'remark',
        cellClass: ['cell-border'],
        width: 350,
      },
      {
        headerName: this.l('ProductCode'),
        headerTooltip: this.l('ProductCode'),
        field: 'productCode',
        cellClass: ['cell-border'],
        width: 150,
      },
      {
        headerName: this.l('ProductName'),
        headerTooltip: this.l('ProductName'),
        field: 'productName',
        cellClass: ['cell-border'],
        width: 150,
      },
      {
        headerName: this.l('UnitPrice'),
        headerTooltip: this.l('UnitPrice'),
        field: 'unitPrice',
        cellClass: ['cell-border'],
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
        width: 100,
      },
      {
        headerName: this.l('Uom'),
        headerTooltip: this.l('Uom'),
        field: 'uom',
        cellClass: ['cell-border'],
        width: 80,
      },
      {
        headerName: this.l('OrganizationCode'),
        headerTooltip: this.l('OrganizationCode'),
        field: 'organizationCode',
        cellClass: ['cell-border'],
        width: 120,
      },
      {
        headerName: this.l('Location'),
        headerTooltip: this.l('Location'),
        field: 'location',
        cellClass: ['cell-border'],
        validators: ['required'],
        width: 120,
      },
      {
        headerName: this.l('BudgetCode'),
        headerTooltip: this.l('BudgetCode'),
        field: 'budgetCode',
        cellClass: ['cell-border'],
        width: 200,
      },
      {
        headerName: this.l('N1'),
        headerTooltip: this.l('MonthN1'),
        field: 'monthN1',
        cellClass: ['cell-border'],
        width: 70,
      },
      {
        headerName: this.l('N2'),
        headerTooltip: this.l('MonthN2'),
        field: 'monthN2',
        cellClass: ['cell-border'],
        width: 70,
      },
      {
        headerName: this.l('N3'),
        headerTooltip: this.l('MonthN3'),
        field: 'monthN3',
        cellClass: ['cell-border'],
        width: 70,
      },
      {
        headerName: this.l('VendorName'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        cellClass: ['cell-border'],
        width: 250,
      },
      {
        headerName: this.l('VendorSite'),
        headerTooltip: this.l('VendorSite'),
        field: 'vendorSite',
        cellClass: ['cell-border'],
        width: 150,
      },
      {
        headerName: this.l('Delivery1'),
        headerTooltip: this.l('Delivery1'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery1) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery2'),
        headerTooltip: this.l('Delivery2'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery2) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery3'),
        headerTooltip: this.l('Delivery3'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery3) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery4'),
        headerTooltip: this.l('Delivery4'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery4) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery5'),
        headerTooltip: this.l('Delivery5'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery5) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery6'),
        headerTooltip: this.l('Delivery6'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery6) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery7'),
        headerTooltip: this.l('Delivery7'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery7) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery8'),
        headerTooltip: this.l('Delivery8'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery8) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery9'),
        headerTooltip: this.l('Delivery9'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery9) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery10'),
        headerTooltip: this.l('Delivery10'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery10) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery11'),
        headerTooltip: this.l('Delivery11'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery11) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery12'),
        headerTooltip: this.l('Delivery12'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery12) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery13'),
        headerTooltip: this.l('Delivery13'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery13) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery14'),
        headerTooltip: this.l('Delivery14'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery14) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery15'),
        headerTooltip: this.l('Delivery15'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery15) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery16'),
        headerTooltip: this.l('Delivery16'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery16) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery17'),
        headerTooltip: this.l('Delivery17'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery17) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery18'),
        headerTooltip: this.l('Delivery18'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery18) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery19'),
        headerTooltip: this.l('Delivery19'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery19) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery20'),
        headerTooltip: this.l('Delivery20'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery20) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery21'),
        headerTooltip: this.l('Delivery21'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery21) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery22'),
        headerTooltip: this.l('Delivery22'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery22) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery23'),
        headerTooltip: this.l('Delivery23'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery23) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery24'),
        headerTooltip: this.l('Delivery24'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery24) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery25'),
        headerTooltip: this.l('Delivery25'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery25) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery26'),
        headerTooltip: this.l('Delivery26'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery26) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery27'),
        headerTooltip: this.l('Delivery27'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery27) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery28'),
        headerTooltip: this.l('Delivery28'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery28) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery29'),
        headerTooltip: this.l('Delivery29'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery29) : 0,
        width: 80
    },
    {
        headerName: this.l('Delivery30'),
        headerTooltip: this.l('Delivery30'),
        cellClass: ['text-right'],
        valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery30) : 0,
        width: 80
    },
    ];
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0];
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listContractCatalog) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    // this.searchContractCatalog();
  }

  // buildForm() {
  //   this.createOrEditForm = this.formBuilder.group({
  //     fileName: [undefined]
  //   });
  // }

  exportTemplate() {
    this.spinnerService.show();
    this.purchaseRequestServiceProxy
      .exportTemplate()
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe((res) => {
        this._fileDownloadService.downloadTempFile(res);
      });
  }

  closeModel() {
    this.modal.hide();
  }

  reset() {
    setTimeout(() => {
      this.InputVar.nativeElement.value = "";
      this.fileName = '';
      this.InputVar.nativeElement.click();
    }, 50);
  }

  onUpload(data: { target: { files: Array<any> } }): void {
    if (data?.target?.files.length > 0) {
      this.formData = new FormData();
      const formData: FormData = new FormData();
      const file = data?.target?.files[0];
      this.fileName = file?.name;
      formData.append('file', file, file.name);
      this.formData = formData;
    }
  }

  show() {
    this.fileName = '';
    // this.processInfo = [];
    this.uploadData = [];
    this.modal.show();
    this.gridParams.api.setRowData([]);
  }

  save() {
    let warning: boolean = false;
    if (this.uploadData.findIndex(e => e.remark != null) != -1) {
      this.notify.warn(this.l('DataHasErrorPleaseCheckAgain'));
      return warning = true;
    };
    if (warning) return;
    else {
      this.spinnerService.show();
      this.purchaseRequestServiceProxy.saveDataFromImportExcel()
        .pipe(finalize(() => {
          this.spinnerService.hide();
        }))
        .subscribe((res) => {
          this.notify.success(this.l('SuccessfullyCreatedPr', res))
          this.modal.hide();
          this.close.emit();
        })
    }

  }

  refresh() {
    this.uploadData = [];
    this.gridParams.api.setRowData([]);
    this.fileName = '';
  }

  downloadTemplate() {

  }

  upload() {
    this.uploadData = [];
    this.processInfo = [];
    // this.isLoading = true;
    this.spinnerService.show();
    this._http
      .post<any>(this.uploadUrl, this.formData)
      .pipe(finalize(() => {
        this.excelFileUpload?.clear();
        this.spinnerService.hide();
      }))
      .subscribe(response => {
        if (response.success && response.result.prs) {
          this.uploadData = response.result.prs;
          this.notify.success('Tải lên tệp thành công');
        } else if (response.error != null || !response.result.prs) {
          this.notify.warn('Dữ liệu không hợp lệ');
        }
        if (this.uploadData?.length < 1) return this.notify.warn('Dữ liệu không hợp lệ');
        this.gridParams.api.setRowData(this.uploadData);
      });
  }

}
