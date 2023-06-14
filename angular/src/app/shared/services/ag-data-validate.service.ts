import { Injectable } from '@angular/core';
import { NotifyService } from 'abp-ng2-module';
// import { ToastService } from '../../swal-alert/toast.service';

@Injectable()
export class AgDataValidateService {
  constructor(
    private notify: NotifyService
  ) {
  }

  private validateEachRow(params, columnToValidate, displayedData, selectedData?) {
    const dataToValidate = selectedData ? selectedData : displayedData;

    for (let i = 0; i < dataToValidate.length; i++) {
      const rowIndex = selectedData ? displayedData.indexOf(selectedData[i]) : i;
      for (const key in columnToValidate) {
        // Required
        if (columnToValidate.hasOwnProperty(key)) {
          if (columnToValidate[key].validators.indexOf('required') > -1 && !dataToValidate[i][key]) {
            this.notify.warn(`Trường ${columnToValidate[key].headerName} là bắt buộc, kiểm tra lại dòng sô ${rowIndex + 1}`);
            params.api.setFocusedCell(rowIndex, key);
            return false;
          }

          // Number
          if (dataToValidate[i][key] && (columnToValidate[key].validators.indexOf('number') > -1 || columnToValidate[key].validators.indexOf('integerNumber') > -1)) {
            const NUMBER_REGEX = /^\d+$/g;
            if (!NUMBER_REGEX.test(dataToValidate[i][key].toString())) {
              this.notify.warn(`Chỉ được nhập số nguyên vào trường ${columnToValidate[key].headerName}, kiểm tra lại dòng sô ${rowIndex + 1}`);
              params.api.setFocusedCell(rowIndex, key);
              return false;
            }
          }

          // floatPositiveNum
          if (dataToValidate[i][key] && columnToValidate[key].validators.indexOf('floatPositiveNum') > -1) {
            const NUMBER_REGEX = /^(?=.*[0-9])\d*(?:\.\d{1,2})?$/g;
            if (!NUMBER_REGEX.test(dataToValidate[i][key].toString())) {
              this.notify.warn(`Sai định dạng số ở trường ${columnToValidate[key].headerName}, kiểm tra lại dòng sô ${rowIndex + 1}`);
              params.api.setFocusedCell(rowIndex, key);
              return false;
            }
          }

          // floatNumber
          // Accept both positive and negative numbers
          if (dataToValidate[i][key] && columnToValidate[key].validators.indexOf('floatNumber') > -1) {
            const NUMBER_REGEX = /^-?\d+(\.\d{0,2})?$/g;
            if (!NUMBER_REGEX.test(dataToValidate[i][key].toString())) {
              this.notify.warn(`Sai định dạng số ở trường ${columnToValidate[key].headerName}, kiểm tra lại dòng sô ${rowIndex + 1}`);
              params.api.setFocusedCell(rowIndex, key);
              return false;
            }
          }

          // Min-0
          if (dataToValidate[i][key] && columnToValidate[key].validators.indexOf('min-0') > -1) {
            if (parseFloat(dataToValidate[i][key]) <= 0) {
              this.notify.warn(`Bắt buộc nhập số lớn hơn 0 vào trường ${columnToValidate[key].headerName}, kiểm tra lại dòng sô ${rowIndex + 1}`);
              params.api.setFocusedCell(rowIndex, key);
              return false;
            }
          }

          // phoneFormat
          if (dataToValidate[i][key] && columnToValidate[key].validators.indexOf('phoneFormat') > -1) {
            const PHONE_REGEX = /^0[0-9]{9,10}$/g;
            if (!PHONE_REGEX.test(dataToValidate[i][key].toString())) {
              this.notify.warn(
                `Giá trị trường ${columnToValidate[key].headerName} không phải định dạng số điện thoại , kiểm tra lại dòng sô ${rowIndex + 1}`);
              params.api.setFocusedCell(rowIndex, key);
              return false;
            }
          }

          // maxLength
          if (dataToValidate[i][key] && columnToValidate[key].validators.indexOf(`maxLength`) > -1) {
            const maxLength = Number(columnToValidate[key].maxLength);
            if (dataToValidate[i][key].toString().trim().length > maxLength) {
              this.notify.warn(
                `Giá trị trường ${columnToValidate[key].headerName} dài quá số ký tự cho phép (${maxLength} kí tự) kiểm tra lại dòng số ${rowIndex + 1}`);
              params.api.setFocusedCell(rowIndex, key);
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  private getColumnToValidate(fieldGrid) {
    const columnToValidate = {};
    fieldGrid.forEach(colDef => {

      if (colDef.validators && colDef.validators.length > 0) {
        columnToValidate[colDef.field] = {headerName: colDef.headerName, validators: colDef.validators};
        if (colDef.maxLength) {
          columnToValidate[colDef.field] = Object.assign(columnToValidate[colDef.field], {maxLength: colDef.maxLength});
        }
      }
      if (colDef.children) {
        colDef.children.forEach(childColDef => {
          if (childColDef.validators && childColDef.validators.length > 0) {
            columnToValidate[childColDef.field] = {
              headerName: childColDef.headerName,
              validators: childColDef.validators,
            };
          }
          if (childColDef.maxLength) {
            columnToValidate[childColDef.field] = Object.assign(columnToValidate[childColDef.field], {maxLength: childColDef.maxLength});
          }
        });
      }
    });
    return columnToValidate;
  }

  validateDataGrid(params, fieldGrid, displayedData, selectedData?) {
    return selectedData ? this.validateEachRow(params, this.getColumnToValidate(fieldGrid), displayedData, selectedData)
      : this.validateEachRow(params, this.getColumnToValidate(fieldGrid), displayedData);
  }

  checkDuplicateData(dataToCheck, displayedData: Array<any>, fieldToCheck: { name: string, field: string }) {
    if (displayedData.length < 2) {
      return true;
    }
    const matchData = displayedData.find(data => data[fieldToCheck.field] === dataToCheck[fieldToCheck.field]);
    if (matchData) {
      const rowIndex = displayedData.indexOf(matchData);
      this.notify.warn(
        `${fieldToCheck.name} đã trùng với dòng ${rowIndex + 1}, vui lòng kiểm tra lại`);
    }
    return !matchData;
  }

  checkRequiredHiddenFields(params, displayedData: Array<object>, hiddenReqField: { name: string, field: string }) {
    for (const value of displayedData) {
      const rowIndex = displayedData.indexOf(value);
      if (!value[hiddenReqField.field]) {
        this.notify.warn(`${hiddenReqField.name} không tồn tại hoặc chưa được lấy từ bảng tìm kiếm, kiểm tra lại dòng ${rowIndex + 1}`);
        params.api.getModel().rowsToDisplay[rowIndex].setSelected(true);
        return false;
      }
    }
    return true;
  }

}
