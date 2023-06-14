import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrcContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'create-contract-backdate-modal',
  templateUrl: './create-contract-backdate-modal.component.html',
  styleUrls: ['./create-contract-backdate-modal.component.less']
})
export class CreateContractBackdateModalComponent extends AppComponentBase implements OnInit {


  @Output() close = new EventEmitter<any>();
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  createOrEditForm: FormGroup;
  type: number;
  appendixId = 0;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private _serviceProxy: PrcContractTemplateServiceProxy,
  ) {
    super(injector);
   }

  ngOnInit(): void {

  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      noteOfBackdate: [undefined],
      expiryBackdate: [undefined],
    });
  }

  show(id: number) {
    this.appendixId = id;
    this.buildForm();
    this.createOrEditForm.get('id').setValue(id);
    this.modal.show();
  }


  closeModal() {  
    this.modal.hide();
    this.close.emit();
  }


  save() {
    this.spinnerService.show();
    this._serviceProxy.createRequestBackdate(this.createOrEditForm.getRawValue())
    .pipe(finalize(() => {
      this.spinnerService.hide();
    }))
    .subscribe(() => {
      this.notify.success(this.l('SavedSuccessfully'));
    })
  }

  reset() {

  }
}
