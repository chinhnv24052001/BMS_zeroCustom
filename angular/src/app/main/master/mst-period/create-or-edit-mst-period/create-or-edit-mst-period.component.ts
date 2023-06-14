import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'create-or-edit-mst-period',
  templateUrl: './create-or-edit-mst-period.component.html',
  styleUrls: ['./create-or-edit-mst-period.component.css']
})
export class CreateOrEditMstPeriodComponent extends AppComponentBase implements OnInit {
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  createOrEditForm: FormGroup;
  isEdit = true;
  inputText2Value = "";
  inputText2 = "";
  isSubmit = false;
  constructor(
    injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit(): void {
  }

  showModal() {
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
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      PeriodYear1: [undefined, GlobalValidator.required],
      PeriodYear2: [undefined, GlobalValidator.required],
      PeriodYear3: [undefined, GlobalValidator.required],
      IsCurrent: [undefined],
    });
  }

}
