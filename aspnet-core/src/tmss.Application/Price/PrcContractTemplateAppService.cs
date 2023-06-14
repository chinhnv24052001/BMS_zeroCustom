using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.UI;
using GemBox.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.InvoiceModule.Dto;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.UnitOfMeasure.Dto;
using tmss.Price.Dto;
using System.Data.SqlClient;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json.Linq;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.Common.GeneratePurchasingNumber;
using tmss.GR.Enum;
using tmss.Authorization;
using Abp.Authorization;
using tmss.RequestApproval.Dto;
using tmss.RequestApproval;
using System.Globalization;
using System.Net.NetworkInformation;
using Abp.Domain.Repositories;
using tmss.Master;
using Abp.EntityFrameworkCore.Uow;
using tmss.EntityFrameworkCore;
using tmss.PO;

namespace tmss.Price
{
    public class PrcContractTemplateAppService : tmssAppServiceBase, IPrcContractTemplateAppService
    {

        private readonly IDapperRepository<User, long> _dapper;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGeneratePurchasingNumberAppService;
        private readonly IRequestApprovalTreeAppService _sentRequestInf;
        private readonly IRepository<MstCurrency, long> _repoCurrency;
        private readonly IRepository<PrcAppendixContract, long> _repoPrcAppendixContract;

        public PrcContractTemplateAppService(
            IDapperRepository<User, long> dapper,
            ICommonGeneratePurchasingNumberAppService commonGeneratePurchasingNumberAppService,
            IRequestApprovalTreeAppService sentRequestInf,
            IRepository<MstCurrency, long> repoCurrency,
            IRepository<PrcAppendixContract, long> repoPrcAppendixContract
            )
        {
            _dapper = dapper;
            _commonGeneratePurchasingNumberAppService = commonGeneratePurchasingNumberAppService;
            _sentRequestInf = sentRequestInf;
            _repoCurrency = repoCurrency;
            _repoPrcAppendixContract = repoPrcAppendixContract;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Search)]
        public async Task<PagedResultDto<PrcContractTemplateDto>> getPrcContractTemplateSearch(InputSearchContractTemplate input)
        {
            string _sql = "EXEC sp_PrcContractTemplateSearch @p_contract_no, @p_eff_from, @p_eff_to, @p_appendix_no, @p_approve_by, @p_approve_status, @InventoryGroupId, @SupplierId, @CreationTime, @UserId";
            var list = (await _dapper.QueryAsync<PrcContractTemplateDto>(_sql, new
            {
                p_contract_no = input.ContractNo,
                p_eff_from = input.EffectiveFrom,
                p_eff_to = input.EffectiveTo,
                p_appendix_no = input.AppendixNo,
                p_approve_by = input.ApproveBy,
                p_approve_status = input.ApprovalStatus,
                InventoryGroupId = input.InventoryGroupId,
                SupplierId = input.SupplierId,
                CreationTime = input.CreationTime,
                UserId = input.UserId
            })).ToList();
            var pagedAndFiltered = list.Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            return new PagedResultDto<PrcContractTemplateDto>(
                       list.Count(),
                       pagedAndFiltered);
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Search)]
        public async Task<List<PrcAppendixContractDto>> getPrcContractTemplateSearchAppendix(InputSearchContractTemplate input)
        {
            string _sql = "EXEC sp_PrcContractTemplateSearchAppendix @p_contract_no, @p_eff_from, @p_eff_to, @p_appendix_no, @p_approve_by, @p_approve_status";
            var list = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
            {
                p_contract_no = input.ContractNo,
                p_eff_from = input.EffectiveFrom,
                p_eff_to = input.EffectiveTo,
                p_appendix_no = input.AppendixNo,
                p_approve_by = input.ApproveBy,
                p_approve_status = input.ApprovalStatus,
            })).ToList();
            return list;
            //var pagedAndFiltered = list.Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            //return new PagedResultDto<PrcAppendixContractDto>(
            //           list.Count(),
            //           pagedAndFiltered);
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Search)]
        public async Task<List<PrcAppendixContractItemsDto>> getPrcContractTemplateSearchAppendixItems(InputSearchContractTemplate input)
        {
            string _sql = "EXEC sp_PrcContractTemplateSearchAppendixItem @p_contract_no, @p_eff_from, @p_eff_to, @p_appendix_no, @p_approve_by, @p_approve_status";
            var list = (await _dapper.QueryAsync<PrcAppendixContractItemsDto>(_sql, new
            {
                p_contract_no = input.ContractNo,
                p_eff_from = input.EffectiveFrom,
                p_eff_to = input.EffectiveTo,
                p_appendix_no = input.AppendixNo,
                p_approve_by = input.ApproveBy,
                p_approve_status = input.ApprovalStatus,
            })).ToList();

            return list;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Add)]
        public async Task<string> PrcContractTemplateInsert(PrcContractTemplateDto dto)
        {
            // Check Exists
            string _sql = "EXEC sp_PrcContractTemplateCheckExistsContract @p_ContractNo";
            var list = (await _dapper.QueryAsync<PrcContractTemplateDto>(_sql, new
            {
                p_ContractNo = dto.ContractNo
            })).ToList();
            if (list[0].TotalCount > 0)
                return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_PrcContractTemplateInsContract @p_ContractNo, @p_ContractDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_SupplierId, @p_user, @p_signer,@p_signer_sup, @p_invetory_group_id, @p_paymenterms_id, @p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
            var id = (await _dapper.QueryAsync<PrcContractTemplateDto>(_sqlIns, new
            {
                p_ContractNo = dto.ContractNo,
                p_ContractDate = dto.ContractDate,
                p_EffectiveFrom = dto.EffectiveFrom,
                p_EffectiveTo = dto.EffectiveTo,
                p_Description = dto.Description,
                p_SupplierId = dto.SupplierId,
                p_user = AbpSession.UserId,
                p_signer = dto.Signer_By,
                p_signer_sup =dto.Signer_By_Suplier,
                p_invetory_group_id = dto.InventoryGroupId,
                p_paymenterms_id = dto.PaymentTermsId,
                p_TitleSigner = dto.TitleSigner,
                p_TiitleSignerNcc = dto.TitleSignerNcc,
                p_PlaceOfDelivery = dto.PlaceOfDelivery,
                p_Shipment = dto.Shipment,
                p_PaidBy = dto.PaidBy,
                p_Orthers = dto.Orthers
            })).ToList()[0].Id;
            return id.ToString();
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Edit)]
        public async Task<string> PrcContractTemplateUpdate(PrcContractTemplateDto dto)
        {
            string _sqlIns = "EXEC sp_PrcContractTemplateUpdContract @p_Id, @p_ContractDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_SupplierId, @p_user, @p_invetory_group_id, @p_paymenterms_id, @p_signer, @p_signer_sup, @p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_Id = dto.Id,
                p_ContractDate = dto.ContractDate,
                p_EffectiveFrom = dto.EffectiveFrom,
                p_EffectiveTo = dto.EffectiveTo,
                p_Description = dto.Description,
                p_SupplierId = dto.SupplierId,
                p_user = AbpSession.UserId,
                p_invetory_group_id = dto.InventoryGroupId,
                p_paymenterms_id = dto.PaymentTermsId,
                p_signer = dto.Signer_By,
                p_signer_sup = dto.Signer_By_Suplier,
                p_TitleSigner = dto.TitleSigner,
                p_TiitleSignerNcc = dto.TitleSignerNcc,
                p_PlaceOfDelivery = dto.PlaceOfDelivery,
                p_Shipment = dto.Shipment,
                p_PaidBy = dto.PaidBy,
                p_Orthers = dto.Orthers
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Add)]
        public async Task<string> PrcContractAppendixInsert(PrcAppendixContractDto dto)
        {
            // Check Exists
            string _sql = "EXEC sp_PrcContractTemplateCheckExistAppendix @p_AppendixNo, @p_ContractId";
            var list = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
            {
                p_AppendixNo = dto.AppendixNo,
                p_ContractId = dto.ContractId
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_PrcContractTemplateInsAppendix @p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_ContractId, @p_user, @p_Signer_By,@p_Signer_By_Sup,@p_seqNo";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_AppendixNo = dto.AppendixNo,
                p_AppendixDate = dto.AppendixDate,
                p_EffectiveFrom = dto.EffectiveFrom,
                p_EffectiveTo = dto.EffectiveTo,
                p_Description = dto.Description,
                p_ContractId = dto.ContractId,
                p_user = AbpSession.UserId,
                p_Signer_By = dto.Signer_By,
                p_Signer_By_Sup = dto.Signer_By_Suplier,
                p_seqNo = ""
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Edit)]
        public async Task<string> PrcContractAppendixUpdate(PrcAppendixContractDto dto)
        {
            string _sqlIns = "EXEC sp_PrcContractTemplateUpdAppendix @p_id, @p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_user, @p_Signer_By,@p_Signer_By_Supplier";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_id = dto.Id,
                p_AppendixNo = dto.AppendixNo,
                p_AppendixDate = dto.AppendixDate,
                p_EffectiveFrom = dto.EffectiveFrom,
                p_EffectiveTo = dto.EffectiveTo,
                p_Description = dto.Description,
                p_user = AbpSession.UserId,
                p_Signer_By = dto.Signer_By,
                p_Signer_By_Supplier = dto.Signer_By_Suplier
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Add)]
        public async Task<string> PrcContractAppendixItemsInsert(PrcAppendixContractItemsDto dto)
        {
            // Check Exists
            string _sql = "EXEC sp_PrcContractTemplateCheckExistAppendixItems @p_PartNo, @p_Appendix";
            var list = (await _dapper.QueryAsync<PrcAppendixContractItemsDto>(_sql, new
            {
                p_PartNo = dto.PartNo,
                p_Appendix = dto.AppendixId
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_PrcContractTemplateInsAppendixItems @p_AppendixId, @p_ItemId, @p_PartNo, @p_PartName, @p_PartNameSupplier, @p_UnitPrice, @p_TaxPrice, @p_Qty, @p_CurrencyCode, @p_user, @p_UnitOfMeasureId";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_AppendixId = dto.AppendixId,
                p_ItemId = dto.ItemId,
                p_PartNo = dto.PartNo,
                p_PartName = dto.PartName,
                p_PartNameSupplier = dto.PartNameSupplier,
                p_UnitPrice = dto.UnitPrice,
                p_TaxPrice = dto.TaxPrice,
                p_Qty = dto.Qty,
                p_CurrencyCode = dto.CurrencyCode,
                p_user = AbpSession.UserId,
                p_UnitOfMeasureId = dto.UnitOfMeasureId
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Edit)]
        public async Task<string> PrcContractAppendixItemsUpdate(PrcAppendixContractItemsDto dto)
        {
            string _sqlIns = "EXEC sp_PrcContractTemplateUpdAppendixItems @p_id, @p_Qty, @p_user";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_id = dto.Id,
                p_Qty = dto.Qty,
                p_user = AbpSession.UserId,
            });
            return "Info: Save successfully!";
        }

        public async Task<List<PrcAppendixContractItemsDto>> GetAllMstInventoryItems()
        {
            string _sql = "EXEC sp_GetAllMstInventoryItems";
            var list = (await _dapper.QueryAsync<PrcAppendixContractItemsDto>(_sql)).ToList();
            return list;
        }

        public async Task<List<VendorComboboxDto>> getAllVendor()
        {
            string _sql = "EXEC sp_MstSuppliersGetVendor ";
            var list = (await _dapper.QueryAsync<VendorComboboxDto>(_sql, new
            {
            })).ToList();

            return list;
        }
        public async Task<List<MasterLookupDto>> getAllInventoryGroup()
        {
            string _sql = "EXEC sp_MstInventoryGroupGetAll ";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql, new
            {
            })).ToList();

            return list;
        }
        public async Task<List<MasterLookupDto>> getAllPaymentTerm()
        {
            string _sql = "EXEC sp_MstPaymentTermsGetAll ";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql, new
            {
            })).ToList();

            return list;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Delete)]
        public async Task<string> PrcContractTemplateDelete(long id)
        {
            string _sqlIns = "EXEC sp_PrcContractTemplateDeleteContract @p_ContractId, @p_user";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_ContractId = id,
                p_user = AbpSession.UserId,
            });
            return "Info: Delete successfully!";
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Delete)]
        public async Task<string> PrcContractAppendixDelete(long id)
        {
            string _sqlIns = "EXEC sp_PrcContractTemplateDeleteAppendix @p_AppendixId, @p_user";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_AppendixId = id,
                p_user = AbpSession.UserId,
            });
            return "Info: Delete successfully!";
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Delete)]
        public async Task<string> PrcContractAppendixItemsDelete(long id)
        {
            string _sqlIns = "EXEC sp_PrcContractTemplateDeleteAppendixItems @p_AppendixItemsId, @p_user";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_AppendixItemsId = id,
                p_user = AbpSession.UserId,
            });
            return "Info: Delete successfully!";
        }

        public async Task<bool> PrcContractTemplateCheckEditSupplier(long input)
        {
            string _sql = "SELECT count(*) CountItem FROM PrcContractTemplate ct INNER JOIN PrcAppendixContract ap ON ct.id = ap.ContractId INNER JOIN PrcAppendixContractItems it ON ap.Id = it.AppendixID WHERE ct.Id = '" + input + "'";
            var list = (await _dapper.QueryAsync<PrcAppendixContractItemsDto>(_sql)).ToList();
            if (list[0].CountItem > 0)
                return false;
            return true;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Import)]
        public async Task<List<PrcContractTemplateImportDto>> ImportData(byte[] files)
        {
            List<PrcContractTemplateImportDto> listImport = new List<PrcContractTemplateImportDto>();

            using (var stream = new MemoryStream(files))
            {
                var xlWorkBook = ExcelFile.Load(stream);
                var v_worksheet = xlWorkBook.Worksheets[0];

                //if (v_worksheet.Columns.Count() < 24)
                //{
                //    throw new UserFriendlyException("Excel File Invalid!");
                //}

                string p_part_no_str = "";

                for (int i = 0; i < v_worksheet.Rows.Count - 3; i++)
                {
                    p_part_no_str = p_part_no_str + "#" + (v_worksheet.Cells[i + 3, 3]).Value?.ToString() ?? "";
                }
                string _sqlgetListPartNo = "EXEC sp_MstInventoryItems_GetByPartNoByList @v_part_no";

                var listPartNo = (_dapper.Query<InventoryItemsSearchOutputDto>(_sqlgetListPartNo, new
                {
                    @v_part_no = p_part_no_str
                })).ToList();

                for (int i = 0; i < v_worksheet.Rows.Count - 3; i++)
                {
                    var row = new PrcContractTemplateImportDto();

                    string v_stt = (v_worksheet.Cells[i + 3, 0]).Value?.ToString() ?? "";
                    string v_inventoryitems = (v_worksheet.Cells[i + 3, 1]).Value?.ToString() ?? "";
                    string v_catalogName = (v_worksheet.Cells[i + 3, 2]).Value?.ToString() ?? "";
                    string v_part_no = (v_worksheet.Cells[i + 3, 3]).Value?.ToString() ?? "";
                    string v_par_name = (v_worksheet.Cells[i + 3, 4]).Value?.ToString() ?? "";
                    string v_unit = (v_worksheet.Cells[i + 3, 5]).Value?.ToString() ?? "";
                    string v_qty = (v_worksheet.Cells[i + 3, 6]).Value?.ToString() ?? "";
                    string v_unit_price = (v_worksheet.Cells[i + 3, 7]).Value?.ToString() ?? "";
                    string v_currency = (v_worksheet.Cells[i + 3, 8]).Value?.ToString() ?? "";
                    string v_vat = (v_worksheet.Cells[i + 3, 9]).Value?.ToString() ?? "";
                    string v_sales_amount = (v_worksheet.Cells[i + 3, 10]).Value?.ToString() ?? "";
                    string v_description = (v_worksheet.Cells[i + 3, 11]).Value?.ToString() ?? "";
                    string v_length = (v_worksheet.Cells[i + 3, 12]).Value?.ToString() ?? "";
                    string v_unitLength = (v_worksheet.Cells[i + 3, 13]).Value?.ToString() ?? "";
                    string v_width = (v_worksheet.Cells[i + 3, 14]).Value?.ToString() ?? "";
                    string v_unitWidth = (v_worksheet.Cells[i + 3, 15]).Value?.ToString() ?? "";
                    string v_height = (v_worksheet.Cells[i + 3, 16]).Value?.ToString() ?? "";
                    string v_unitHeight = (v_worksheet.Cells[i + 3, 17]).Value?.ToString() ?? "";
                    string v_weight = (v_worksheet.Cells[i + 3, 18]).Value?.ToString() ?? "";
                    string v_unitWeight = (v_worksheet.Cells[i + 3, 19]).Value?.ToString() ?? "";
                    string v_material = (v_worksheet.Cells[i + 3, 20]).Value?.ToString() ?? "";
                    string v_coo = (v_worksheet.Cells[i + 3, 21]).Value?.ToString() ?? "";
                    string v_unitProduct = (v_worksheet.Cells[i + 3, 22]).Value?.ToString() ?? "";
                    string v_unitExchangeProduct = (v_worksheet.Cells[i + 3, 23]).Value?.ToString() ?? "";
                    string v_producer = (v_worksheet.Cells[i + 3, 24]).Value?.ToString() ?? "";
                    row.ERROR_DESCRIPTION = "";
                    row.Length = v_length;
                    row.UnitLength = v_unitLength;
                    row.Width = v_width;
                    row.UnitWidth = v_unitWidth;
                    row.Height = v_height;
                    row.UnitHeight = v_unitHeight;
                    row.Weight = v_weight;
                    row.UnitHeight = v_unitHeight;
                    row.Material = v_material;
                    row.COO = v_coo;
                    row.UnitOfProduct = v_unitProduct;
                    row.UnitOfExchangeProduct = v_unitExchangeProduct;
                    row.Producer = v_producer;
                    row.UnitWeight = v_unitWeight;
                    row.No = v_stt;
                    row.InvetoryGroupName = v_inventoryitems;
                    row.CatalogName = v_catalogName;
                    row.PartNo = v_part_no;
                    row.PartName = v_par_name;
                    row.UnitOfMeasure = v_unit;
                    row.QtyStr = v_qty;
                    row.UnitPriceStr = v_unit_price;
                    row.CurrencyCode = v_currency;
                    row.TaxPriceStr = v_vat;
                    row.SalesAmount = v_sales_amount;
                    row.Description = v_description;

                    //
                    if (v_part_no.Length > 40 || v_part_no.Length == 0) row.ERROR_DESCRIPTION = "Mã hàng hóa vượt quá 40 ký tự!";
                    else
                    {
                        if (v_part_no.Contains('.'))
                        {
                            string partNo = v_part_no.Split('.')[0];
                            string color = v_part_no.Split('.')[1];
                            if (!listPartNo.Any(e => e.PartNo.Trim().Equals(partNo.Trim()) && e.Color.Trim().Equals(color.Trim())))
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hàng hóa không tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                            }
                        }
                        else if (!listPartNo.Any(e => e.PartNo == v_part_no.Trim()))
                        {
                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hàng hóa không tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                        } else
                        {
                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hàng hóa không tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                        }

                    }
                    //"Part No Length Invalid";
                    if (v_qty != "")
                    {
                        try
                        {
                            decimal.Parse(v_qty);
                        }
                        catch
                        {
                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Số lượng không đúng định dạng!" : row.ERROR_DESCRIPTION;
                        }
                    }

                    if (v_description.Length > 500) row.ERROR_DESCRIPTION = "Độ dài mô tả quá 500 ký tự!";
                    listImport.Add(row);
                }
            }
            return listImport.OrderByDescending(e => e.ERROR_DESCRIPTION).ToList();
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Import)]
        public void ImportListDetails(List<PrcContractTemplateImportDto> listData, long p_AppendixId)
        {
            var appsettingsjson = JObject.Parse(File.ReadAllText("appsettings.json"));
            var connectionStrings = (JObject)appsettingsjson["ConnectionStrings"];
            string _connectionString = connectionStrings.Property(tmssConsts.ConnectionStringName).Value.ToString();
            if (listData.Count > 0)
            {
                DataTable table = new DataTable();
                table.Columns.Add("AppendixId", typeof(long));
                table.Columns.Add("ItemId", typeof(long));
                table.Columns.Add("PartNo", typeof(string));
                table.Columns.Add("PartName", typeof(string));
                table.Columns.Add("UnitPrice", typeof(decimal));
                table.Columns.Add("TaxPrice", typeof(decimal));
                table.Columns.Add("Qty", typeof(decimal));
                table.Columns.Add("CurrencyCode", typeof(string));
                table.Columns.Add("UnitOfMeasureId", typeof(long));
                table.Columns.Add("InventoryGroupId", typeof(long));
                table.Columns.Add("CatalogId", typeof(long));
                table.Columns.Add("Length", typeof(string));
                table.Columns.Add("Width", typeof(string));
                table.Columns.Add("Height", typeof(string));
                table.Columns.Add("UnitLength", typeof(string));
                table.Columns.Add("UnitWidth", typeof(string));
                table.Columns.Add("UnitHeight", typeof(string));
                table.Columns.Add("Weight", typeof(string));
                table.Columns.Add("UnitWeight", typeof(string));
                table.Columns.Add("COO", typeof(string));
                table.Columns.Add("UnitOfProduct", typeof(string));
                table.Columns.Add("UnitOfExchangeProduct", typeof(string));
                table.Columns.Add("Producer", typeof(string));
                table.Columns.Add("CreationTime", typeof(DateTime));
                table.Columns.Add("CreatorUserId", typeof(long));
                table.Columns.Add("IsDeleted", typeof(long));
                table.Columns.Add("Color", typeof(string));
                table.Columns.Add("CurrencyId", typeof(string));
                table.Columns.Add("SupplierId", typeof(string));
                string p_part_no_str = "";
                for (int i = 0; i < listData.Count; i++)
                {
                    p_part_no_str = p_part_no_str + "#" + listData[i].PartNo;
                }
                string _sqlgetListPartNo = "EXEC sp_MstInventoryItems_GetByPartNoByList @v_part_no";
                var listPartNo = (_dapper.Query<InventoryItemsSearchOutputDto>(_sqlgetListPartNo, new
                {
                    @v_part_no = p_part_no_str
                })).ToList();

                string _sqlgetListUnit = "EXEC sp_MstUnitOfMeasureGetAll";
                var listUnit = (_dapper.Query<MasterLookupDto>(_sqlgetListUnit, new
                {

                })).ToList();

                for (int i = 0; i < listData.Count; i++)
                {
                    DataRow dr = table.NewRow();
                    PrcContractTemplateImportDto row = listData[i];
                    dr["AppendixId"] = p_AppendixId;
                    dr["Qty"] = (row.QtyStr=="")? DBNull.Value : row.QtyStr;
                    MstCurrency mstCurrency = _repoCurrency.FirstOrDefault(p => p.CurrencyCode.Equals(listData[i].CurrencyCode));

                    if ((!row.PartNo.Contains('.') && listPartNo.Any(e => e.PartNo.Trim() == row.PartNo.Trim()))
                       || (listPartNo.Any(e => e.PartNo.Trim() == row.PartNo.Trim().Split('.')[0] && e.Color.Trim() == row.PartNo.Trim().Split('.')[1])))
                    {
                        var rowPartData = listPartNo.Where(e =>
                        (!row.PartNo.Trim().Contains('.') && e.PartNo.Trim() == row.PartNo.Trim())
                        || (e.PartNo.Trim() == row.PartNo.Trim().Split('.')[0] && e.Color.Trim() == row.PartNo.Trim().Split('.')[1])                        
                        ).ToList();
                        dr["PartNo"] = rowPartData[0].PartNo;
                        dr["PartName"] = rowPartData[0].PartName;
                        // dr["UnitPrice"] = (rowPartData[0].UnitPrice == null) ? 0 : rowPartData[0].UnitPrice;
                        dr["TaxPrice"] = (rowPartData[0].TaxPrice == null) ? 0 : rowPartData[0].TaxPrice;
                        dr["ItemId"] = rowPartData[0].Id;
                        dr["InventoryGroupId"] = (rowPartData[0].InventoryGroupId == null) ? 0 : rowPartData[0].InventoryGroupId;
                        dr["CurrencyCode"] = listData[i].CurrencyCode;
                        var rowUnit = listUnit.Where(e => e.Code == rowPartData[0].PrimaryUomCode).ToList();
                        dr["UnitOfMeasureId"] = rowUnit.Count > 0 ? rowUnit[0].Id : DBNull.Value;
                        dr["Color"] = rowPartData[0].Color;

                        dr["SupplierId"] = rowPartData[0].SupplierId;
                        dr["CurrencyId"] = (mstCurrency == null) ? DBNull.Value : mstCurrency.Id;
                    }
                    dr["UnitPrice"] = (row.UnitPriceStr == "") ? DBNull.Value : row.UnitPriceStr;
                    dr["CatalogId"] = 0;
                    dr["Length"] = row.Length;
                    dr["Width"] = row.Width;
                    dr["Height"] = row.Height;
                    dr["UnitLength"] = row.UnitLength;
                    dr["UnitWidth"] = row.UnitWidth;
                    dr["UnitHeight"] = row.UnitHeight;
                    dr["Weight"] = row.Weight;
                    dr["UnitWeight"] = row.UnitWeight;
                    dr["COO"] = row.COO;
                    dr["UnitOfProduct"] = row.UnitOfProduct;
                    dr["UnitOfExchangeProduct"] = row.UnitOfExchangeProduct;
                    dr["Producer"] = row.Producer;
                    dr["CreationTime"] = DateTime.Now;
                    dr["CreatorUserId"] = AbpSession.UserId;
                    dr["IsDeleted"] = 0;
                    table.Rows.Add(dr);
                }

                using (System.Data.SqlClient.SqlConnection conn = new System.Data.SqlClient.SqlConnection(_connectionString))
                {
                    conn.Open();

                    using (System.Data.SqlClient.SqlTransaction tran = conn.BeginTransaction(IsolationLevel.ReadCommitted))
                    {
                        using (var bulkCopy = new System.Data.SqlClient.SqlBulkCopy(conn, System.Data.SqlClient.SqlBulkCopyOptions.Default, tran))
                        {
                            bulkCopy.DestinationTableName = "PrcAppendixContractItems";
                            bulkCopy.ColumnMappings.Add("AppendixId", "AppendixId");
                            bulkCopy.ColumnMappings.Add("ItemId", "ItemId");
                            bulkCopy.ColumnMappings.Add("PartNo", "PartNo");
                            bulkCopy.ColumnMappings.Add("PartName", "PartName");
                            bulkCopy.ColumnMappings.Add("UnitPrice", "UnitPrice");
                            bulkCopy.ColumnMappings.Add("TaxPrice", "TaxPrice");
                            bulkCopy.ColumnMappings.Add("Qty", "Qty");
                            bulkCopy.ColumnMappings.Add("CurrencyCode", "CurrencyCode");
                            bulkCopy.ColumnMappings.Add("UnitOfMeasureId", "UnitOfMeasureId");
                            bulkCopy.ColumnMappings.Add("InventoryGroupId", "InventoryGroupId");
                            bulkCopy.ColumnMappings.Add("CatalogId", "CatalogId");
                            bulkCopy.ColumnMappings.Add("Length", "Length");
                            bulkCopy.ColumnMappings.Add("Width", "Width");
                            bulkCopy.ColumnMappings.Add("Height", "Height");
                            bulkCopy.ColumnMappings.Add("UnitLength", "UnitLength");
                            bulkCopy.ColumnMappings.Add("UnitWidth", "UnitWidth");
                            bulkCopy.ColumnMappings.Add("UnitHeight", "UnitHeight");
                            bulkCopy.ColumnMappings.Add("Weight", "Weight");
                            bulkCopy.ColumnMappings.Add("UnitWeight", "UnitWeight");
                            bulkCopy.ColumnMappings.Add("COO", "COO");
                            bulkCopy.ColumnMappings.Add("UnitOfProduct", "UnitOfProduct");
                            bulkCopy.ColumnMappings.Add("UnitOfExchangeProduct", "UnitOfExchangeProduct");
                            bulkCopy.ColumnMappings.Add("Producer", "Producer");
                            bulkCopy.ColumnMappings.Add("CreationTime", "CreationTime");
                            bulkCopy.ColumnMappings.Add("CreatorUserId", "CreatorUserId");
                            bulkCopy.ColumnMappings.Add("IsDeleted", "IsDeleted");
                            bulkCopy.ColumnMappings.Add("Color", "Color");
                            bulkCopy.ColumnMappings.Add("SupplierId", "SupplierId");
                            bulkCopy.ColumnMappings.Add("CurrencyId", "CurrencyId");
                            bulkCopy.WriteToServer(table);
                            tran.Commit();
                        }
                    }

                    conn.Close();
                }             
            }

        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Add)]
        public async Task<PrcContractTemplateInsertOutputDto> PrcContractTemplateInsertNew(PrcContractTemplateInsertDto input)
        {
            PrcContractTemplateInsertOutputDto output = new PrcContractTemplateInsertOutputDto();
            output.AppendixId = new List<long?>();
            // Check Exists
            string _sql = "EXEC sp_PrcContractTemplateCheckExistsContract @p_ContractNo";
            var list = (await _dapper.QueryAsync<PrcContractTemplateDto>(_sql, new
            {
                p_ContractNo = input.dto.ContractNo
            })).ToList();
            if (list[0].TotalCount > 0)
            {
                output.ContractId = -1;
                return output;
            }
            string _sqlIns = "EXEC sp_PrcContractTemplateInsContract @p_ContractNo, @p_ContractDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_SupplierId, @p_user, @p_signer,@p_signer_sup,@p_invetory_group_id,@p_paymenterms_id, @p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
            var id = (await _dapper.QueryAsync<PrcContractTemplateDto>(_sqlIns, new
            {
                p_ContractNo = input.dto.ContractNo,
                p_ContractDate = input.dto.ContractDate,
                p_EffectiveFrom = input.dto.EffectiveFrom,
                p_EffectiveTo = input.dto.EffectiveTo,
                p_Description = input.dto.Description,
                p_SupplierId = input.dto.SupplierId,
                p_user = AbpSession.UserId,
                p_signer = input.dto.Signer_By,
                p_signer_sup = input.dto.Signer_By_Suplier,
                p_invetory_group_id = input.dto.InventoryGroupId,
                p_paymenterms_id = input.dto.PaymentTermsId,
                p_TitleSigner = input.dto.TitleSigner,
                p_TiitleSignerNcc = input.dto.TitleSignerNcc,
                p_PlaceOfDelivery = input.dto.PlaceOfDelivery,
                p_Shipment = input.dto.Shipment,
                p_PaidBy = input.dto.PaidBy,
                p_Orthers = input.dto.Orthers
            })).ToList()[0].Id;
            output.ContractId = id;

            long appendixId = 0;
            // insert Appendix
            if (input.listAppendix.Count == 0)
            {
                string pcNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.Annex);
                string _sqlInsAppendix = "EXEC sp_PrcContractTemplateInsAppendix @p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_ContractId, @p_user, @p_Signer_By,@p_Signer_By_Sup, @p_seqNo, @p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
                appendixId = (long)(await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlInsAppendix, new
                {
                    p_AppendixNo = input.dto.ContractNo,
                    p_AppendixDate = input.dto.ContractDate,
                    p_EffectiveFrom = input.dto.EffectiveFrom,
                    p_EffectiveTo = input.dto.EffectiveTo,
                    p_Description = input.dto.Description,
                    p_ContractId = id,
                    p_user = AbpSession.UserId,
                    p_Signer_By = input.dto.Signer_By,
                    p_Signer_By_Sup = input.dto.Signer_By_Suplier,
                    p_seqNo = pcNo,
                    p_TitleSigner = input.dto.TitleSigner,
                    p_TiitleSignerNcc = input.dto.TitleSignerNcc,
                    p_PlaceOfDelivery = input.dto.PlaceOfDelivery,
                    p_Shipment = input.dto.Shipment,
                    p_PaidBy = input.dto.PaidBy,
                    p_Orthers = input.dto.Orthers
                })).ToList()[0].Id;

                var inputCreateStep = new CreateRequestApprovalInputDto();
                inputCreateStep.ReqId = appendixId;
                inputCreateStep.ProcessTypeCode = "AN";
                await _sentRequestInf.CreateRequestApprovalTree(inputCreateStep);
            }
            else
            {
                for (int i = 0; i < input.listAppendix.Count; i++)
                {
                    string pcNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.Annex);
                    string _sqlInsAppendix = "EXEC sp_PrcContractTemplateInsAppendix @p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_ContractId, @p_user, @p_Signer_By,@p_Signer_By_Sup, @p_seqNo,@p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
                    if (input.listAppendix[i].AppendixNo != input.p_appendix_no)
                    {
                        long outputId;
                        appendixId = (long)(await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlInsAppendix, new
                        {
                            p_AppendixNo = input.listAppendix[i].AppendixNo,
                            p_AppendixDate = input.listAppendix[i].AppendixDate,
                            p_EffectiveFrom = input.listAppendix[i].EffectiveFrom,
                            p_EffectiveTo = input.listAppendix[i].EffectiveTo,
                            p_Description = input.listAppendix[i].Description,
                            p_ContractId = id,
                            p_user = AbpSession.UserId,
                            p_Signer_By = input.listAppendix[i].Signer_By,
                            p_Signer_By_Sup = input.listAppendix[i].Signer_By_Suplier,
                            p_seqNo = pcNo,
                            p_TitleSigner = input.listAppendix[i].TitleSigner,
                            p_TiitleSignerNcc = input.listAppendix[i].TitleSignerNcc,
                            p_PlaceOfDelivery = input.listAppendix[i].PlaceOfDelivery,
                            p_Shipment = input.listAppendix[i].Shipment,
                            p_PaidBy = input.listAppendix[i].PaidBy,
                            p_Orthers = input.listAppendix[i].Orthers
                        })).ToList()[0].Id;

                        var inputCreateStep = new CreateRequestApprovalInputDto();
                        inputCreateStep.ReqId = appendixId;
                        inputCreateStep.ProcessTypeCode = "AN";
                        await _sentRequestInf.CreateRequestApprovalTree(inputCreateStep);
                    }
                    else
                    {
                        appendixId = (long)(await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlInsAppendix, new
                        {
                            p_AppendixNo = input.listAppendix[i].AppendixNo,
                            p_AppendixDate = input.listAppendix[i].AppendixDate,
                            p_EffectiveFrom = input.listAppendix[i].EffectiveFrom,
                            p_EffectiveTo = input.listAppendix[i].EffectiveTo,
                            p_Description = input.listAppendix[i].Description,
                            p_ContractId = id,
                            p_user = AbpSession.UserId,
                            p_Signer_By = input.dto.Signer_By,
                            p_Signer_By_Sup = input.listAppendix[i].Signer_By_Suplier,
                            p_seqNo = pcNo,
                            p_TitleSigner = input.listAppendix[i].TitleSigner,
                            p_TiitleSignerNcc = input.listAppendix[i].TitleSignerNcc,
                            p_PlaceOfDelivery = input.listAppendix[i].PlaceOfDelivery,
                            p_Shipment = input.listAppendix[i].Shipment,
                            p_PaidBy = input.listAppendix[i].PaidBy,
                            p_Orthers = input.listAppendix[i].Orthers
                        })).ToList()[0].Id;

                        var inputCreateStep = new CreateRequestApprovalInputDto();
                        inputCreateStep.ReqId = appendixId;
                        inputCreateStep.ProcessTypeCode = "AN";
                        await _sentRequestInf.CreateRequestApprovalTree(inputCreateStep);
                    }
                }
            }
            string _sqlId = "EXEC sp_GetListAppendicIdAfterIns  @p_contractId";
            var listId = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlId, new
            {
                p_contractId = output.ContractId
            })).ToList();
            listId.ForEach(l =>
            {   
                output.AppendixId.Add(l.Id);
            });
            // insert Items
            ImportListDetails(input.listItems, appendixId);
            return output;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Add)]
        public async Task<long> PrcAppendixContractInsertNew(PrcAppendixContractInsertDto input)
        {
            // insert Appendix
            string _sql = "EXEC sp_PrcContractTemplateCheckExistAppendix @p_AppendixNo, @p_ContractId";
            var list = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
            {
                p_AppendixNo = input.dtoAppendix.AppendixNo,
                p_ContractId = input.dtoAppendix.ContractId
            })).ToList();
            if (list[0].CountItem > 0)
            {
                return -1;
            }
            string pcNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.Annex);
            string _sqlInsAppendix = "EXEC sp_PrcContractTemplateInsAppendix @p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_ContractId, @p_user, @p_Signer_By,@p_Signer_By_Sup, @p_seqNo,@p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
            long appendixId = (long)(await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlInsAppendix, new
            {
                p_AppendixNo = input.dtoAppendix.AppendixNo,
                p_AppendixDate = input.dtoAppendix.AppendixDate,
                p_EffectiveFrom = input.dtoAppendix.EffectiveFrom,
                p_EffectiveTo = input.dtoAppendix.EffectiveTo,
                p_Description = input.dtoAppendix.Description,
                p_ContractId = input.dtoAppendix.ContractId,
                p_user = AbpSession.UserId,
                p_Signer_By = input.dtoAppendix.Signer_By,
                p_Signer_By_Sup = input.dtoAppendix.Signer_By_Suplier,
                p_seqNo = pcNo,
                p_TitleSigner = input.dtoAppendix.TitleSigner,
                p_TiitleSignerNcc = input.dtoAppendix.TitleSignerNcc,
                p_PlaceOfDelivery = input.dtoAppendix.PlaceOfDelivery,
                p_Shipment = input.dtoAppendix.Shipment,
                p_PaidBy = input.dtoAppendix.PaidBy,
                p_Orthers = input.dtoAppendix.Orthers
            })).ToList()[0].Id;

            // insert Items
            ImportListDetails(input.listItems, appendixId);

            var inputCreateStep = new CreateRequestApprovalInputDto();
            inputCreateStep.ReqId = appendixId;
            inputCreateStep.ProcessTypeCode = "AN";
            await _sentRequestInf.CreateRequestApprovalTree(inputCreateStep);

            return appendixId;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Edit)]
        public async Task<string> PrcAppendixContractUpdatetNew(PrcAppendixContractInsertDto input)
        {
            // update Appendix


            string _sqlIns = "EXEC sp_PrcContractTemplateUpdAppendix @p_id, @p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_user";
            await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlIns, new
            {
                p_id = input.dtoAppendix.Id,
                p_AppendixNo = input.dtoAppendix.AppendixNo,
                p_AppendixDate = input.dtoAppendix.AppendixDate,
                p_EffectiveFrom = input.dtoAppendix.EffectiveFrom,
                p_EffectiveTo = input.dtoAppendix.EffectiveTo,
                p_Description = input.dtoAppendix.Description,
                p_ContractId = input.dtoAppendix.ContractId,
                p_user = AbpSession.UserId
            });
            // insert Items
            if (input.isInsertIttems)
                ImportListDetails(input.listItems, (long)input.dtoAppendix.Id);
            return "Info: Save successfully";
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Delete)]
        public async Task<string> PrcContractAppendixItemsDeleteAll(long id)
        {
            string _sqlIns = "Delete PrcAppendixContractItems where AppendixId = " + id + "";
            await _dapper.ExecuteAsync(_sqlIns);
            return "Info: Delete successfully";
        }

        public async Task<PrcAppendixContractInsertDto> getAppendixDataById(long appendixId)
        {
            PrcAppendixContractInsertDto data = new PrcAppendixContractInsertDto();
            string _sql = "EXEC sp_GetAppendixContractById @p_id";
            string _sql1 = "EXEC sp_GetAppendixItemsByAppendixId @p_id";
            var list = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
            {
                p_id = appendixId
            })).ToList();
            var list1 = (await _dapper.QueryAsync<PrcContractTemplateImportDto>(_sql1, new
            {
                p_id = appendixId
            })).ToList();
            data.dtoAppendix = list[0];
            data.listItems = list1;
            return data;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Import)]
        public async Task<PrcContractTemplateImportMultipleDto> ImportMultipleContract(byte[] files)
        {
            PrcContractTemplateImportMultipleDto outPut = new PrcContractTemplateImportMultipleDto();
            List<PrcContractTemplateDto> listContractImport = new List<PrcContractTemplateDto>();
            List<PrcContractTemplateImportDto> listItemsImport = new List<PrcContractTemplateImportDto>();
            using (var stream = new MemoryStream(files))
            {
                var xlWorkBook = ExcelFile.Load(stream);
                var v_worksheet = xlWorkBook.Worksheets[0];
                
                string _sqlGetContractNo = "EXEC sp_getAllContractNo";
                var listContractNo = (_dapper.Query<PrcContractTemplateDto>(_sqlGetContractNo)).ToList();

                string _sqlgetVendor = "EXEC sp_MstSuppliersGetVendor ";
                var listvendor = (await _dapper.QueryAsync<VendorComboboxDto>(_sqlgetVendor)).ToList();

                List<MasterLookupDto> listContractnoConflic = new List<MasterLookupDto>();
                for (int i = 0; i< v_worksheet.Rows.Count - 5; i++)
                {
                    if ((v_worksheet.Cells[i + 5, 1]).Value == null) continue;
                    MasterLookupDto newRow = new MasterLookupDto();
                    newRow.Code = (v_worksheet.Cells[i + 5, 1]).Value?.ToString();
                    newRow.ContractAppendixNo = (v_worksheet.Cells[i + 5, 2]).Value?.ToString();
                    listContractnoConflic.Add(newRow);
                }

                for (int i = 0; i < v_worksheet.Rows.Count - 5; i++)
                {
                    if ((v_worksheet.Cells[i + 5, 1]).Value == null) continue;
                    var row = new PrcContractTemplateDto();
                    string v_stt = (v_worksheet.Cells[i + 5, 0]).Value?.ToString() ?? "";
                    string v_contract_no = (v_worksheet.Cells[i + 5, 1]).Value?.ToString() ?? "";
                    string v_contract_appendix_no = (v_worksheet.Cells[i + 5, 2]).Value?.ToString() ?? "";
                    string v_contract_date = (v_worksheet.Cells[i + 5, 3]).Value == null ? null : (v_worksheet.Cells[i + 5, 3]).DateTimeValue.ToString("MM/dd/yyyy");
                    string v_eff_from = (v_worksheet.Cells[i + 5, 4]).Value == null ? null : (v_worksheet.Cells[i + 5, 4]).DateTimeValue.ToString("MM/dd/yyyy");
                    string v_eff_to = (v_worksheet.Cells[i + 5, 5]).Value == null ? null : (v_worksheet.Cells[i + 5, 5]).DateTimeValue.ToString("MM/dd/yyyy");
                    string v_appendix_date = (v_worksheet.Cells[i + 5, 6]).Value == null ? null : (v_worksheet.Cells[i + 5, 6]).DateTimeValue.ToString("MM/dd/yyyy");

                    string v_eff_from_appendix = (v_worksheet.Cells[i + 5, 7]).Value == null ? null : (v_worksheet.Cells[i + 5, 7]).DateTimeValue.ToString("MM/dd/yyyy");
                    string v_eff_to_appendix = (v_worksheet.Cells[i + 5, 8]).Value == null ? null : (v_worksheet.Cells[i + 5, 8]).DateTimeValue.ToString("MM/dd/yyyy");

                    string v_description = (v_worksheet.Cells[i + 5, 9]).Value?.ToString() ?? "";
                    string v_description_appendix = (v_worksheet.Cells[i + 5, 10]).Value?.ToString() ?? "";
                    string v_supplier_name = (v_worksheet.Cells[i + 5, 11]).Value?.ToString() ?? "";
                    string v_inventoryGrCode = (v_worksheet.Cells[i + 5, 12]).Value?.ToString() ?? "";
                    string v_signer = (v_worksheet.Cells[i + 5, 13]).Value?.ToString() ?? "";
                    string v_signer_titles = (v_worksheet.Cells[i + 5, 14]).Value?.ToString() ?? "";
                    string v_signer_ncc = (v_worksheet.Cells[i + 5, 15]).Value?.ToString() ?? "";
                    string v_signer_ncc_titles = (v_worksheet.Cells[i + 5, 16]).Value?.ToString() ?? "";
                    string v_signer_appendix = (v_worksheet.Cells[i + 5, 17]).Value?.ToString() ?? "";
                    string v_signer_appendix_titles = (v_worksheet.Cells[i + 5, 18]).Value?.ToString() ?? "";
                    string v_signer_appendix_ncc = (v_worksheet.Cells[i + 5, 19]).Value?.ToString() ?? "";
                    string v_signer_appendix_ncc_titles = (v_worksheet.Cells[i + 5, 20]).Value?.ToString() ?? "";
                    string v_payment = (v_worksheet.Cells[i + 5, 21]).Value?.ToString() ?? "";

                    string v_place = (v_worksheet.Cells[i + 5, 22]).Value?.ToString() ?? "";
                    string v_PairBy = (v_worksheet.Cells[i + 5, 23]).Value?.ToString() ?? "";
                    string v_shipment = (v_worksheet.Cells[i + 5, 24]).Value?.ToString() ?? "";
                    string v_orthers = (v_worksheet.Cells[i + 5, 25]).Value?.ToString() ?? "";

                    row.ERROR_DESCRIPTION = "";
                    row.ContractNo = v_contract_no;
                    row.ContractAppendixNo = v_contract_appendix_no;
                    row.ContractDateStr = v_contract_date;
                    row.EffectiveFromStr = v_eff_from;
                    row.EffectiveToStr = v_eff_to;

                    row.EffectiveFromStrAppendix = v_eff_from_appendix;
                    row.EffectiveToStrAppendix = v_eff_to_appendix;
                    row.AppendixDateStr = v_appendix_date;
                    row.DescriptionAppendix = v_description_appendix;

                    row.Description = v_description;
                    row.SupplierName = v_supplier_name;
                    row.ProductGroupName = v_inventoryGrCode;
                    row.Signer_By = v_signer;
                    row.Signer_By_Titles = v_signer_titles;
                    row.Signer_By_Suplier = v_signer_ncc;
                    row.Signer_By_Suplier_Titles = v_signer_ncc_titles;
                    row.PaymentermsName = v_payment;
                    row.SignerBySuplierAppendix = v_signer_appendix_ncc;
                    row.SignerByAppendix = v_signer_appendix;
                    row.TitlesSignerByAppendix = v_signer_appendix_titles;
                    row.TitlesSignerBySuplierAppendix = v_signer_appendix_ncc_titles;

                    row.Shipment = v_shipment;
                    row.PlaceOfDelivery = v_place;
                    row.Orthers = v_orthers;
                    row.PaidBy = v_PairBy;

                    if(string.IsNullOrEmpty(v_contract_no))
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hợp đồng đang trống!" : row.ERROR_DESCRIPTION;
                    }
                    if (string.IsNullOrEmpty(v_contract_appendix_no))
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã phụ lục hợp đồng đang trống!" : row.ERROR_DESCRIPTION;
                    }
                    if (listContractNo.Any(e => e.ContractNo == v_contract_no && e.ContractAppendixNo == v_contract_appendix_no))
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Hợp đồng đã tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                    }
                    if (!listvendor.Any(e => e.SupplierName.Trim().ToUpper() == v_supplier_name.Trim().ToUpper()))
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Tên nhà cung cấp không tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                    }

                    if(listContractnoConflic.FindAll(e => e.Code == v_contract_no && e.ContractAppendixNo == v_contract_appendix_no).Count > 1)
                    {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hợp đồng bị trùng lặp!" : row.ERROR_DESCRIPTION;
                    }

                    if(row.ContractDate != null) {
                        row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Ngày hợp đồng đang trống!" : row.ERROR_DESCRIPTION;
                    }

                    listContractImport.Add(row);
                }

                if (xlWorkBook.Worksheets.Count > 2)
                {
                    var v_worksheet1 = xlWorkBook.Worksheets[1];
                    string p_part_no_str = "";
                    for (int i = 0; i < v_worksheet1.Rows.Count - 4; i++)
                    {
                        p_part_no_str = p_part_no_str + "#" + (v_worksheet1.Cells[i + 4, 5]).Value?.ToString() ?? "";
                    }
                    string _sqlgetListPartNo = "EXEC sp_MstInventoryItems_GetByPartNoByList @v_part_no";
                    var listPartNo = (_dapper.Query<InventoryItemsSearchOutputDto>(_sqlgetListPartNo, new
                    {
                        @v_part_no = p_part_no_str
                    })).ToList();

                    for (int i = 0; i < v_worksheet1.Rows.Count - 4; i++)
                    {
                        if ((v_worksheet1.Cells[i + 4, 1]).Value == null) continue;
                        var row = new PrcContractTemplateImportDto();

                        string v_stt = (v_worksheet1.Cells[i + 4, 0]).Value?.ToString() ?? "";
                        string v_contractNo = (v_worksheet1.Cells[i + 4, 1]).Value?.ToString() ?? "";
                        string v_contractAppendixNo = (v_worksheet1.Cells[i + 4, 2]).Value?.ToString() ?? "";
                        string v_inventoryitems = (v_worksheet1.Cells[i + 4, 3]).Value?.ToString() ?? "";
                        string v_catalogName = (v_worksheet1.Cells[i + 4, 4]).Value?.ToString() ?? "";
                        string v_part_no = (v_worksheet1.Cells[i + 4, 5]).Value?.ToString() ?? "";
                        string v_par_name = (v_worksheet1.Cells[i + 4, 6]).Value?.ToString() ?? "";
                        string v_unit = (v_worksheet1.Cells[i + 4, 7]).Value?.ToString() ?? "";
                        string v_qty = (v_worksheet1.Cells[i + 4, 8]).Value?.ToString() ?? "";
                        string v_unit_price = (v_worksheet1.Cells[i + 4, 9]).Value?.ToString() ?? "";
                        string v_currency = (v_worksheet1.Cells[i + 4, 10]).Value?.ToString() ?? "";
                        string v_vat = (v_worksheet1.Cells[i + 4, 11]).Value?.ToString() ?? "";
                        string v_sales_amount = (v_worksheet1.Cells[i + 4, 12]).Value?.ToString() ?? "";
                        string v_description = (v_worksheet1.Cells[i + 4, 13]).Value?.ToString() ?? "";
                        string v_length = (v_worksheet1.Cells[i + 4, 14]).Value?.ToString() ?? "";
                        string v_unitLength = (v_worksheet1.Cells[i + 4, 15]).Value?.ToString() ?? "";
                        string v_width = (v_worksheet1.Cells[i + 4, 16]).Value?.ToString() ?? "";
                        string v_unitWidth = (v_worksheet1.Cells[i + 4, 17]).Value?.ToString() ?? "";
                        string v_height = (v_worksheet1.Cells[i + 4, 18]).Value?.ToString() ?? "";
                        string v_unitHeight = (v_worksheet1.Cells[i + 4, 19]).Value?.ToString() ?? "";
                        string v_weight = (v_worksheet1.Cells[i + 4, 20]).Value?.ToString() ?? "";
                        string v_unitWeight = (v_worksheet1.Cells[i + 4, 21]).Value?.ToString() ?? "";
                        string v_material = (v_worksheet1.Cells[i + 4, 22]).Value?.ToString() ?? "";
                        string v_coo = (v_worksheet1.Cells[i + 4, 23]).Value?.ToString() ?? "";
                        string v_unitProduct = (v_worksheet1.Cells[i + 4, 24]).Value?.ToString() ?? "";
                        string v_unitExchangeProduct = (v_worksheet1.Cells[i + 4, 25]).Value?.ToString() ?? "";
                        string v_producer = (v_worksheet1.Cells[i + 4, 26]).Value?.ToString() ?? "";


                        row.ERROR_DESCRIPTION = "";
                        row.Length = v_length;
                        row.UnitLength = v_unitLength;
                        row.Width = v_width;
                        row.UnitWidth = v_unitWidth;
                        row.Height = v_height;
                        row.UnitHeight = v_unitHeight;
                        row.Weight = v_weight;
                        row.UnitHeight = v_unitHeight;
                        row.Material = v_material;
                        row.COO = v_coo;
                        row.UnitOfProduct = v_unitProduct;
                        row.UnitOfExchangeProduct = v_unitExchangeProduct;
                        row.Producer = v_producer;
                        row.UnitWeight = v_unitWeight;
                        row.No = v_stt;
                        row.InvetoryGroupName = v_inventoryitems;
                        row.CatalogName = v_catalogName;
                        row.PartNo = v_part_no;
                        row.PartName = v_par_name;
                        row.UnitOfMeasure = v_unit;
                        row.QtyStr = v_qty ?? "0";
                        row.UnitPriceStr = v_unit_price;
                        row.CurrencyCode = v_currency;
                        row.TaxPriceStr = v_vat;
                        row.SalesAmount = v_sales_amount;
                        row.Description = v_description;
                        row.ContractNo = v_contractNo;
                        row.ContractAppendixNo = v_contractAppendixNo;

                        //try
                        //{
                        //    decimal.Parse(v_qty);
                        //}
                        //catch
                        //{
                        //    row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Qty Invalid!" : row.ERROR_DESCRIPTION;
                        //}                 

                        if (v_part_no.Length > 40 || v_part_no.Length == 0) row.ERROR_DESCRIPTION = "PartNoLength";
                        else
                        {

                            if (string.IsNullOrEmpty(v_contractNo))
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hợp đồng đang trống!" : row.ERROR_DESCRIPTION;
                            }
                            if (string.IsNullOrEmpty(v_contractAppendixNo))
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã phụ lục hợp đồng đang trống!" : row.ERROR_DESCRIPTION;
                            }

                            if (string.IsNullOrEmpty(v_unit_price))
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Đơn giá đang trống!" : row.ERROR_DESCRIPTION;
                            }

                            if (string.IsNullOrEmpty(v_currency))
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Đơn vị tiền tệ đang trống!" : row.ERROR_DESCRIPTION;
                            }

                            if (v_part_no.Contains('.'))
                            {
                                string partNo = v_part_no.Split('.')[0];
                                string color = v_part_no.Split('.')[1];
                                if (!listPartNo.Any(e => e.PartNo.Trim().Equals(partNo.Trim()) && e.Color.Trim().Equals(color.Trim())))
                                {
                                    row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hàng hóa không tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                                }
                            }
                            else
                            if (!listPartNo.Any(e => e.PartNo == v_part_no))
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hàng hóa không tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                            } else
                            {
                                row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hàng hóa không tồn tại trong hệ thống!" : row.ERROR_DESCRIPTION;
                            }

                        }

                        if (!listContractImport.Any(e => e.ContractNo == v_contractNo && e.ContractAppendixNo == v_contractAppendixNo))
                        {
                            row.ERROR_DESCRIPTION = (row.ERROR_DESCRIPTION == "") ? "Mã hợp đồng hoặc phụ lục hợp đồng đang không tồn tại!" : row.ERROR_DESCRIPTION;
                        }

                        if (v_description.Length > 500) row.ERROR_DESCRIPTION = "Độ dài mô tả quá 500 ký tự!";
                        listItemsImport.Add(row);
                    }
                }
            }
            outPut.listContract = listContractImport;
            outPut.listItems = listItemsImport;
            return outPut;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractManagement_Add)]
        public async Task<string> PrcContractTemplateInsMultiple(PrcContractTemplateImportMultipleDto input)
        {
            string _sqlgetVendor = "EXEC sp_MstSuppliersGetVendor ";
            var listvendor = (await _dapper.QueryAsync<VendorComboboxDto>(_sqlgetVendor)).ToList();

            string _sqlgetInventoryGroup = "EXEC sp_MstInventoryGroupGetAll ";
            var listInventoryGr = (await _dapper.QueryAsync<MasterLookupDto>(_sqlgetInventoryGroup)).ToList();

            string _sqlgetpaymentterms = "EXEC sp_GetAllPaymentTerms ";
            var listpayment = (await _dapper.QueryAsync<MasterLookupDto>(_sqlgetpaymentterms)).ToList();

            var listGroupContracts = input.listContract.GroupBy(e => new { e.ContractNo}).Select(e => e).ToList();

            if(listGroupContracts.Count > 0)
            {
                for (int i = 0; i < listGroupContracts.Count; i++)
                {
                    List<PrcContractTemplateDto> prcContractTemplateDtos = input.listContract.Where(p => p.ContractNo.Equals(listGroupContracts[i].Key.ContractNo)).ToList();

                    prcContractTemplateDtos[0].SupplierId = listvendor.FirstOrDefault(e => e.SupplierName == prcContractTemplateDtos[0].SupplierName) == null ? 0 : listvendor.FirstOrDefault(e => e.SupplierName == prcContractTemplateDtos[0].SupplierName).Id;
                    if (prcContractTemplateDtos[0].PaymentermsName != "")
                    {
                        prcContractTemplateDtos[0].PaymentTermsId = listpayment.FirstOrDefault(e => e.Name == prcContractTemplateDtos[0].PaymentermsName) == null ? 10061 : listpayment.FirstOrDefault(e => e.Name == prcContractTemplateDtos[0].PaymentermsName).Id;
                    }
                    if (prcContractTemplateDtos[0].ProductGroupName != "")
                    {
                        prcContractTemplateDtos[0].InventoryGroupId = listInventoryGr.FirstOrDefault(e => e.Name == prcContractTemplateDtos[0].ProductGroupName) == null ? 0 : listInventoryGr.FirstOrDefault(e => e.Name == prcContractTemplateDtos[0].ProductGroupName).Id;
                    }
                    prcContractTemplateDtos[0].ContractDate = prcContractTemplateDtos[0].ContractDateStr != null ? DateTime.ParseExact(prcContractTemplateDtos[0].ContractDateStr, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;
                    prcContractTemplateDtos[0].EffectiveFrom = prcContractTemplateDtos[0].EffectiveFromStr != null ? DateTime.ParseExact(prcContractTemplateDtos[0].EffectiveFromStr, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;
                    prcContractTemplateDtos[0].EffectiveTo = prcContractTemplateDtos[0].EffectiveToStr != null ? DateTime.ParseExact(prcContractTemplateDtos[0].EffectiveToStr, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;

                    //prcContractTemplateDtos[0].EffectiveFromAppendix = prcContractTemplateDtos[0].EffectiveFromStrAppendix != null ? DateTime.ParseExact(prcContractTemplateDtos[0].EffectiveFromStrAppendix, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;
                    //prcContractTemplateDtos[0].EffectiveToAppendix = prcContractTemplateDtos[0].EffectiveToStrAppendix != null ? DateTime.ParseExact(prcContractTemplateDtos[0].EffectiveToStrAppendix, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;

                    string _sqlIns = "EXEC sp_PrcContractTemplateInsContract @p_ContractNo, @p_ContractDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_SupplierId, @p_user, @p_signer,@p_signer_sup,@p_invetory_group_id,@p_paymenterms_id, @p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
                    var id = (await _dapper.QueryAsync<PrcContractTemplateDto>(_sqlIns, new
                    {
                        p_ContractNo = prcContractTemplateDtos[0].ContractNo,
                        p_ContractDate = prcContractTemplateDtos[0].ContractDate,
                        p_EffectiveFrom = prcContractTemplateDtos[0].EffectiveFrom,
                        p_EffectiveTo = prcContractTemplateDtos[0].EffectiveTo,
                        p_Description = prcContractTemplateDtos[0].Description,
                        p_SupplierId = prcContractTemplateDtos[0].SupplierId,
                        p_user = AbpSession.UserId,
                        p_signer = prcContractTemplateDtos[0].Signer_By,
                        p_signer_sup = prcContractTemplateDtos[0].Signer_By_Suplier,
                        p_invetory_group_id = prcContractTemplateDtos[0].InventoryGroupId,
                        p_paymenterms_id = prcContractTemplateDtos[0].PaymentTermsId,
                        p_TitleSigner = prcContractTemplateDtos[0].Signer_By_Titles,
                        p_TiitleSignerNcc = prcContractTemplateDtos[0].Signer_By_Suplier_Titles,
                        p_PlaceOfDelivery = prcContractTemplateDtos[0].PlaceOfDelivery,
                        p_Shipment = prcContractTemplateDtos[0].Shipment,
                        p_PaidBy = prcContractTemplateDtos[0].PaidBy,
                        p_Orthers = prcContractTemplateDtos[0].Orthers
                    })).ToList()[0].Id;

                    if (id != null && id > 0)
                    {
                        foreach (PrcContractTemplateDto prcContractTemplateDto in prcContractTemplateDtos)
                        {
                            prcContractTemplateDto.EffectiveFromAppendix = prcContractTemplateDto.EffectiveFromStrAppendix != null ? DateTime.ParseExact(prcContractTemplateDto.EffectiveFromStrAppendix, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;
                            prcContractTemplateDto.EffectiveToAppendix = prcContractTemplateDto.EffectiveToStrAppendix != null ? DateTime.ParseExact(prcContractTemplateDto.EffectiveToStrAppendix, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;
                            prcContractTemplateDto.AppendixDate = prcContractTemplateDto.AppendixDateStr != null ? DateTime.ParseExact(prcContractTemplateDto.AppendixDateStr, "MM/dd/yyyy", CultureInfo.InvariantCulture) : null;
                            string pcNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.Annex);
                            string _sqlInsAppendix = "EXEC sp_PrcContractTemplateInsAppendix @p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description, @p_ContractId, @p_user, @p_Signer_By, @p_Signer_By_Sup, @p_seqNo, @p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers";
                            var appendixId = (long)(await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlInsAppendix, new
                            {
                                p_AppendixNo = prcContractTemplateDto.ContractAppendixNo,
                                p_AppendixDate = prcContractTemplateDto.AppendixDate,
                                p_EffectiveFrom = prcContractTemplateDto.EffectiveFromAppendix,
                                p_EffectiveTo = prcContractTemplateDto.EffectiveToAppendix,
                                p_Description = prcContractTemplateDto.DescriptionAppendix,
                                p_ContractId = id,
                                p_user = AbpSession.UserId,
                                p_Signer_By = prcContractTemplateDto.SignerByAppendix,
                                p_Signer_By_Sup = prcContractTemplateDto.SignerBySuplierAppendix,
                                p_seqNo = pcNo,
                                p_TitleSigner = prcContractTemplateDto.TitlesSignerByAppendix,
                                p_TiitleSignerNcc = prcContractTemplateDto.TitlesSignerBySuplierAppendix,
                                p_PlaceOfDelivery = prcContractTemplateDto.PlaceOfDelivery,
                                p_Shipment = prcContractTemplateDto.Shipment,
                                p_PaidBy = prcContractTemplateDto.PaidBy,
                                p_Orthers = prcContractTemplateDto.Orthers
                            })).ToList()[0].Id;

                            var listItemsInsert = input.listItems.FindAll(e => e.ContractAppendixNo == prcContractTemplateDto.ContractAppendixNo && e.ContractNo == prcContractTemplateDto.ContractNo);
                            ImportListDetails(listItemsInsert, appendixId);

                            var inputCreateStep = new CreateRequestApprovalInputDto();
                            inputCreateStep.ReqId = appendixId;
                            inputCreateStep.ProcessTypeCode = "AN";
                            await _sentRequestInf.CreateRequestApprovalTree(inputCreateStep);
                        }
                    }
                    else
                    {
                        throw new UserFriendlyException(400, L("Create contract Error!"));
                    }
                }
            }

            return "Info: Save successfully";
        }

        public async Task createRequestBackdate(InputContractBackdateDto inputContractBackdateDto)
        {
            string backdateNum = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.ContractBackdate);
            PrcAppendixContract prcAppendixContract = _repoPrcAppendixContract.FirstOrDefault(p => p.Id == inputContractBackdateDto.Id);

            if (prcAppendixContract != null) {
                PrcAppendixContract prcAppendixContractBackdate = prcAppendixContract;
                prcAppendixContractBackdate.Id = 0;
                prcAppendixContractBackdate.IsBackdate = true;
                prcAppendixContractBackdate.NoteOfBackdate = inputContractBackdateDto.NoteOfBackdate;
                prcAppendixContractBackdate.ExpiryBackdate = inputContractBackdateDto.ExpiryBackdate;
                prcAppendixContractBackdate.SeqNo = backdateNum;
                prcAppendixContractBackdate.EffectiveFrom = DateTime.Now.Date;
                prcAppendixContractBackdate.EffectiveTo = DateTime.Now.Date.AddDays((double)prcAppendixContractBackdate.ExpiryBackdate);
                await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prcAppendixContractBackdate);
                await CurrentUnitOfWork.SaveChangesAsync();

                var input = new CreateRequestApprovalInputDto();
                input.ReqId = prcAppendixContractBackdate.Id;
                input.ProcessTypeCode = "BD";
                await _sentRequestInf.CreateRequestApprovalTree(input);
            }
            else
            {
                throw new UserFriendlyException(400, L("Không tìm thấy phụ lục hợp đồng!"));
            }
        }
    }
}
