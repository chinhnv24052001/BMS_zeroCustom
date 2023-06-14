import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstHrOrgStructureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'forward-purchase-request',
  templateUrl: './forward-purchase-request.component.html',
  styleUrls: ['./forward-purchase-request.component.less']
})
export class ForwardPurchaseRequestComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  createOrEditForm: FormGroup;
  isEdit = false;
  isSubmit = false;
  duplicateCode;
  listDepartments: { label: string, value: string | number }[] = [];
  listUsers: any[] = [];
  listUserForChoosing: any[] = [];
  listUsersComboboxs: { label: string, value: string | number }[] = [];


  constructor(
    injector: Injector,
    private _mstHrOrgStructureServiceProxy: MstHrOrgStructureServiceProxy,
    private formBuilder: FormBuilder,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.listDepartments = [];
    this._mstHrOrgStructureServiceProxy.getAllActive().subscribe((res) => {
      res.forEach((element) => {
        this.listDepartments.push({
          label: element.hrOrgStructureName,
          value: element.id,
        });
      });
    });

    this._mstHrOrgStructureServiceProxy.getUserByHrOrgStructureId().subscribe((res) => {
      this.listUsers = res;
      // res.forEach((element) => {
      //     this.listUsers.push({
      //         label: element.employeeName,
      //         value: element.id,
      //     });
      // });
    });
  }

  show() {
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
    this.notify.success(this.l('ForwardSuccsess'));
    this.modal.hide();
    this.close.emit();
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      departmentId: [undefined, GlobalValidator.required],
      picUserId: [undefined, GlobalValidator.required],
      description: [undefined],
    });

    this.createOrEditForm.get('departmentId').valueChanges.subscribe((val) => {
      this.listUserForChoosing = [];
      this.listUsersComboboxs = [];
      if (val && val != null && val != undefined && val != 0)
        this.listUserForChoosing = this.listUsers.filter(
          (e) => e.hrOrgStructureId == val!.toString().toLowerCase()
        );
      else this.listUserForChoosing = this.listUsers;
      this.listUserForChoosing.forEach((e) => {
        this.listUsersComboboxs.push({ value: e.hrOrgStructureId, label: e.employeeName });
      })
    });
  }


}
