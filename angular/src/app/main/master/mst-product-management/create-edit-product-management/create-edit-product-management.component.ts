import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    CommonGeneralCacheServiceProxy,
    InventoryItemsSearchOutputDto,
    MstInventoryGroupServiceProxy,
    MstInventoryItemsServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { FileUpload } from 'primeng/fileupload';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { trim } from 'lodash-es';

@Component({
    selector: 'create-edit-product-management',
    templateUrl: './create-edit-product-management.component.html',
    styleUrls: ['./create-edit-product-management.component.less'],
})
export class CreateEditProductManagementComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: InventoryItemsSearchOutputDto = new InventoryItemsSearchOutputDto();
    @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listInventoryGroup: { label: string; value: number | undefined }[] = [];
    listCatalog: { label: string; value: number | undefined }[] = [];
    listInventoryGroupFull;
    listStatus = [
        { label: this.l('Active'), value: 1 },
        { label: this.l('InActive'), value: 0 },
    ];
    listVendor = [];
    listCurrency = [];
    listUnitOfMeasure = [];
    pathFile;
    checkSource: boolean = false;
    urlImage;
    fileBase64Image;
    isView = false;

    constructor(
        injector: Injector,
        private _mstInventoryItemsServiceProxy: MstInventoryItemsServiceProxy,
        private _mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private formBuilder: FormBuilder,
        private _httpClient: HttpClient,
        private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    ) {
        super(injector);
        this.urlImage = AppConsts.remoteServiceBaseUrl + '/ImportExcel/UploadImage';
    }

    ngOnInit(): void {
        // get list inventory group
        this.listCatalog = [];
        this.commonGeneralCacheServiceProxy.getAllCatalog().subscribe((res) => {
            res.forEach(e => this.listCatalog.push({ label: e.catalogName, value: e.id }))
        })
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            partNo: [undefined],
            partNoCPS: [undefined],
            color: ['00'],
            inventoryGroupId: [undefined],
            partName: [undefined],
            supplierId: [undefined],
            primaryUnitOfMeasure: [undefined],
            partNameSupplier: [undefined],
            unitPrice: [undefined],
            taxPrice: [undefined],
            currencyId: [undefined],
            catalog: [undefined],
            // costOfSalesAccount: [undefined],
            // expenseAccount: [undefined],
            // salesAccount: [undefined],
            effectiveFrom: [undefined],
            effectiveTo: [undefined],
            isActive: 1,
            primaryUomCode: [undefined],
            imageFileName: [undefined],
            base64Image: [undefined],

            producer: [undefined],
            origin: [undefined],
            howToPack: [undefined],
            availableTime: [undefined],
            priority: [undefined],
            safetyStockLevel: [undefined],
            minimumQuantity: [undefined],
            factoryUse: [undefined],
            convertionUnitOfCode: [undefined],
            material: [undefined],
            length: [undefined],
            unitLength: [undefined],
            width: [undefined],
            unitWidth: [undefined],
            height: [undefined],
            unitHeight: [undefined],
            weight: [undefined],
            unitWeight: [undefined],

        });
    }

    add() {
        this.getCache();
        this.isView = false;
        this.fileBase64Image = '';
        this.isEditForm = false;
        this.checkSource = false;
        this.buildForm();
        this.modal.show();
    }

    show() {
        this.getCache();
        this.isView = false;
        this.isEditForm = true;
        this.fileBase64Image = '';
        this._mstInventoryItemsServiceProxy
            .getFileByteImage(this.selectedRow.id)
            .subscribe((val) => {
                this.fileBase64Image = val;
                if (this.selectedRow.source != 'CPS') {
                    this.checkSource = true;
                }
                else {
                    this.checkSource = false;
                }
                this.isEditForm = true;
                this.createOrEditForm = this.formBuilder.group({
                    id: this.selectedRow.id,
                    partNo: this.selectedRow.partNo,
                    partNoCPS: this.selectedRow.partNoCPS,
                    color: this.selectedRow.color,
                    inventoryGroupId: this.selectedRow.inventoryGroupId,
                    partName: this.selectedRow.partName,
                    supplierId: this.selectedRow.supplierId,
                    primaryUnitOfMeasure: this.selectedRow.primaryUnitOfMeasure,
                    partNameSupplier: this.selectedRow.partNameSupplier,
                    unitPrice: this.selectedRow.unitPrice,
                    taxPrice: this.selectedRow.taxPrice,
                    currencyId: this.selectedRow.currencyId,
                    catalog: this.selectedRow.catalog,
                    // costOfSalesAccount: this.selectedRow.costOfSalesAccount,
                    // expenseAccount: this.selectedRow.expenseAccount,
                    // salesAccount: this.selectedRow.salesAccount,
                    effectiveFrom: this.selectedRow.effectiveFrom,
                    effectiveTo: this.selectedRow.effectiveTo,
                    isActive: this.selectedRow.isActive,
                    primaryUomCode: this.selectedRow.primaryUomCode,
                    imageFileName: this.selectedRow.imageFileName,

                    producer: this.selectedRow.producer,
                    origin: this.selectedRow.origin,
                    howToPack: this.selectedRow.howToPack,
                    availableTime: this.selectedRow.availableTime,
                    priority: this.selectedRow.priority,
                    safetyStockLevel: this.selectedRow.safetyStockLevel,
                    minimumQuantity: this.selectedRow.minimumQuantity,
                    factoryUse: this.selectedRow.factoryUse,
                    convertionUnitOfCode: this.selectedRow.convertionUnitOfCode,
                    material: this.selectedRow.material,
                    length: this.selectedRow.length,
                    unitLength: this.selectedRow.unitLength,
                    width: this.selectedRow.width,
                    unitWidth: this.selectedRow.unitWidth,
                    height: this.selectedRow.height,
                    unitHeight: this.selectedRow.unitHeight,
                    weight: this.selectedRow.weight,
                    unitWeight: this.selectedRow.unitWeight,
                });
            });
        this.modal.show();
    }

    view() {
        this.getCache();
        this.isEditForm = true;
        this.fileBase64Image = '';
        this.isView = true;
        this._mstInventoryItemsServiceProxy
            .getFileByteImage(this.selectedRow.id)
            .subscribe((val) => {
                this.fileBase64Image = val;
                if (this.selectedRow.source != 'MANUAL') {
                    this.checkSource = true;
                }
                else {
                    this.checkSource = false;
                }
                this.isEditForm = true;
                this.createOrEditForm = this.formBuilder.group({
                    id: this.selectedRow.id,
                    partNo: this.selectedRow.partNo,
                    partNoCPS: this.selectedRow.partNoCPS,
                    color: this.selectedRow.color,
                    inventoryGroupId: this.selectedRow.inventoryGroupId,
                    partName: this.selectedRow.partName,
                    supplierId: this.selectedRow.supplierId,
                    primaryUnitOfMeasure: this.selectedRow.primaryUnitOfMeasure,
                    partNameSupplier: this.selectedRow.partNameSupplier,
                    unitPrice: this.selectedRow.unitPrice,
                    taxPrice: this.selectedRow.taxPrice,
                    currencyId: this.selectedRow.currencyId,
                    catalog: this.selectedRow.catalog,
                    // costOfSalesAccount: this.selectedRow.costOfSalesAccount,
                    // expenseAccount: this.selectedRow.expenseAccount,
                    // salesAccount: this.selectedRow.salesAccount,
                    effectiveFrom: this.selectedRow.effectiveFrom,
                    effectiveTo: this.selectedRow.effectiveTo,
                    isActive: this.selectedRow.isActive,
                    primaryUomCode: this.selectedRow.primaryUomCode,
                    imageFileName: this.selectedRow.imageFileName,
                    base64Image: this.fileBase64Image,

                    producer: this.selectedRow.producer,
                    origin: this.selectedRow.origin,
                    howToPack: this.selectedRow.howToPack,
                    availableTime: this.selectedRow.availableTime,
                    priority: this.selectedRow.priority,
                    safetyStockLevel: this.selectedRow.safetyStockLevel,
                    minimumQuantity: this.selectedRow.minimumQuantity,
                    factoryUse: this.selectedRow.factoryUse,
                    convertionUnitOfCode: this.selectedRow.convertionUnitOfCode,
                    material: this.selectedRow.material,
                    length: this.selectedRow.length,
                    unitLength: this.selectedRow.unitLength,
                    width: this.selectedRow.width,
                    unitWidth: this.selectedRow.unitWidth,
                    height: this.selectedRow.height,
                    unitHeight: this.selectedRow.unitHeight,
                    weight: this.selectedRow.weight,
                    unitWeight: this.selectedRow.unitWeight,
                });
            });
        this.modal.show();
    }

    // view() {
    //     this.isView = true;
    //     this.isEditForm = true;
    //     this.fileBase64Image = '';
    //     this._mstInventoryItemsServiceProxy
    //         .getFileByteImage(this.selectedRow.id)
    //         .subscribe((val) => {
    //             this.fileBase64Image = val;
    //             this.isEditForm = true;
    //             this.createOrEditForm = this.formBuilder.group({
    //                 id: this.selectedRow.id,
    //                 partNo: this.selectedRow.partNo,
    //                 partNoCPS: this.selectedRow.partNoCPS,
    //                 color: this.selectedRow.color,
    //                 inventoryGroupId: this.selectedRow.inventoryGroupId,
    //                 partName: this.selectedRow.partName,
    //                 supplierId: this.selectedRow.supplierId,
    //                 primaryUnitOfMeasure: this.selectedRow.primaryUnitOfMeasure,
    //                 partNameSupplier: this.selectedRow.partNameSupplier,
    //                 unitPrice: this.selectedRow.unitPrice,
    //                 taxPrice: this.selectedRow.taxPrice,
    //                 currencyId: this.selectedRow.currencyId,
    //                 // costOfSalesAccount: this.selectedRow.costOfSalesAccount,
    //                 // expenseAccount: this.selectedRow.expenseAccount,
    //                 // salesAccount: this.selectedRow.salesAccount,
    //                 effectiveFrom: this.selectedRow.effectiveFrom,
    //                 effectiveTo: this.selectedRow.effectiveTo,
    //                 isActive: this.selectedRow.isActive,
    //                 primaryUomCode: this.selectedRow.primaryUomCode,
    //                 imageFileName: this.selectedRow.imageFileName,
    //                 base64Image: this.fileBase64Image,

    //                 producer: this.selectedRow.producer,
    //                 origin: this.selectedRow.origin,
    //                 howToPack: this.selectedRow.howToPack,
    //                 availableTime: this.selectedRow.availableTime,
    //                 priority: this.selectedRow.priority,
    //                 safetyStockLevel: this.selectedRow.safetyStockLevel,
    //                 minimumQuantity: this.selectedRow.minimumQuantity,
    //                 factoryUse: this.selectedRow.factoryUse,
    //                 convertionUnitOfCode: this.selectedRow.convertionUnitOfCode,
    //                 material: this.selectedRow.material,
    //                 length: this.selectedRow.length,
    //                 unitLength: this.selectedRow.unitLength,
    //                 width: this.selectedRow.width,
    //                 unitWidth: this.selectedRow.unitWidth,
    //                 height: this.selectedRow.height,
    //                 unitHeight: this.selectedRow.unitHeight,
    //                 weight: this.selectedRow.weight,
    //                 unitWeight: this.selectedRow.unitWeight,
    //             });
    //         });
    //     this.modal.show();
    // }

    closeModel() {
        if (!this.isEditForm)
            this.selectedRow = null;
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        if (this.validate()) {
            this.isSubmit = true;
            if (this.submitBtn) {
                this.submitBtn.nativeElement.click();
            }
            this.spinnerService.show();
            if (this.isEditForm) {

                this._mstInventoryItemsServiceProxy
                    .mstProductMngtUpdate(this.createOrEditForm.getRawValue())
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                      }))
                    .subscribe((val) => {
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.updateAfterEdit.emit();
                    });
            } else {
                this._mstInventoryItemsServiceProxy
                    .mstProductMngtInsert(this.createOrEditForm.getRawValue())
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                      }))
                    .subscribe((val) => {
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.updateAfterEdit.emit();
                    });
            }
        }
    }

    getCache() {
        this.listVendor = [];
        this.listCurrency = [];
        this.listUnitOfMeasure = [];
        this.listInventoryGroup = [];
        this._mstInventoryItemsServiceProxy.getAllVendor().subscribe((res) => {
            res.forEach((element) => {
                this.listVendor.push({ label: element.supplierName, value: element.id });
            });
        });
        this._mstInventoryItemsServiceProxy.getAllCurrency().subscribe((res) => {
            res.forEach((element) => {
                this.listCurrency.push({ label: element.code, value: element.id });
            });
        });
        this._mstInventoryItemsServiceProxy.getAllMstUnitOfMeasure().subscribe((res) => {
            res.forEach((element) => {
                this.listUnitOfMeasure.push({ label: element.code, value: element.name, name: element.code });
            });
        });
        this._mstInventoryItemsServiceProxy.getAllInventoryGroup().subscribe((res) => {
            this.listInventoryGroupFull = res;
            res.forEach((element) => {
                this.listInventoryGroup.push({ label: element.inventoryGroupName, value: element.id });
            });
        });

    }

    setPrimaryUomCode() {
        const unitOfMeasure = this.listUnitOfMeasure.find(x => x.value == this.createOrEditForm.get('primaryUnitOfMeasure').value);
        this.createOrEditForm.get('primaryUomCode').setValue(unitOfMeasure.name);
    }

    setPartNoCPS() {
        if (!this.isEditForm)
            this.createOrEditForm.get('partNoCPS').setValue(this.createOrEditForm.get('partNo').value);
    }

    uploadImage(evt: any): void {
        const formData: FormData = new FormData();
        const file = evt.target.files[0];
        formData.append('file', file, file.name);
        // formData.append('productId', this.requestId.toString());
        this.spinnerService.show();
        this._httpClient
            .post<any>(this.urlImage, formData)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(response => {
                if (response.success) {
                    this.fileBase64Image = response.result.report;
                    this.createOrEditForm.get('base64Image').setValue(response.result.report);
                }
                else if (response.error != null) {
                    this.notify.warn(this.l('Fail to upload image!'));
                }
            });
    }
    resetInput() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = '';
            this.InputVar.nativeElement.click();
        }, 500);
    }

    validate() {
        if (this.createOrEditForm.get('inventoryGroupId').value == '' || this.createOrEditForm.get('inventoryGroupId').value == null || this.createOrEditForm.get('inventoryGroupId').value == undefined) {
            this.notify.warn('Please check Inventory Group!');
            return false;
        }
        if (this.createOrEditForm.get('partName').value == '' || this.createOrEditForm.get('partName').value == null || this.createOrEditForm.get('partName').value == undefined) {
            this.notify.warn('Please check Part name!');
            return false;
        }
        // if (this.createOrEditForm.get('supplierId').value == '' || this.createOrEditForm.get('supplierId').value == null || this.createOrEditForm.get('supplierId').value == undefined) {
        //     this.notify.warn('Please check Vendor!');
        //     return false;
        // }
        if (this.createOrEditForm.get('primaryUnitOfMeasure').value == '' || this.createOrEditForm.get('primaryUnitOfMeasure').value == null || this.createOrEditForm.get('primaryUnitOfMeasure').value == undefined) {
            this.notify.warn('Please check Unit Of Measure!');
            return false;
        }
        if (this.createOrEditForm.get('effectiveFrom').value > this.createOrEditForm.get('effectiveTo').value) {
            this.notify.warn('Please check Effective From and Effective To!');
            return false;
        }
        if (this.createOrEditForm.get('unitPrice').value < 0 || this.createOrEditForm.get('taxPrice').value < 0) {
            this.notify.warn('Please check Unit Price and Tax Price!');
            return false;
        }
        return true;
    }

    setCode() {
        let code = this.listInventoryGroupFull.find(x => x.id == this.createOrEditForm.get('inventoryGroupId').value);
        this.createOrEditForm.get('partNo').setValue(trim(code.codeHeader) + (Number(code.currentNum) + 1).toString().padStart(code.endNum.toString().length, '0'));
        this.createOrEditForm.get('partNoCPS').setValue(trim(code.codeHeader) + (Number(code.currentNum) + 1).toString().padStart(code.endNum.toString().length, '0'));
    }
}
