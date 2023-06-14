// import { AppConsts } from './../../../../../shared/AppConsts';
// import { GetAllCatalogPriceForViewDto } from './../../../../../shared/service-proxies/service-proxies';
// import { CustomColDef, PaginationParamsModel } from './../../../../shared/models/base.model';
// import { TmssSelectGridModalComponent } from './../../../../shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
// import { ModalDirective } from 'ngx-bootstrap/modal';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MstCatalogPriceMgmtServiceProxy } from '@shared/service-proxies/service-proxies';
// import { finalize } from 'rxjs/operators';
// import { GlobalValidator } from '@shared/utils/validators';
// import { HttpClient } from '@angular/common/http';

// @Component({
//     selector: 'create-or-edit-catalog-price-modal',
//     templateUrl: './create-or-edit-catalog-price-modal.component.html',
//     styleUrls: ['./create-or-edit-catalog-price-modal.component.less']
// })
// export class CreateOrEditCatalogPriceModalComponent extends AppComponentBase {
//     @Input() currencies: { label: string, value: number | undefined }[] = [];
//     @Input() taxRates: { label: number | undefined, value: number | undefined }[] = [];
//     @Input() inventoryGroups: { label: string, value: number | undefined }[] = [];

//     @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
//     @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

//     @ViewChild('createOrEditCatalogPriceModal', { static: true }) modal!: ModalDirective;
//     @ViewChild('productsSelectPopup', { static: true }) productsSelectPopup!: TmssSelectGridModalComponent;
//     @ViewChild('supplierSelectPopup', { static: true }) supplierSelectPopup!: TmssSelectGridModalComponent;
//     @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;

//     paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, skipCount: 0, sorting: '', totalPage: 1 };

//     createOrEditForm: FormGroup;

//     productColDefs: CustomColDef[] = [];
//     supplierColDefs: CustomColDef[] = [];

//     isLoading: boolean = false;
//     isEdit: boolean = false;

//     products: any[] = [];
//     formData: FormData;
//     primaryImage: string = '';
//     subImages: string[] = [];
//     imageFiles = [];
//     urlBase: string = AppConsts.remoteServiceBaseUrl;

//     constructor(
//         injector: Injector,
//         private _formBuilder: FormBuilder,
//         private _serviceProxy: MstCatalogPriceMgmtServiceProxy,
//         private _http: HttpClient
//     ) {
//         super(injector);
//         this.productColDefs = [
//             {
//                 headerName: this.l('ProductCode'),
//                 headerTooltip: this.l('ProductCode'),
//                 field: 'partNo',
//                 flex: 0.5,
//             },
//             {
//                 headerName: this.l('ProductName'),
//                 headerTooltip: this.l('ProductName'),
//                 field: 'partName',
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('Color'),
//                 headerTooltip: this.l('Color'),
//                 field: 'color',
//                 flex: 0.4,
//             },
//         ];
//         this.supplierColDefs = [
//             {
//                 headerName: this.l('SupplierName'),
//                 headerTooltip: this.l('SupplierName'),
//                 field: 'supplierName',
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('SupplierCode'),
//                 headerTooltip: this.l('SupplierCode'),
//                 field: 'supplierCode',
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('SupplierTaxCode'),
//                 headerTooltip: this.l('SupplierTaxCode'),
//                 field: 'supplierTaxCode',
//                 flex: 1,
//             },
//         ]
//     }

//     ngOnInit() {
//     }

//     show(param?: GetAllCatalogPriceForViewDto) {
//         this.buildForm();
//         if (param) {
//             this.isEdit = true;
//             this.createOrEditForm.patchValue(param);
//         }
//         this.refreshAllFiles();
//         this.modal.show();
//     }

//     close() {
//         this.modalClose.emit(null);
//         this.isEdit = false;
//         this.modal.hide();
//     }

//     reset() {
//         this.createOrEditForm = undefined;
//     }

//     getAllProduct(productName: string, paginationParams: PaginationParamsModel) {
//         return this._serviceProxy.getAllProducts(
//             productName ?? '',
//             this.createOrEditForm.get('inventoryGroup').value,
//             paginationParams.sorting ?? '',
//             paginationParams.skipCount ?? 0,
//             paginationParams.pageSize ?? 20
//         );
//     }

//     getAllSupplier(supplierName: string, paginationParams: PaginationParamsModel) {
//         return this._serviceProxy.getAllSuppliers(
//             supplierName ?? '',
//             paginationParams.sorting ?? '',
//             paginationParams.skipCount ?? 0,
//             paginationParams.pageSize ?? 20
//         );
//     }


//     buildForm() {
//         this.createOrEditForm = this._formBuilder.group({
//             id: [0],
//             productId: [0],
//             productName: ['', GlobalValidator.required],
//             supplierId: [0],
//             supplierName: ['', GlobalValidator.required],
//             effectFrom: [undefined],
//             effectTo: [undefined],
//             contractPriceAmount: [undefined, Validators.compose([GlobalValidator.numberFormat, GlobalValidator.required])],
//             marketPriceAmount: [undefined, Validators.compose([GlobalValidator.numberFormat, GlobalValidator.required])],
//             taxPriceAmount: [undefined, Validators.compose([GlobalValidator.numberFormat, GlobalValidator.required])],
//             currencyId: [undefined, GlobalValidator.required],
//             inventoryGroup: [undefined],
//             productCode: [''],
//             colorCode: [''],
//             supplierCode: [''],
//             supplierTaxCode: [''],
//             fileName: ['']
//         });
//     }

//     productsPopup() {
//         this.productsSelectPopup.show(this.createOrEditForm.get('productName').value);
//     }

//     supplierPopup() {
//         this.supplierSelectPopup.show(this.createOrEditForm.get('supplierName').value);
//     }

//     validateBeforeSave() {
//         if (this.createOrEditForm.get('effectFrom').value > this.createOrEditForm.get('effectTo').value) {
//             this.notify.warn(this.l('CannotGreaterThan', this.l('EffectFrom'), this.l('EffectTo')));
//             return false;
//         };
//         return true;
//     }

//     save() {
//         if (!this.validateBeforeSave()) return;
//         if (this.submitBtn) {
//             this.submitBtn.nativeElement.click();
//         }
//         if (this.createOrEditForm.invalid) {
//             return;
//         }
//         this.spinnerService.show();
//         let body = Object.assign(this.createOrEditForm.getRawValue(), {
//             primaryImage: this.imageFiles[0]?.imageName ?? '',
//             subImage1: this.imageFiles[1]?.imageName ?? '',
//             subImage2: this.imageFiles[2]?.imageName ?? '',
//             subImage3: this.imageFiles[3]?.imageName ?? '',
//             subImage4: this.imageFiles[3]?.imageName ?? '',
//         })
//         this._serviceProxy.createOrEdit(body)
//             .pipe(finalize(() => {
//                 this.spinnerService.hide();
//                 this.modalSave.emit(null);
//                 this.modal.hide();
//             }))
//             .subscribe(res => {
//                 this.imageFiles.forEach(e => {
//                     this._http.post(`${this.urlBase}/UserImport/UploadCatalogImage`, e.files).subscribe();
//                 });
//                 this.notify.success(this.l('Successfully'));
//             });
//     }

//     patchProduct(event: any) {
//         this.createOrEditForm.get('productId').setValue(event.id);
//         this.createOrEditForm.get('productName').setValue(event.partName);
//         this.createOrEditForm.get('productCode').setValue(event.partNo);
//         this.createOrEditForm.get('colorCode').setValue(event.color);
//     }

//     patchSupplier(event: any) {
//         this.createOrEditForm.get('supplierId').setValue(event.id);
//         this.createOrEditForm.get('supplierName').setValue(event.supplierName);
//         this.createOrEditForm.get('supplierCode').setValue(event.supplierCode);
//         this.createOrEditForm.get('supplierTaxCode').setValue(event.supplierTaxCode);
//     }

//     onUpload(files: Array<any>, isPrimary: boolean, index: number | undefined): void {
//         if (files[0].name.split('.')[1] != 'jpg' && files[0].name.split('.')[1] != 'png') {
//             this.notify.warn('Tập tin tải lên không đúng định dạng(.jpg, .png). Vui lòng kiểm tra lại');
//             return;
//         }
//         if (files[0].size > 1048576 * 5) {
//             this.notify.warn('Dung lượng tập tin không được lớn hơn 5MB');
//             files = [];
//             return;
//         }
//         if (files.length > 0) {
//             this.formData = new FormData();
//             const formData: FormData = new FormData();
//             const file = files[0];
//             let serverName = '';
//             if (isPrimary) serverName = this.createOrEditForm.get('productId').value + '_' + 'priImg' + Date.now().toString() + '.' + file.name.split('.')[1];
//             else serverName = this.createOrEditForm.get('productId').value + '_' + `$subImg${index}` + Date.now().toString() + '.' + file.name.split('.')[1];
//             formData.append('file', file, serverName);
//             this.formData = formData;
//             this.imageFiles.push(Object.assign({
//                 files: this.formData,
//                 imageName: serverName
//             }))
//         }
//     }

//     uploadPrimaryImage() {
//         let input = document.createElement('input');
//         input.type = 'file';
//         input.className = 'd-none';
//         input.id = 'imgInput';
//         input.accept = 'image/*';
//         input.onchange = () => {
//             let files = Array.from(input.files);
//             this.onUpload(files, true, undefined);
//             this.createOrEditForm.get('fileName').setValue(files[0].name);
//             this.primaryImage = files[0].name;
//         };
//         input.click();
//     }

//     uploadSubImage() {
//         let input = document.createElement('input');
//         input.type = 'file';
//         input.className = 'd-none';
//         input.id = 'imgInput';
//         input.accept = 'image/*';
//         input.multiple = true;
//         input.onchange = () => {
//             let files = Array.from(input.files);
//             files.forEach((file, index) => {
//                 if (this.subImages.length == 4) this.notify.warn(this.l('OverAmount'))
//                 else if (this.subImages.findIndex(e => e == file.name) != -1)
//                 {
//                     this.notify.warn(this.l('ThisFileIsExisted'));
//                 }
//                 else{
//                     this.onUpload(files, false, index);
//                     this.createOrEditForm.get('fileName').setValue(file.name);
//                     this.subImages.push(files[0].name);
//                 }
//             })
//         };
//         input.click();
//     }

//     refreshAllFiles() {
//         this.primaryImage = '';
//         this.subImages = [];
//         this.imageFiles = [];
//     }

//     importFile() {
//         this.imageFiles.forEach(e => {
//             this._http.post(`${this.urlBase}/UserImport/UploadCatalogImage`, e.files).subscribe();
//         });
//     }
// }
