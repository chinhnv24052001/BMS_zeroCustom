using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Users;
using tmss.Common;
using tmss.InvoiceModule;
using tmss.InvoiceModule.Dto;
using tmss.Master;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.PaymentModule.Invoices;

namespace tmss.PR
{
    public class InvoiceAppService : tmssAppServiceBase, IInvoiceAppService
    {
        private readonly IDapperRepository<User, long> _dapper;
        private readonly IRepository<InvoiceHeaders, long> _invoiceRepo;
        private readonly IRepository<MstCancelReason, long> _cancelReasonRepo;
        private readonly IRepository<MstSuppliers, long> _supRepo;
        private readonly IRepository<InvoiceLines, long> _invoiceLine;

        public InvoiceAppService(
            IDapperRepository<User, long> dapper,
            IRepository<InvoiceHeaders, long> invoiceRepo,
            IRepository<MstCancelReason, long> cancelReasonRepo,
            IRepository<MstSuppliers, long> supRepo,
            IRepository<InvoiceLines, long> invoiceLine
            )
        {
            _dapper = dapper;
            _invoiceRepo = invoiceRepo;
            _cancelReasonRepo = cancelReasonRepo;
            _supRepo = supRepo;
            _invoiceLine = invoiceLine;
        }

        #region -- Tìm kiếm hóa đơn
        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Search)]
        public async Task<PagedResultDto<SearchInvoiceOutputDto>> getInvoiceSearch(SearchInvoiceInputDto input)
        {
            string _sql = @"EXEC sp_InvSearchInvoice
                            @p_invoice_num,
                            @p_invoice_symbol,
                            @p_vendor_id,
                            @p_from_date,
                            @p_to_date,
                            @p_status, 
                            @p_source,
                            @p_create_invoice_date,
                            @p_puchase_order_no,
                            @p_vat_registration_invoice,
                            @p_pic_user_id,
                            @MaxResultCount,
                            @SkipCount";
            var list = (await _dapper.QueryAsync<SearchInvoiceOutputDto>(_sql, new
            {
                @p_invoice_num = input.InvoiceNum,
                @p_invoice_symbol = input.InvoiceSymbol,
                @p_vendor_id = input.VendorId,
                @p_from_date = input.FromDate,
                @p_to_date = input.ToDate,
                @p_status = input.Status,
                @p_source = input.Source,
                @p_create_invoice_date = input.CreateInvoiceDate,
                @p_puchase_order_no = input.PoNumber,
                @p_vat_registration_invoice = input.VatRegistrationInvoice,
                @p_pic_user_id = input.PicUserId,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount
            })).ToList();

            int totalCount = 0;
            if (list != null && list.Count() > 0)
            {
                totalCount = (int)list[0].TotalCount;
            }
            return new PagedResultDto<SearchInvoiceOutputDto>(
                       totalCount,
                       list.ToList()
                      );
        }
        #endregion

        #region -- Lấy thông tin chi tiết hóa đơn
        public async Task<List<SearchInvoiceOutputDetailDto>> getInvoiceSearchDetail(long invoiceId, string status)
        {
            string _sql = "EXEC sp_InvSearchInvoiceDetail @p_invoiceId,@p_status";
            var list = (await _dapper.QueryAsync<SearchInvoiceOutputDetailDto>(_sql, new
            {
                @p_invoiceId = invoiceId,
                @p_status = status
            })).ToList();

            return list;
        }
        #endregion

        #region -- Lấy thông tin đơn hàng theo NCC
        public async Task<List<GetPoVendorDto>> getPoVendorById(long vendorId, string removeId)
        {
            string _sql = "EXEC sp_InvGetPOByVendor @p_vendor_id, @p_remove_id";
            var list = (await _dapper.QueryAsync<GetPoVendorDto>(_sql, new
            {
                @p_vendor_id = vendorId,
                @p_remove_id = removeId
            })).ToList();

            return list;
        }
        #endregion

        #region -- Lấy danh sách NCC
        public async Task<List<VendorComboboxDto>> getAllVendor()
        {
            string _sql = "EXEC sp_MstSuppliersGetVendor ";
            var list = (await _dapper.QueryAsync<VendorComboboxDto>(_sql, new
            {
            })).ToList();

            return list;
        }
        #endregion

        #region -- Lấy thông tin cache
        public async Task<List<MasterLookupDto>> getStatus()
        {
            string _sql = "EXEC sp_getAllInvStatus ";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();
            return list;
        }
        public async Task<List<CurrencyComboboxDto>> getAllCurrency()
        {
            string _sql = "EXEC sp_MstCurrencyGetAll ";
            var list = (await _dapper.QueryAsync<CurrencyComboboxDto>(_sql, new
            {
            })).ToList();

            return list;
        }
        #endregion

        #region -- Lưu hóa đơn
        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Add, AppPermissions.InvoiceItems_Invoices_Edit)]
        public async Task<string> SaveInvoice(SearchInvoiceOutputDto input)
        {
            var list = new SearchInvoiceOutputDto();


            if (input.Id == null || input.Id == 0)
            {
                string checkExists = "EXEC sp_InvCheckExists @p_invoice_num, @p_invoice_symbol, @p_vendor_id";

                var check = (await _dapper.QueryAsync<SearchInvoiceOutputDto>(checkExists, new
                {
                    p_invoice_num = input.InvoiceNum,
                    p_invoice_symbol = input.InvoiceSymbol,
                    p_vendor_id = input.VendorId
                })).ToList();
                if (check[0].TotalCount > 0)
                {
                    return "Error: Exists this Invoice Num";
                }

                string _sql = @"EXEC Sp_InvInsertHeader
                                @p_InvoiceNum,
                                @p_InvoiceSymbol,
                                @p_Description,
                                @p_invoice_date,
                                @p_VendorId,
                                @p_VendorName,
                                @p_VendorNumber,
                                @p_CurrencyCode,
                                @p_Rate,
                                @p_InvoiceAmount,
                                @p_VatAmount,
                                @p_TaxName,
                                @p_TaxRate,
                                @p_user,
                                @p_Status,
                                @p_Source,
                                @p_LookupCode,
                                @p_LookupLink";

                list = (await _dapper.QueryAsync<SearchInvoiceOutputDto>(_sql, new
                {
                    @p_InvoiceNum = input.InvoiceNum,
                    @p_InvoiceSymbol = input.InvoiceSymbol,
                    @p_Description = input.Description,
                    @p_invoice_date = input.InvoiceDate,
                    @p_VendorId = input.VendorId,
                    @p_VendorName = input.VendorName,
                    @p_VendorNumber = input.VendorNumber,
                    @p_CurrencyCode = input.CurrencyCode,
                    @p_Rate = input.Rate,
                    @p_InvoiceAmount = input.TotalAmount,
                    @p_VatAmount = input.TotalTaxAmount,
                    @p_TaxName = input.TaxName,
                    @p_TaxRate = input.TaxRate,
                    @p_user = AbpSession.UserId,
                    @p_Status = input.Status,
                    @p_Source = input.Source,
                    @p_LookupCode = input.LookupCode,
                    @p_LookupLink = input.LookupLink
                })).FirstOrDefault();
            }
            else
            {
                string _sql = @"EXEC Sp_InvUpdateHeader
                                @p_invoice_id,
                                @p_InvoiceSymbol,
                                @p_Description,
                                @p_invoice_date,
                                @p_CurrencyCode,
                                @p_Rate,
                                @p_InvoiceAmount,
                                @p_VatAmount,
                                @p_TaxName,
                                @p_TaxRate,
                                @p_user,
                                @p_Status,
                                @p_Source,
                                @p_LookupCode,
                                @p_LookupLink,
                                @p_VendorId,
                                @p_VendorName,
                                @p_VendorNumber
                                ";

                list = (await _dapper.QueryAsync<SearchInvoiceOutputDto>(_sql, new
                {
                    @p_invoice_id = input.Id,
                    @p_InvoiceSymbol = input.InvoiceSymbol,
                    @p_Description = input.Description,
                    @p_invoice_date = input.InvoiceDate,
                    @p_CurrencyCode = input.CurrencyCode,
                    @p_Rate = input.Rate,
                    @p_InvoiceAmount = input.TotalAmount,
                    @p_VatAmount = input.TotalTaxAmount,
                    @p_TaxName = input.TaxName,
                    @p_TaxRate = input.TaxRate,
                    @p_user = AbpSession.UserId,
                    @p_Status = input.Status,
                    @p_Source = input.Source,
                    @p_LookupCode = input.LookupCode,
                    @p_LookupLink = input.LookupLink,
                    @p_VendorId = input.VendorId,
                    @p_VendorName = input.VendorName,
                    @p_VendorNumber = input.VendorNumber

                })).FirstOrDefault();
            }

            if (list != null)
            {

                if (input.Id != null || input.Id != 0)
                {
                    string _sqlUpdateChecked = "Exec Sp_InvDeleteLines @p_invoice_id ";

                    await _dapper.ExecuteAsync(_sqlUpdateChecked,
                         new
                         {
                             @p_invoice_id = input.Id,

                         });
                }

                foreach (var x in input.InvoiceDetailList)
                {
                    string _sql2 = @"EXEC Sp_InvInsertLines
                        @p_InvoiceId,
                        @p_PoHeaderId,
                        @p_PoNumber,
                        @p_VendorId,
                        @p_ItemId,
                        @p_LineNum,
                        @p_ItemNumber,
                        @p_ItemDescription,
                        @p_CategoryId,
                        @p_Quantity,
                        @p_QuantityOrder,
                        @p_ForeignPrice,
                        @p_user,
                        @p_TaxRate,
                        @p_QuantityGR,
                        @p_QuantityMatched,
                        @p_unitPricePO,
                        @p_Status,
                        @p_Note";

                    await _dapper.ExecuteAsync(_sql2, new
                    {
                        @p_InvoiceId = list.Id,
                        @p_PoHeaderId = x.PoHeaderId,
                        @p_PoNumber = x.PoNumber,
                        @p_VendorId = input.VendorId,
                        @p_ItemId = x.ItemId,
                        @p_LineNum = x.LineNum,
                        @p_ItemNumber = x.ItemNumber,
                        @p_ItemDescription = x.ItemDescription,
                        @p_CategoryId = x.CategoryId,
                        @p_Quantity = x.Quantity,
                        @p_QuantityOrder = x.QuantityOrder,
                        @p_ForeignPrice = x.ForeignPrice,
                        @p_user = AbpSession.UserId,
                        @p_TaxRate = x.TaxRate,
                        @p_QuantityGR = x.QuantityReceived,
                        @p_QuantityMatched = x.QuantityMatched,
                        @p_unitPricePO = x.UnitPricePO,
                        @p_Status = x.Status,
                        @p_Note = x.Note
                    });
                };

                string _sql3 = "EXEC sp_InvUpdateAmount @p_invoice_id";
                await _dapper.ExecuteAsync(_sql3, new
                {
                    @p_invoice_id = list.Id,
                });

            }

            return list.Id.ToString();

        }
        #endregion

        #region -- Import nhiều hóa đơn
        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Import)]
        public async Task<InvImportMultipleDto> ImportMultipleInvoice(byte[] files)
        {
            InvImportMultipleDto outPut = new InvImportMultipleDto();
            List<SearchInvoiceOutputDto> listHeaderImport = new List<SearchInvoiceOutputDto>();
            List<SearchInvoiceOutputDetailDto> listItemsImport = new List<SearchInvoiceOutputDetailDto>();
            using (var stream = new MemoryStream(files))
            {
                var xlWorkBook = ExcelFile.Load(stream);
                var v_worksheet = xlWorkBook.Worksheets[0];

                stream.Position = 0;
                XSSFWorkbook xSSFWorkbook = new XSSFWorkbook(stream);
                ISheet sheet;
                sheet = xSSFWorkbook.GetSheetAt(0);

                string _sqlGetInvNum = "EXEC sp_getAllInvoiceNum";
                var listinvNum = (_dapper.Query<SearchInvoiceOutputDto>(_sqlGetInvNum)).ToList();

                string _sqlgetVendor = "EXEC sp_MstSuppliersGetVendor ";
                var listvendor = (await _dapper.QueryAsync<VendorComboboxDto>(_sqlgetVendor)).ToList();

                string _sqlgetCurrency = "EXEC sp_MstCurrencyGetAll ";
                var listCurrency = (await _dapper.QueryAsync<MasterLookupDto>(_sqlgetCurrency)).ToList();

                string _sqlgetpaymentterms = "EXEC sp_GetAllPaymentTerms ";
                var listpayment = (await _dapper.QueryAsync<MasterLookupDto>(_sqlgetpaymentterms)).ToList();

                List<MasterLookupDto> listInvConflic = new List<MasterLookupDto>();
                for (int i = 0; i < v_worksheet.Rows.Count - 2; i++)
                {
                    MasterLookupDto newRow = new MasterLookupDto();
                    newRow.Code = (v_worksheet.Cells[i + 2, 2]).Value?.ToString();
                    listInvConflic.Add(newRow);
                }

                for (int i = 2; i < v_worksheet.Rows.Count; i++)
                {
                    IRow excelRow = sheet.GetRow(i);
                    if (excelRow == null || string.IsNullOrWhiteSpace(excelRow.ToString())) continue;
                    if (excelRow.Cells.All(e => e.CellType == CellType.Blank)) continue;

                    string v_stt = excelRow.GetCell(0) != null ? Convert.ToString(excelRow.GetCell(0)) : "";
                    string v_inv_symbol = excelRow.GetCell(1) != null ? Convert.ToString(excelRow.GetCell(1)) : "";
                    string v_inv_num = excelRow.GetCell(2) != null ? Convert.ToString(excelRow.GetCell(2)) : "";
                    string v_description = excelRow.GetCell(3) != null ? Convert.ToString(excelRow.GetCell(3)) : "";
                    string v_inv_date = excelRow.GetCell(4) != null && excelRow.GetCell(4).NumericCellValue != 0 ? DateTime.FromOADate(excelRow.GetCell(4).NumericCellValue).ToString("dd/MM/yyyy") : "";
                    string v_supplier_name = excelRow.GetCell(5) != null ? Convert.ToString(excelRow.GetCell(5)) : "";
                    string v_currency_code = excelRow.GetCell(6) != null ? Convert.ToString(excelRow.GetCell(6)) : "";
                    string v_amount = excelRow.GetCell(7) != null ? Convert.ToString(excelRow.GetCell(7)) : "";
                    string v_tax_rate = excelRow.GetCell(8) != null ? Convert.ToString(excelRow.GetCell(8)) : "";

                    var row = new SearchInvoiceOutputDto();
                    row.ERROR_DESCRIPTION = "";
                    row.InvoiceSymbol = v_inv_symbol;
                    row.InvoiceNum = v_inv_num;
                    row.Description = v_description;
                    row.InvoiceDateStr = v_inv_date;
                    row.VendorName = v_supplier_name;
                    row.CurrencyCode = v_currency_code;
                    row.TotalAmountStr = v_amount;
                    row.TaxRateStr = v_tax_rate;
                    if (listinvNum.Any(e => e.InvoiceNum == v_inv_num))
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Invoice already exists!" : row.ERROR_DESCRIPTION;
                    }
                    if (!listvendor.Any(e => e.SupplierName.Trim().ToUpper() == v_supplier_name.Trim().ToUpper()))
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Supplier Name is not valid!" : row.ERROR_DESCRIPTION;
                    }
                    else
                    {
                        row.VendorId = listvendor.Find(e => e.SupplierName.Trim().ToUpper() == v_supplier_name.Trim().ToUpper()).Id;
                    }

                    if (!listCurrency.Any(e => e.Code.Trim().ToUpper() == v_currency_code.Trim().ToUpper()))
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Currency Code is not valid!" : row.ERROR_DESCRIPTION;
                    }


                    if (listInvConflic.FindAll(e => e.Code == v_inv_num).Count > 1)
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Invoice Number is dupplicate!" : row.ERROR_DESCRIPTION;
                    }

                    listHeaderImport.Add(row);
                }

                if (xlWorkBook.Worksheets.Count == 2)
                {
                    string _sql = "EXEC sp_InvCheckImportPOLines @p_poNum, @p_vendorId, @p_userId, @p_itemNum";

                    sheet = xSSFWorkbook.GetSheetAt(1);

                    var v_worksheet1 = xlWorkBook.Worksheets[1];

                    for (int i = 2; i < v_worksheet1.Rows.Count; i++)
                    {
                        IRow excelRow = sheet.GetRow(i);
                        if (excelRow == null || string.IsNullOrWhiteSpace(excelRow.ToString())) continue;
                        if (excelRow.Cells.All(e => e.CellType == CellType.Blank)) continue;

                        var row = new SearchInvoiceOutputDetailDto();
                        string v_stt = excelRow.GetCell(0) != null ? Convert.ToString(excelRow.GetCell(0)) : ""; ;
                        string v_inv_num = excelRow.GetCell(1) != null ? Convert.ToString(excelRow.GetCell(1)) : ""; ;
                        string v_po_num = excelRow.GetCell(2) != null ? Convert.ToString(excelRow.GetCell(2)) : ""; ;
                        string v_item_num = excelRow.GetCell(3) != null ? Convert.ToString(excelRow.GetCell(3)) : ""; ;
                        string v_description = excelRow.GetCell(4) != null ? Convert.ToString(excelRow.GetCell(4)) : ""; ;
                        string v_qty = excelRow.GetCell(5) != null && excelRow.GetCell(5).NumericCellValue != 0 ? Convert.ToString(excelRow.GetCell(5).NumericCellValue) : ""; ;
                        string v_qtyMatch = excelRow.GetCell(6) != null ? Convert.ToString(excelRow.GetCell(6)) : ""; ;

                        row.InvoiceNum = v_inv_num;
                        row.ERROR_DESCRIPTION = "";
                        row.PoNumber = v_po_num;
                        row.ItemNumber = v_item_num;
                        row.ItemDescription = v_description;
                        row.QuantityStr = v_qty;

                        if (v_po_num.Length == 0)
                        {
                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "PO Number cannot be null!" : row.ERROR_DESCRIPTION;
                        }

                        if (v_description.Length == 0)
                        {
                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Product name cannot be null!" : row.ERROR_DESCRIPTION;
                        }

                        if (!listHeaderImport.Any(e => e.InvoiceNum == v_inv_num))
                        {
                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Invoice Number is not exists!" : row.ERROR_DESCRIPTION;
                        }
                        else
                        {
                            string supplierName = listHeaderImport.Find(e => e.InvoiceNum == v_inv_num).VendorName;
                            long? vendorId = listvendor.Find(e => e.SupplierName.ToUpper() == supplierName).Id;
                            var list = (await _dapper.QueryAsync<SearchInvoiceOutputDetailDto>(_sql, new
                            {
                                p_poNum = v_po_num,
                                p_vendorId = vendorId,
                                p_userId = AbpSession.UserId,
                                p_itemNum = v_item_num.Substring(0, v_item_num.IndexOf("."))
                            })).FirstOrDefault();

                            if (list == null)
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "PO Number is out of stock!" : row.ERROR_DESCRIPTION;
                            }
                            else
                            {
                                if (list?.Id == 0)
                                {
                                    row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "PO Number is not exists in supplier!" : row.ERROR_DESCRIPTION;
                                }
                                else
                                {

                                    if (!string.IsNullOrEmpty(v_qty))
                                    {
                                        if (decimal.Parse(v_qty) < 0)
                                        {
                                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Quantity PO must be greater than 0!" : row.ERROR_DESCRIPTION;
                                        }
                                        else if (Decimal.Parse(v_qty) > list.Quantity)
                                        {
                                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Quantity PO exceeded limit!" : row.ERROR_DESCRIPTION;
                                        }
                                        else
                                        {
                                            row.Amount = Decimal.Parse(v_qty) * list.UnitPrice;
                                            row.AmountVat = row.Amount * list.TaxRate;
                                            row.Quantity = Decimal.Parse(v_qty);
                                        }
                                    }

                                    row.QuantityOrder = list.QuantityOrder;
                                    row.QuantityReceived = list.QuantityReceived;
                                    row.VendorId = vendorId;
                                    row.ItemId = list.ItemId;
                                    row.LineNum = list.LineNum;
                                    row.ItemNumber = list.ItemNumber;
                                    row.ItemDescription = list.ItemDescription;
                                    row.UnitPrice = list.UnitPrice;
                                    row.PoHeaderId = list.PoHeaderId;
                                    row.ForeignPrice = list.UnitPrice;
                                    row.TaxRate = list.TaxRate;
                                }
                            }
                        }

                        if (!string.IsNullOrEmpty(v_qtyMatch))
                        {
                            if (decimal.Parse(v_qtyMatch) <= 0)
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Quantity matched must be greater than 0!" : row.ERROR_DESCRIPTION;
                            }
                            else
                            {
                                row.QuantityMatched = Decimal.Parse(v_qtyMatch);
                            }
                        }

                        if (v_description.Length > 500) row.ERROR_DESCRIPTION = "Description Length Not Valid";
                        listItemsImport.Add(row);
                    }
                }
            }
            outPut.listHeader = listHeaderImport;
            outPut.listItems = listItemsImport;
            return outPut;
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Import)]
        public async Task<string> InvoiceInsertMultiple(InvImportMultipleDto input)
        {
            for (int i = 0; i < input.listHeader.Count; i++)
            {
                input.listHeader[i].InvoiceNum = input.listHeader[i].InvoiceNum;
                input.listHeader[i].InvoiceSymbol = input.listHeader[i].InvoiceSymbol;
                input.listHeader[i].Description = input.listHeader[i].Description;
                input.listHeader[i].InvoiceDate = DateTime.Parse(input.listHeader[i].InvoiceDateStr);
                input.listHeader[i].VendorId = input.listHeader[i].VendorId;
                input.listHeader[i].VendorName = input.listHeader[i].VendorName;
                input.listHeader[i].CurrencyCode = input.listHeader[i].CurrencyCode;
                input.listHeader[i].TotalAmount = input.listHeader[i].TotalAmount;
                input.listHeader[i].TaxRate = input.listHeader[i].TaxRateStr != null ? decimal.Parse(input.listHeader[i].TaxRateStr) : 0;
                string _sql = @"EXEC Sp_InvInsertHeader
                                @p_InvoiceNum,
                                @p_InvoiceSymbol,
                                @p_Description,
                                @p_invoice_date,
                                @p_VendorId,
                                @p_VendorName,
                                @p_VendorNumber,
                                @p_CurrencyCode,
                                @p_Rate,
                                @p_InvoiceAmount,
                                @p_TaxName,
                                @p_TaxRate,
                                @p_user,
                                @p_Status,
                                @p_Source,
                                @p_LookupCode,
                                @p_LookupLink";

                var id = (await _dapper.QueryAsync<SearchInvoiceOutputDto>(_sql, new
                {
                    @p_InvoiceNum = input.listHeader[i].InvoiceNum,
                    @p_InvoiceSymbol = input.listHeader[i].InvoiceSymbol,
                    @p_Description = input.listHeader[i].Description,
                    @p_invoice_date = input.listHeader[i].InvoiceDate,
                    @p_VendorId = input.listHeader[i].VendorId,
                    @p_VendorName = input.listHeader[i].VendorName,
                    @p_VendorNumber = input.listHeader[i].VendorNumber,
                    @p_CurrencyCode = input.listHeader[i].CurrencyCode,
                    @p_Rate = input.listHeader[i].Rate,
                    @p_InvoiceAmount = input.listHeader[i].TotalAmount,
                    @p_TaxName = input.listHeader[i].TaxName,
                    @p_TaxRate = input.listHeader[i].TaxRate,
                    @p_user = AbpSession.UserId,
                    @p_Status = "",
                    @p_Source = "Manual",
                    @p_LookupCode = "",
                    @p_LookupLink = ""
                })).ToList()[0].Id;

                var listItemsInsert = input.listItems.FindAll(e => e.InvoiceNum == input.listHeader[i].InvoiceNum);
                ImportListDetails(listItemsInsert, id);
            }
            return "Info: Save successfully";
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Import)]
        public void ImportListDetails(List<SearchInvoiceOutputDetailDto> listData, long? invoiceId)
        {
            var appsettingsjson = JObject.Parse(File.ReadAllText("appsettings.json"));
            var connectionStrings = (JObject)appsettingsjson["ConnectionStrings"];
            string _connectionString = connectionStrings.Property(tmssConsts.ConnectionStringName).Value.ToString();
            if (listData.Count > 0)
            {
                DataTable table = new DataTable();
                table.Columns.Add("InvoiceId", typeof(long));
                table.Columns.Add("PoHeaderId", typeof(long));
                table.Columns.Add("PoNumber", typeof(string));
                table.Columns.Add("VendorId", typeof(long));
                table.Columns.Add("ItemId", typeof(long));
                table.Columns.Add("ItemNumber", typeof(string));
                table.Columns.Add("LineNum", typeof(string));
                table.Columns.Add("ItemDescription", typeof(string));
                table.Columns.Add("Quantity", typeof(decimal));
                table.Columns.Add("QuantityOrder", typeof(decimal));
                table.Columns.Add("Amount", typeof(decimal));
                table.Columns.Add("AmountVat", typeof(decimal));
                table.Columns.Add("ForeignPrice", typeof(decimal));
                table.Columns.Add("CreationTime", typeof(DateTime));
                table.Columns.Add("CreatorUserId", typeof(long));
                table.Columns.Add("IsDeleted", typeof(long));
                table.Columns.Add("TaxRate", typeof(string));
                table.Columns.Add("QuantityReceived", typeof(decimal));
                table.Columns.Add("QuantityMatched", typeof(decimal));
                table.Columns.Add("Status", typeof(string));
                for (int i = 0; i < listData.Count; i++)
                {
                    DataRow dr = table.NewRow();
                    SearchInvoiceOutputDetailDto row = listData[i];
                    dr["InvoiceId"] = invoiceId;
                    dr["PoHeaderId"] = row.PoHeaderId;
                    dr["PoNumber"] = row.PoNumber;
                    dr["VendorId"] = row.VendorId;
                    dr["ItemId"] = row.ItemId;
                    dr["ItemNumber"] = row.ItemNumber;
                    dr["LineNum"] = row.LineNum;
                    dr["ItemDescription"] = row.ItemDescription;
                    dr["Quantity"] = row.Quantity ?? 0;
                    dr["QuantityOrder"] = row.QuantityOrder ?? 0;
                    dr["Amount"] = row.Amount ?? 0;
                    dr["AmountVat"] = row.AmountVat ?? 0;
                    dr["ForeignPrice"] = row.ForeignPrice ?? 0;
                    dr["CreationTime"] = DateTime.Now;
                    dr["CreatorUserId"] = AbpSession.UserId;
                    dr["IsDeleted"] = 0;
                    dr["TaxRate"] = row.TaxRate ?? 0;
                    dr["QuantityReceived"] = row.QuantityReceived ?? 0;
                    dr["QuantityMatched"] = row.QuantityMatched ?? 0;
                    dr["Status"] = "Matched";
                    table.Rows.Add(dr);
                }

                using (System.Data.SqlClient.SqlConnection conn = new System.Data.SqlClient.SqlConnection(_connectionString))
                {
                    conn.Open();

                    using (System.Data.SqlClient.SqlTransaction tran = conn.BeginTransaction(IsolationLevel.ReadCommitted))
                    {
                        using (var bulkCopy = new System.Data.SqlClient.SqlBulkCopy(conn, System.Data.SqlClient.SqlBulkCopyOptions.Default, tran))
                        {
                            bulkCopy.DestinationTableName = "InvoiceLines";
                            bulkCopy.ColumnMappings.Add("InvoiceId", "InvoiceId");
                            bulkCopy.ColumnMappings.Add("PoHeaderId", "PoHeaderId");
                            bulkCopy.ColumnMappings.Add("PoNumber", "PoNumber");
                            bulkCopy.ColumnMappings.Add("VendorId", "VendorId");
                            bulkCopy.ColumnMappings.Add("ItemId", "ItemId");
                            bulkCopy.ColumnMappings.Add("ItemNumber", "ItemNumber");
                            bulkCopy.ColumnMappings.Add("LineNum", "LineNum");
                            bulkCopy.ColumnMappings.Add("ItemDescription", "ItemDescription");
                            bulkCopy.ColumnMappings.Add("Quantity", "Quantity");
                            bulkCopy.ColumnMappings.Add("QuantityOrder", "QuantityOrder");
                            bulkCopy.ColumnMappings.Add("Amount", "Amount");
                            bulkCopy.ColumnMappings.Add("AmountVat", "AmountVat");
                            bulkCopy.ColumnMappings.Add("ForeignPrice", "ForeignPrice");
                            bulkCopy.ColumnMappings.Add("CreationTime", "CreationTime");
                            bulkCopy.ColumnMappings.Add("CreatorUserId", "CreatorUserId");
                            bulkCopy.ColumnMappings.Add("IsDeleted", "IsDeleted");
                            bulkCopy.ColumnMappings.Add("TaxRate", "TaxRate");
                            bulkCopy.ColumnMappings.Add("QuantityReceived", "QuantityReceived");
                            bulkCopy.ColumnMappings.Add("QuantityMatched", "QuantityMatched");
                            bulkCopy.ColumnMappings.Add("Status", "Status");
                            bulkCopy.WriteToServer(table);
                            tran.Commit();
                        }
                    }
                    conn.Close();
                }
            }

        }
        #endregion

        #region -- Match thông tin hóa đơn
        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Edit)]
        public async Task<string> MatchedInvoice(SearchInvoiceOutputDto input)
        {
            var list = new SearchInvoiceOutputDto();

            string _sql = "EXEC Sp_InvUpdateHeader @p_invoice_id,@p_InvoiceSymbol,@p_Description,@p_invoice_date,@p_CurrencyCode,@p_Rate,@p_InvoiceAmount,@p_TaxName,@p_TaxRate,@p_user";
            list = (await _dapper.QueryAsync<SearchInvoiceOutputDto>(_sql, new
            {
                @p_invoice_id = input.Id,
                @p_InvoiceSymbol = input.InvoiceSymbol,
                @p_Description = input.Description,
                @p_invoice_date = input.InvoiceDate,
                @p_CurrencyCode = input.CurrencyCode,
                @p_Rate = input.Rate,
                @p_InvoiceAmount = input.TotalAmount,
                @p_TaxName = input.TaxName,
                @p_TaxRate = input.TaxRate,
                @p_user = AbpSession.UserId,
            })).FirstOrDefault();

            if (list != null)
            {

                if (input.Id != null || input.Id != 0)
                {
                    string _sqlUpdateChecked = "Exec Sp_InvDeleteLines @p_invoice_id ";

                    await _dapper.ExecuteAsync(_sqlUpdateChecked,
                         new
                         {
                             @p_invoice_id = input.Id,

                         });

                }

                foreach (var x in input.InvoiceDetailList)
                {
                    string _sql2 = "EXEC Sp_InvMatchedLines @p_InvoiceId,@p_PoHeaderId,@p_PoNumber,@p_VendorId,@p_ItemId,@p_LineNum,@p_ItemNumber,@p_ItemDescription, @p_CategoryId, @p_Quantity, @p_QuantityOrder, @p_ForeignPrice, @p_user, @p_TaxRate, @p_QuantityGR, @p_QuantityMatched";
                    await _dapper.ExecuteAsync(_sql2, new
                    {
                        @p_InvoiceId = list.Id,
                        @p_PoHeaderId = x.PoHeaderId,
                        @p_PoNumber = x.PoNumber,
                        @p_VendorId = input.VendorId,
                        @p_ItemId = x.ItemId,
                        @p_LineNum = x.LineNum,
                        @p_ItemNumber = x.ItemNumber,
                        @p_ItemDescription = x.ItemDescription,
                        @p_CategoryId = x.CategoryId,
                        @p_Quantity = x.Quantity,
                        @p_QuantityOrder = x.QuantityOrder,
                        @p_ForeignPrice = x.ForeignPrice,
                        @p_user = AbpSession.UserId,
                        @p_TaxRate = x.TaxRate,
                        @p_QuantityGR = x.QuantityReceived,
                        @p_QuantityMatched = x.QuantityMatched
                    });
                };

                string _sql3 = "EXEC sp_InvUpdateAmount @p_invoice_id";
                await _dapper.ExecuteAsync(_sql3, new
                {
                    @p_invoice_id = list.Id,
                });
            }
            return list.Id.ToString();
        }
        #endregion

        #region -- Export Excel
        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Import)]
        public async Task<byte[]> ListPOExportExcel(List<GetPoVendorDto> v_list_export_excel)
        {

            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            List<string> list = new List<string>();
            list.Add("SupplierName");
            list.Add("PONumber");
            list.Add("PartNo");
            list.Add("PartName");
            list.Add("UnitPrice");
            list.Add("Quantity");
            //list.Add("QuantityOrder");
            //list.Add("QuantityReceived");
            //list.Add("QtyInvoice");
            list.Add("InvoicePrice");

            List<string> listHeader = new List<string>();
            listHeader.Add("Supplier Name");
            listHeader.Add("PO Number");
            listHeader.Add("Part No");
            listHeader.Add("Part Name");
            listHeader.Add("Unit Price");
            listHeader.Add("Qty");
            //listHeader.Add("Qty Order");
            //listHeader.Add("Qty GR");
            //listHeader.Add("Qty Inovice");
            listHeader.Add("Inovice Price");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);

            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            xlWorkBook.Save(tempFile);
            var tempFile2 = Commons.SetAutoFit(tempFile, p_header.Length);
            byte[] fileByte = await File.ReadAllBytesAsync(tempFile2);
            File.Delete(tempFile);
            File.Delete(tempFile2);

            return fileByte;
        }
        #endregion

        #region -- Import Data
        [AbpAuthorize(AppPermissions.InvoiceItems_Invoices_Import)]
        public async Task<List<GetPoVendorDto>> ImportData(byte[] files)
        {
            using (var stream = new MemoryStream(files))
            {
                var xlWorkBook = ExcelFile.Load(stream);
                var v_worksheet = xlWorkBook.Worksheets[0];

                string _sql = "EXEC sp_DeleteInvCheck @p_user_id ";
                await _dapper.ExecuteAsync(_sql, new
                {
                    @p_user_id = AbpSession.UserId
                });
                for (int i = 1; i < v_worksheet.Rows.Count; i++)
                {
                    var row = new GetPoVendorDto();
                    decimal v_qty_num = -1;
                    decimal v_unitprice_num = -1;
                    decimal v_invoice_price = -1;

                    string v_supplier_name = (v_worksheet.Cells[i, 0]).Value?.ToString() ?? "";
                    string v_po_number = (v_worksheet.Cells[i, 1]).Value?.ToString() ?? "";
                    string v_part_no = (v_worksheet.Cells[i, 2]).Value?.ToString() ?? "";
                    string v_unitprice = (v_worksheet.Cells[i, 4]).Value?.ToString() ?? "";
                    string v_qty = (v_worksheet.Cells[i, 8]).Value?.ToString() ?? "";
                    string v_invoiceprice = (v_worksheet.Cells[i, 9]).Value?.ToString() ?? "";

                    if (v_qty != "")
                    {
                        try
                        {
                            v_qty_num = decimal.Parse(v_qty);
                        }
                        catch
                        {
                            v_qty_num = -1;
                        }
                    }

                    if (v_unitprice != "")
                    {
                        try
                        {
                            v_unitprice_num = decimal.Parse(v_unitprice);
                        }
                        catch
                        {
                            v_unitprice_num = -1;
                        }
                    }

                    if (v_invoiceprice != "") v_invoice_price = decimal.Parse(v_invoiceprice);

                    string _sqlIns = "EXEC sp_InsInvCheck @p_user_id, @p_supplier_name, @p_po_number, @p_part_no, @p_qty, @p_unit_price, @v_invoiceprice";
                    await _dapper.ExecuteAsync(_sqlIns, new
                    {
                        @p_user_id = AbpSession.UserId,
                        @p_supplier_name = v_supplier_name,
                        @p_po_number = v_po_number,
                        @p_part_no = v_part_no,
                        @p_qty = (decimal?)((v_qty == "") ? null : v_qty_num),
                        @p_unit_price = (decimal?)((v_unitprice == "") ? null : v_unitprice_num),
                        @v_invoiceprice = (decimal?)((v_invoiceprice == "") ? null : v_invoice_price),
                    });
                }

                string _sqlList = "EXEC sp_ImportInvCheck @p_user ";
                var list = (await _dapper.QueryAsync<GetPoVendorDto>(_sqlList, new
                {
                    @p_user = AbpSession.UserId
                })).ToList();

                return list;
            }
        }
        #endregion

        #region -- Lấy danh sách số PO
        public async Task<List<GetAllPoNumberByVendorDto>> GetAllPoNumberByVendor(long vendorId)
        {
            IEnumerable<GetAllPoNumberByVendorDto> poNums = await _dapper.QueryAsync<GetAllPoNumberByVendorDto>("EXEC sp_PcsQueryPoNumberByVendor @VendorId", new { VendorId = vendorId });

            return poNums.ToList();
        }
        #endregion

        #region -- Lấy chi tiết Po (Chức năng UpdatePo Invoice)
        public async Task<List<GetAllPoLinesForUpdateInvoiceDto>> GetAllPoLinesForUpdateInvoice(long poId)
        {
            IEnumerable<GetAllPoLinesForUpdateInvoiceDto> poLines = await _dapper.QueryAsync<GetAllPoLinesForUpdateInvoiceDto>("EXEC sp_PcsQueryPoLinesForUpdatePoInvoice @PoId", new { PoId = poId });

            return poLines.ToList();
        }
        #endregion

        #region -- Hủy hóa đơn
        public async Task CancelInvoice(CancelInvoiceInputDto input)
        {
            var invoice = await _invoiceRepo.FirstOrDefaultAsync(e => e.Id == input.Id);
            //var invoice = await _invoiceRepo.FirstOrDefaultAsync(e => e.Id == input.Id);
            if (invoice == null)
            {
                throw new UserFriendlyException(400, L("NoRecordToUpdate"));
            }
            else
            {
                invoice.CancelDate = DateTime.Now;
                invoice.CancelReason = input.CancelReason;
                invoice.Status = AppConsts.STATUS_CANCEL;
            }
        }
        #endregion

        #region -- Xóa hóa đơn
        public void DeleteInvoice(long id)
        {
            var invoice = _invoiceRepo.FirstOrDefault(e => e.Id == id);
            if (invoice == null)
            {
                throw new UserFriendlyException(400, L("NoRecordToUpdate"));
            }
            else
            {
                _dapper.Execute("EXEC sp_PcsDeleteInvoice @InvoiceId, @UserId", new { @InvoiceId = invoice.Id, @UserId = AbpSession.UserId });
            }
        }
        #endregion

        #region -- Lấy danh sách lý do hủy
        public async Task<List<GetAllCancelReasonForInvoice>> GetAllCancelReasonForInvoice()
        {
            return await _cancelReasonRepo.GetAll().Where(e => e.Type == AppConsts.IV).AsNoTracking()
                .Select(e => new GetAllCancelReasonForInvoice { Id = e.Id, Code = e.Code, Name = e.Name, Type = e.Type, Description = e.Description }).ToListAsync();
        }
        #endregion

        #region -- Cập nhật nhà cung cấp
        public async Task<GetSupplierInfoForInvoiceDto> UpdateSupplier(string vatRegistrationInvoice)
        {
            return await (from sup in _supRepo.GetAll().Where(e => e.VatRegistrationInvoice == vatRegistrationInvoice
                                && (!e.StartDateActive.HasValue || e.StartDateActive.Value.Date <= DateTime.Now.Date)
                                && (!e.EndDateActive.HasValue || e.EndDateActive.Value.Date >= DateTime.Now.Date)).AsNoTracking()
                          select new GetSupplierInfoForInvoiceDto
                          {
                              Id = sup.Id,
                              SupplierName = sup.SupplierName,
                              SupplierNumber = sup.SupplierNumber,
                              VatRegistrationInvoice = sup.VatRegistrationInvoice,
                              VatRegistrationNum = sup.VatRegistrationNum
                          }).FirstOrDefaultAsync();
        }
        #endregion

        #region -- Tải lên và Đọc hóa đơn
        //public List<EInvoiceInfo> ReadZip(string pathSaveZip)
        //{
        //    List<EInvoiceInfo> eInvoiceInfos = new List<EInvoiceInfo>();
        //    using (ZipArchive zip = ZipFile.Open(pathSaveZip, ZipArchiveMode.Read))
        //        foreach (ZipArchiveEntry entry in zip.Entries)
        //        {
        //            if (entry.Name.EndsWith(".xml"))
        //            {
        //                using (var stream = entry.Open())
        //                {
        //                    EInvoiceInfo eInvoiceInfo = ReadXmFromZip(stream);
        //                    eInvoiceInfos.Add(eInvoiceInfo);
        //                }
        //            }
        //        }
        //    return eInvoiceInfos;
        //}
        //public EInvoiceInfo ReadXmFromZip(Stream data)
        //{
        //    XmlDocument xmlDocument = new XmlDocument();
        //    xmlDocument.Load(data);

        //    return ReadXml(xmlDocument);
        //}
        //public async Task ReadXmlManual(byte[] fileBytes)
        //{
        //    EInvoiceInfo invoiceInfo = ReadXmlFromFile(fileBytes);
        //}
        //public EInvoiceInfo ReadXmlFromFile(byte[] fileBytes)
        //{
        //    XmlDocument xmlDocument = new XmlDocument();
        //    xmlDocument.
        //    //xmlDocument.Load(pathSaveXml);
        //    return ReadXml(xmlDocument);
        //}
        //public EInvoiceInfo ReadXml(XmlDocument xmlDocument)
        //{
        //    if (xmlDocument.GetElementsByTagName("TTChung") != null && xmlDocument.GetElementsByTagName("TTChung").Count > 0)
        //    {
        //        return ReadXmlFptGPS(xmlDocument);
        //    }
        //    ////VNPT
        //    //else if (xmlDocument.GetElementsByTagName("Content") != null && xmlDocument.GetElementsByTagName("Content").Count > 0)
        //    //{
        //    //    return readXmlVnptGPS(xmlDocument, subject, senderName, senderEmail);
        //    //}
        //    ////QDt
        //    //else if (xmlDocument.GetElementsByTagName("inv:invoiceData") != null && xmlDocument.GetElementsByTagName("inv:invoiceData").Count > 0)
        //    //{
        //    //    return readXmlQdtGPS(xmlDocument, subject, senderName, senderEmail);
        //    //}
        //    else
        //    {
        //        //SaveLogError(Constants.BUSINESS_CODE_GPS, subject, "File xml không đúng định dạng!", "", "", subject, "");
        //        return null;
        //    }
        //}
        //public EInvoiceInfo ReadXmlFptGPS(XmlDocument xmlDocument)
        //{
        //    EInvoiceInfo invoiceInfo = ReadE_InvoiceData(xmlDocument, InvoiceEnum.Fpt);
        //    return invoiceInfo;
        //}
        //public EInvoiceInfo ReadE_InvoiceData(XmlDocument xmlDocument, InvoiceEnum xmlType)
        //{
        //    var rs = new EInvoiceInfo();
        //    var itemList = new List<EItemInfo>();

        //    XmlNode ttChung;
        //    string serialNo = string.Empty;
        //    string invoiceNo = string.Empty;
        //    string poNo = string.Empty;
        //    string currency = string.Empty;
        //    string invoiceDateStr = string.Empty;
        //    long totalAmtWithVAT = 0, amtVAT = 0, amtBeforeVAT = 0;
        //    string amtWithVATStr = string.Empty, amtVATStr = string.Empty, amtBeforeVATStr = string.Empty;
        //    string varTChat = string.Empty;
        //    DateTime invoiceDate = DateTime.MinValue;
        //    string varMHHDVu = string.Empty;
        //    string sellerTaxCode = string.Empty;
        //    switch (xmlType)
        //    {
        //        case InvoiceEnum.Fpt:
        //            XmlNodeList itemsTTChung = xmlDocument.GetElementsByTagName("TTChung");
        //            ttChung = itemsTTChung[itemsTTChung.Count - 1];
        //            XmlNodeList itemsTToan = xmlDocument.GetElementsByTagName("TToan");
        //            XmlNode tToan = itemsTToan[0];

        //            serialNo = ttChung.SelectSingleNode("KHHDon")?.InnerText;
        //            invoiceNo = ttChung.SelectSingleNode("SHDon")?.InnerText;
        //            if (serialNo.Contains("/"))
        //            {
        //                invoiceNo = invoiceNo?.PadLeft(7, '0');
        //            }
        //            invoiceDateStr = ttChung?.SelectSingleNode("NLap") == null ? ttChung.SelectSingleNode("TDLap").InnerText : ttChung.SelectSingleNode("NLap").InnerText;
        //            invoiceDate = DateTime.Parse(invoiceDateStr);

        //            currency = ttChung.SelectSingleNode("DVTTe").InnerText;
        //            totalAmtWithVAT = long.Parse(tToan.SelectSingleNode("TgTTTBSo")?.InnerText?.Split('.')[0]);
        //            amtVAT = long.Parse(tToan.SelectSingleNode("TgTThue").InnerText.Split('.')[0]);
        //            amtBeforeVAT = long.Parse(tToan.SelectSingleNode("TgTCThue").InnerText.Split('.')[0]);
        //            //
        //            poNo = string.Empty;
        //            if (ttChung.SelectSingleNode("TTKhac")?.SelectSingleNode("TTin")?.LastChild?.InnerText.Contains("PO-") == true)
        //            {
        //                var v_poNo = ttChung.SelectSingleNode("TTKhac")?.SelectSingleNode("TTin")?.LastChild?.InnerText.Split(' ');
        //                foreach (var s in v_poNo)
        //                {
        //                    if (s.StartsWith("PO-")) poNo = s;
        //                }
        //            }
        //            else if (ttChung.SelectSingleNode("TTKhac")?.SelectSingleNode("TTin[TTruong='Extra1']/DLieu")?.InnerText?.Contains("PO-") == true)
        //            {
        //                var v_poNo = ttChung.SelectSingleNode("TTKhac")?.SelectSingleNode("TTin[TTruong='Extra1']/DLieu")?.InnerText.Split(' ');
        //                foreach (var s in v_poNo)
        //                {
        //                    if (s.StartsWith("PO-")) poNo = s;
        //                }
        //            }
        //            else if (ttChung.SelectSingleNode("TTKhac")?.SelectSingleNode("TTin[TTruong='CustomField1']/DLieu")?.InnerText?.Contains("PO-") == true)
        //            {
        //                var v_poNo = ttChung.SelectSingleNode("TTKhac")?.SelectSingleNode("TTin[TTruong='CustomField1']/DLieu")?.InnerText.Split(' ');
        //                foreach (var s in v_poNo)
        //                {
        //                    if (s.StartsWith("PO-")) poNo = s;
        //                }
        //            }
        //            itemList = GetFPTItemList(xmlDocument, ref poNo);
        //            sellerTaxCode = GetFptMST(xmlDocument);
        //            break;
        //        //case InvoiceEnum.Vnpt:
        //        //    XmlNodeList itemsContent = xmlDocument.GetElementsByTagName("Content");
        //        //    ttChung = itemsContent[0];

        //        //    invoiceNo = ttChung?.SelectSingleNode("InvoiceNo") == null ? ttChung.GetChildText("InvoiceNumber") : ttChung.GetChildText("InvoiceNo");
        //        //    serialNo = ttChung?.SelectSingleNode("SerialNo") == null ? ttChung.GetChildText("InvoiceSerial") : ttChung.GetChildText("SerialNo");

        //        //    if (serialNo.Contains("/")) invoiceNo = invoiceNo?.PadLeft(7, '0');
        //        //    invoiceDateStr = ttChung?.SelectSingleNode("ArisingDate") == null ? ttChung.GetChildText("InvoiceDate") : ttChung?.GetChildText("ArisingDate");
        //        //    amtWithVATStr = ttChung?.SelectSingleNode("TotalAmount") != null ? ttChung.GetChildText("TotalAmount") : ttChung.GetChildText("Amount");
        //        //    amtVATStr = ttChung?.SelectSingleNode("VAT_Amount") != null ? ttChung.GetChildText("VAT_Amount") :
        //        //        (ttChung?.SelectSingleNode("TaxAmount") != null ? ttChung.GetChildText("TaxAmount") : ttChung.GetChildText("VATAmount"));
        //        //    amtBeforeVATStr = ttChung?.SelectSingleNode("Total") != null ? ttChung.GetChildText("Total") : ttChung.GetChildText("Amount");

        //        //    invoiceDate = DateTime.ParseExact(invoiceDateStr.Split(' ')[0], "dd/MM/yyyy", null);
        //        //    currency = ttChung?.SelectSingleNode("CurrencyUnit") == null ? "VND" : ttChung.GetChildText("CurrencyUnit");
        //        //    totalAmtWithVAT = long.Parse(amtWithVATStr.Split('.')[0]);
        //        //    amtVAT = long.Parse(amtVATStr.Split('.')[0]);
        //        //    amtBeforeVAT = long.Parse(amtBeforeVATStr.Split('.')[0]);

        //        //    //po, taxcode 
        //        //    poNo = string.Empty;
        //        //    itemList = getVnptItemList(xmlDocument, ttChung, ref poNo);
        //        //    sellerTaxCode = getVnptMST(xmlDocument);
        //        //    break;
        //        //case InvoiceEnum.QdtInv:
        //        //    var nsmgr = new XmlNamespaceManager(xmlDocument.NameTable);
        //        //    nsmgr.AddNamespace("inv", "http://laphoadon.gdt.gov.vn/2014/09/invoicexml/v1");

        //        //    itemsContent = xmlDocument.GetElementsByTagName("inv:invoiceData");
        //        //    ttChung = itemsContent[0];
        //        //    invoiceNo = ttChung.GetChildText("inv:invoiceNumber", nsmgr);
        //        //    serialNo = ttChung.GetChildText("inv:invoiceSeries", nsmgr);
        //        //    if (serialNo.Contains("/")) invoiceNo = invoiceNo?.PadLeft(7, '0');

        //        //    invoiceDateStr = ttChung?.GetFirstChildText(new string[] { "inv:invoiceIssuedDate", "inv:invoiceSignedDate", "inv:signedDate" }, nsmgr);

        //        //    amtWithVATStr = ttChung.GetChildText("inv:totalAmountWithVAT", nsmgr);
        //        //    amtVATStr = ttChung.GetChildText("inv:totalVATAmount", nsmgr);
        //        //    amtBeforeVATStr = ttChung.GetChildText("inv:totalAmountWithoutVAT", nsmgr);

        //        //    invoiceDate = DateTime.Parse(invoiceDateStr.Split('T')[0]);
        //        //    currency = ttChung?.GetChildText("inv:currencyCode", nsmgr);

        //        //    totalAmtWithVAT = long.Parse(amtWithVATStr.Split('.')[0]);
        //        //    amtVAT = long.Parse(amtVATStr.Split('.')[0]);
        //        //    amtBeforeVAT = long.Parse(amtBeforeVATStr.Split('.')[0]);

        //        //    //item detail 
        //        //    poNo = string.Empty;
        //        //    itemList = getQdtItemList(xmlDocument, nsmgr, ref poNo, ttChung);
        //        //    sellerTaxCode = getQdtMST(xmlDocument, nsmgr);
        //        //    break;
        //        default:
        //            break;
        //    }

        //    rs.InvoiceNum = invoiceNo ?? "";
        //    rs.Currency = currency ?? "";
        //    rs.SerialNo = serialNo;
        //    rs.InvoiceDate = invoiceDate;
        //    rs.InvoiceAmountWithVAT = totalAmtWithVAT;
        //    rs.VATAmount = amtVAT;
        //    rs.InvoiceAmountBeforeVAT = amtBeforeVAT;
        //    rs.PO = poNo;
        //    rs.SellerTaxCode = sellerTaxCode;
        //    rs.Items = itemList;

        //    return rs;
        //}
        //public List<EItemInfo> GetFPTItemList(XmlDocument xmlDocument, ref string poNo)
        //{
        //    var itemList = new List<EItemInfo>();

        //    var varMHHDVu = string.Empty;
        //    var itemDSHHDVu = xmlDocument.GetElementsByTagName("HHDVu");
        //    foreach (XmlNode item in itemDSHHDVu)
        //    {
        //        varMHHDVu = item?.SelectSingleNode("MHHDVu") == null ? "" : item?.SelectSingleNode("MHHDVu").InnerText;

        //        itemList.Add(new EItemInfo()
        //        {
        //            PartNo = varMHHDVu,
        //            DistDescription = item["THHDVu"].InnerText,
        //            UnitOfMeasure = item["DVTinh"] != null ? item["DVTinh"].InnerText : "",
        //            QuantityInvoiced = item["SLuong"].InnerText != null ? Decimal.Parse(item["SLuong"].InnerText) : 0,
        //            UnitPrice = item["DGia"] != null ? Decimal.Parse(item["DGia"].InnerText) : 0,
        //            DistAmount = item["ThTien"] != null ? Int64.Parse(item["ThTien"].InnerText) : 0,
        //            VATRate = item["TSuat"] != null ? item["TSuat"].InnerText : "",
        //            VATAmount = item.SelectSingleNode("/TTKhac/TTin[TTruong='VATAmount']") != null
        //                ? Int64.Parse(item.SelectSingleNode("/TTKhac/TTin[TTruong='VATAmount']").SelectSingleNode("DLieu").InnerText) : 0,
        //            PoNo = poNo
        //        });
        //    }

        //    if (string.IsNullOrEmpty(poNo))
        //    {

        //        XmlNodeList itemsTTKhac = xmlDocument.GetElementsByTagName("TTKhac");

        //        if (itemsTTKhac.Count > 0)
        //        {
        //            XmlNodeList tKhac = itemsTTKhac[0].SelectNodes("/TTin/DLieu");
        //            var node = tKhac.Cast<XmlNode>().Where(e => e.InnerText.Contains("PO")).Select(e => e.InnerText).FirstOrDefault();
        //            poNo = node;
        //        }
        //    }
        //    return itemList;

        //}
        //public string GetFptMST(XmlDocument xmlDocument)
        //{
        //    var nodeNBan = xmlDocument.SelectSingleNode("/HDon/DLHDon/NDHDon/NBan/MST");
        //    if (nodeNBan == null) nodeNBan = xmlDocument.GetElementsByTagName("NDHDon")[0].SelectSingleNode("NBan").SelectSingleNode("MST");
        //    return nodeNBan?.InnerText;
        //}
        //public bool SaveEInvoice(EInvoiceInfo invoiceInfo)
        //{
        //    MstSuppliers mstSuppliers = _supRepo.FirstOrDefault(p => p.VatRegistrationNum == invoiceInfo.SellerTaxCode);


        //}
        #endregion

        #region -- Lấy thông tin user cho combobox search
        public async Task<List<GetAllUserForComboboxDto>> GetAllUserForCombobox()
        {
            IEnumerable<GetAllUserForComboboxDto> result = await _dapper.QueryAsync<GetAllUserForComboboxDto>("EXEC sp_PcsQueryAllUserForCombobox");
            return result.ToList();
        }
        #endregion
    }
}