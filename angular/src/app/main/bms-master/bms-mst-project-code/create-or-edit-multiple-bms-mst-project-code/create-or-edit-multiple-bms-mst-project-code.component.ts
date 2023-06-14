import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment2ServiceProxy, BmsMstSegment4GroupServiceProxy, BmsPeriodVersionServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstSegment1Dto, MstSegment2Dto, MstUnitOfMeasureServiceProxy, ProjectCodeServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-multiple-bms-mst-project-code',
    templateUrl: './create-or-edit-multiple-bms-mst-project-code.component.html',
    styleUrls: ['./create-or-edit-multiple-bms-mst-project-code.component.less']
})
export class CreateOrEditMultipleBmsMstProjectCodeComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isSubmit = false;
    listPertiod: { value: number, label: string, }[] = [];
    listPertiodVersion: { value: number, label: string, }[] = [];
    listSegment1: { value: number, label: string, code: string }[] = [];
    listSegment2: { value: number, label: string, code: string }[] = [];
    valSeg1Required;
    valSeg2Required;
    projectCodeArray: string[] = [];
    gridColDefSegment1: CustomColDef[];
    gridColDefSegment2: CustomColDef[];
    defaultColDef: CustomColDef = {
        filter: false,
        sortable: false,
        suppressMenu: true,
        menuTabs: [],
        floatingFilter: true
    };
    
    seg1GridParams: GridParams | undefined;
    selectedSeg1Row: MstSegment1Dto = new MstSegment1Dto();
    selectedSeg1Rows: MstSegment1Dto[] = [];
    seg1RowData: any[]=[];
    seg1PaginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };

    seg2GridParams: GridParams | undefined;
    selectedSeg2Row: MstSegment2Dto = new MstSegment2Dto();
    selectedSeg2Rows: MstSegment2Dto[] = [];
    seg2RowData: any[]=[];
    seg2PaginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    constructor(
        injector: Injector,
        private _mainComponentServiceProxy: ProjectCodeServiceProxy,
        private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private _bmsPeriodVersionServiceProxy: BmsPeriodVersionServiceProxy,
        private _bmsMstSegment1ServiceProxy: BmsMstSegment1ServiceProxy,
        private _bmsMstSegment2ServiceProxy: BmsMstSegment2ServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);

    }

    ngOnInit(): void {
        this.getAllSeg1Data();
        this.getAllSeg2Data();
        this.selectDropDownPeriod();
        this.listPertiodVersion = [];
        this.gridColDefSegment1 = [
            {
                headerName: "",
                headerTooltip: "",
                field: "checked",
                headerClass: ["align-checkbox-header"],
                cellClass: ["check-box-center"],
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                maxWidth: 70
            },
            {
                headerName: this.l('Code'),
                headerTooltip: this.l('Code'),
                field: 'code', 
                minWidth: 200
              },
              {
                headerName: this.l('Name'),
                headerTooltip: this.l('Name'),
                field: 'name', 
                minWidth: 300
              },
        ];

        this.gridColDefSegment2 = [
            {
                headerName: "",
                headerTooltip: "",
                field: "checked",
                headerClass: ["align-checkbox-header"],
                cellClass: ["check-box-center"],
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                maxWidth: 70
            },
            {
                headerName: this.l('Code'),
                headerTooltip: this.l('Code'),
                field: 'code', 
                minWidth: 200
              },
              {
                headerName: this.l('Name'),
                headerTooltip: this.l('Name'),
                field: 'name', 
                minWidth: 300
              },
        ]
    }

    //Segment1
    onChangeSeg1Selection(params) {
        this.selectedSeg1Row =
           params.api.getSelectedRows()[0] ?? new MstSegment1Dto();
         this.selectedSeg1Row = Object.assign({}, this.selectedSeg1Row);
         this.selectedSeg1Rows = params.api.getSelectedRows();
         this.createOrEditForm.get('listSegment1Id').setValue(this.selectedSeg1Rows);
       }
    
       callBackSeg1Grid(params: GridParams) {
         this.seg1GridParams = params;
       }

       //Segment2
       onChangeSeg2Selection(params) {
        this.selectedSeg2Row =
           params.api.getSelectedRows()[0] ?? new MstSegment2Dto();
         this.selectedSeg2Row = Object.assign({}, this.selectedSeg2Row);
         this.selectedSeg2Rows = params.api.getSelectedRows();
         this.createOrEditForm.get('listSegment2Id').setValue(this.selectedSeg2Rows);
       }
    
       callBackSeg2Grid(params: GridParams) {
         this.seg2GridParams = params;
       }
    
       getAllSeg1Data() {
        this.seg1RowData=[];
        this.spinnerService.show();
        this._bmsMstSegment1ServiceProxy.getAllSegment1NoPage()
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe((result) => {
            this.seg1RowData = result;
          });
      }

      getAllSeg2Data() {
        this.seg2RowData=[];
        this.spinnerService.show();
        this._bmsMstSegment2ServiceProxy.getAllSegment2NoPage()
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe((result) => {
            this.seg2RowData = result;
          });
      }

    selectDropDownPeriod() {
        this._mstPeriodServiceProxy.getAllBmsPeriodNoPage('', 0, '', 20, 0).subscribe((result) => {
            this.listPertiod = [];
            this.listPertiod.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listPertiod.push({ value: ele.id, label: ele.periodName });
            });
        });
    }

    getListVersionByPeriodId(id) {
        this._bmsPeriodVersionServiceProxy.getAllVersionByPeriodIdNoPage(id).subscribe((result) => {
            this.listPertiodVersion = [];
            this.listPertiodVersion.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listPertiodVersion.push({ value: ele.id, label: ele.versionName });
            });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            periodVersionId: [undefined, GlobalValidator.required],
            periodId: [undefined, GlobalValidator.required],
            listSegment1Id: [undefined],
            listSegment2Id: [undefined],
        });
    }

    show(id?: number) {
        this.valSeg1Required = false;
        this.valSeg2Required = false;
        this.buildForm();
        this.modal.show();
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.isSubmit = true;
        if (this.submitBtn) {
            this.submitBtn.nativeElement.click();
        }
        if (this.createOrEditForm.invalid) {
            return;
        }

        this.spinnerService.show();
        this._mainComponentServiceProxy.saveMultiple(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(val => {
                if (val.valSeg1Required == true || val.valSeg2Required == true) {
                    this.valSeg1Required = val.valSeg1Required;
                    this.valSeg2Required = val.valSeg2Required;
                    return;
                }
                else {
                    this.valSeg1Required = false;
                    this.valSeg2Required = false;
                }
                this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                this.close.emit();
                this.modal.hide();
            });
    }
}
