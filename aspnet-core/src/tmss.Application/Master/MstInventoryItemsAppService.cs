

using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Common;
using tmss.Dto;
using tmss.ImportExcel.Product.Dto;
using tmss.InvoiceModule.Dto;
using tmss.Master.InventoryCodeConfig.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.InventoryItems;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.Storage;

namespace tmss.Master
{
    public class MstInventoryItemsAppService : tmssAppServiceBase, IMstInventoryItemsAppService
    {
        private readonly IRepository<MstInventoryGroup, long> _mstInventoryGroupRepository;
        private readonly IRepository<MstInventoryItems, long> _mstInventoryItemsRepository;
        private readonly IDapperRepository<MstInventoryItems, long> _spRepository;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private string _connectionString;


        public MstInventoryItemsAppService(IRepository<MstInventoryGroup, long> mstInventoryGroupRepository,
            IRepository<MstInventoryItems, long> mstInventoryItemsRepository,
            IDapperRepository<MstInventoryItems, long> spRepository,
            ITempFileCacheManager tempFileCacheManager
            )
        {
            _mstInventoryGroupRepository = mstInventoryGroupRepository;
            _mstInventoryItemsRepository = mstInventoryItemsRepository;
            _spRepository = spRepository;
            _tempFileCacheManager = tempFileCacheManager;
            var appsettingsjson = JObject.Parse(File.ReadAllText("appsettings.json"));
            var connectionStrings = (JObject)appsettingsjson["ConnectionStrings"];
            _connectionString = connectionStrings.Property(tmssConsts.ConnectionStringName).Value.ToString();

        }

        [AbpAuthorize(AppPermissions.ProductManagement_Search)]
        public async Task<PagedResultDto<InventoryItemsSearchOutputDto>> searchInventoryItems(InventoryItemsSearchInputDto inventoryItemsSearchInput)
        {
            IEnumerable<InventoryItemsSearchOutputDto> inventoryItemsSearchOutputDtos = 
                await _spRepository.QueryAsync<InventoryItemsSearchOutputDto>("exec sp_MstInventoryItems_Search @Keyword, @InventoryGroupId, @CatalogId, @SupplierId, @Page, @PageSize", 
                new { 
                    inventoryItemsSearchInput.Keyword,
                    inventoryItemsSearchInput.InventoryGroupId,
                    inventoryItemsSearchInput.CatalogId,
                    inventoryItemsSearchInput.SupplierId,
                    inventoryItemsSearchInput.Page,
                    inventoryItemsSearchInput.PageSize });
            var result = inventoryItemsSearchOutputDtos.AsQueryable();
            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;
            return new PagedResultDto<InventoryItemsSearchOutputDto>(
               totalCount,
               result.ToList()
               );
        }

        [AbpAuthorize(AppPermissions.ProductManagement_Add)]
        public async Task<string> MstProductMngtInsert(InventoryItemsSearchOutputDto dto)
        {
            dto.OrganizationId = 84;
            if (dto.Base64Image != null)
            {
                dto.ImageFileName = Path.GetFileNameWithoutExtension(dto.PartName) + DateTime.Now.Millisecond.ToString() + ".png";
                GenarateFileAndCoppy(dto.Base64Image, dto.ImageFileName);
            }
            //Check Exists
            string _sql = "EXEC sp_MstInventoryItems_CheckExists @p_part_no, @p_org, @p_color";
            var list = (await _spRepository.QueryAsync<InventoryItemsSearchOutputDto>(_sql, new
            {
                p_part_no = dto.PartNo,
                p_org = dto.OrganizationId,
                p_color = dto.Color
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";

            string _sqlIns = "EXEC sp_MstInventoryItems_Insert @p_InventoryGroupId, @p_OrganizationId, @p_CurrencyId, @p_SupplierId, " +
                "@p_PrimaryUomCode, @p_PrimaryUnitOfMeasure, @p_ItemType, @p_IsActive,@p_InventoryItemFlag, @p_CostOfSalesAccount, @p_ExpenseAccount," +
                " @p_SalesAccount, @p_PartNo, @p_Corlor, @p_PartName, @p_PartNameSupplier, @p_EffectiveFrom, @p_EffectiveTo, @p_UnitPrice, @p_TaxPrice, @p_user_id, @p_ImageFileName," +
                " @p_Producer, @p_Origin, @p_HowToPack, @p_AvailableTime, @p_Priority, @p_SafetyStockLevel, @p_MinimumQuantity, @p_FactoryUse, @p_ConvertionUnitOfCode, @p_Material, @p_Length," +
                " @p_UnitLength, @p_Width, @p_UnitWidth, @p_Height, @p_UnitHeight, @p_Weight, @p_UnitWeight, @p_Catalog";
            await _spRepository.ExecuteAsync(_sqlIns, new
            {
                p_InventoryGroupId = dto.InventoryGroupId,
                p_OrganizationId = dto.OrganizationId,
                p_CurrencyId = dto.CurrencyId,
                p_SupplierId = dto.SupplierId,
                p_PrimaryUomCode = dto.PrimaryUomCode,
                p_PrimaryUnitOfMeasure = dto.PrimaryUnitOfMeasure,
                p_ItemType = ' ',
                p_IsActive = dto.IsActive,
                p_InventoryItemFlag = ' ',
                p_CostOfSalesAccount = dto.CostOfSalesAccount,
                p_ExpenseAccount = dto.ExpenseAccount,
                p_SalesAccount  = dto.SalesAccount,
                p_PartNo = dto.PartNo,
                p_Corlor = dto.Color,
                p_PartName = dto.PartName,
                p_PartNameSupplier = dto.PartNameSupplier,
                p_EffectiveFrom = dto.EffectiveFrom,
                p_EffectiveTo = dto.EffectiveTo,
                p_UnitPrice = dto.UnitPrice,
                p_TaxPrice = dto.TaxPrice,
                p_user_id = AbpSession.UserId,
                p_ImageFileName = dto.ImageFileName,
                p_Producer =dto.Producer,
                p_Origin = dto.Origin,
                p_HowToPack=dto.HowToPack,
                p_AvailableTime = dto.AvailableTime,
                p_Priority = dto.Priority,
                p_SafetyStockLevel = dto.SafetyStockLevel,
                p_MinimumQuantity = dto.MinimumQuantity,
                p_FactoryUse = dto.FactoryUse,
                p_ConvertionUnitOfCode = dto.ConvertionUnitOfCode,
                p_Material = dto.Material,
                p_Length = dto.Length,
                p_UnitLength = dto.UnitLength,
                p_Width = dto.Width,
                p_UnitWidth = dto.UnitWidth,
                p_Height = dto.Height,
                p_UnitHeight = dto.UnitHeight,
                p_Weight = dto.Weight,
                p_UnitWeight = dto.UnitWeight,
                p_Catalog = dto.Catalog
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.ProductManagement_Edit)]
        public async Task<string> MstProductMngtUpdate(InventoryItemsSearchOutputDto dto)
        {
            string fileName = "";
            if (dto.Base64Image != null )
            {
                dto.ImageFileName = Path.GetFileNameWithoutExtension(dto.PartName) + DateTime.Now.Millisecond.ToString() + ".png";
                GenarateFileAndCoppy(dto.Base64Image, dto.ImageFileName);
            }

            dto.OrganizationId = 84;
            string _sqlIns = "EXEC sp_MstInventoryItems_Update @p_id, @p_InventoryGroupId, @p_OrganizationId, @p_CurrencyId, @p_SupplierId, " +
               "@p_PrimaryUomCode, @p_PrimaryUnitOfMeasure, @p_ItemType, @p_IsActive,@p_InventoryItemFlag, @p_CostOfSalesAccount, @p_ExpenseAccount," +
               " @p_SalesAccount, @p_PartNo, @p_Corlor, @p_PartName, @p_PartNameSupplier, @p_EffectiveFrom, @p_EffectiveTo, @p_UnitPrice, @p_TaxPrice, @p_user_id, @p_PartNoCPS, @p_ImageFileName," +
               " @p_Producer, @p_Origin, @p_HowToPack, @p_AvailableTime, @p_Priority, @p_SafetyStockLevel, @p_MinimumQuantity, @p_FactoryUse, @p_ConvertionUnitOfCode, @p_Material, @p_Length,"+
               " @p_UnitLength, @p_Width, @p_UnitWidth, @p_Height, @p_UnitHeight, @p_Weight, @p_UnitWeight, @p_Catalog";
            await _spRepository.ExecuteAsync(_sqlIns, new
            {   
                p_id = dto.Id,
                p_InventoryGroupId = dto.InventoryGroupId,
                p_OrganizationId = dto.OrganizationId,
                p_CurrencyId = dto.CurrencyId,
                p_SupplierId = dto.SupplierId,
                p_PrimaryUomCode = dto.PrimaryUomCode,
                p_PrimaryUnitOfMeasure = dto.PrimaryUnitOfMeasure,
                p_ItemType = ' ',
                p_IsActive = dto.IsActive,
                p_InventoryItemFlag = ' ',
                p_CostOfSalesAccount = dto.CostOfSalesAccount,
                p_ExpenseAccount = dto.ExpenseAccount,
                p_SalesAccount = dto.SalesAccount,
                p_PartNo = dto.PartNo,
                p_Corlor = dto.Color,
                p_PartName = dto.PartName,
                p_PartNameSupplier = dto.PartNameSupplier,
                p_EffectiveFrom = dto.EffectiveFrom,
                p_EffectiveTo = dto.EffectiveTo,
                p_UnitPrice = dto.UnitPrice,
                p_TaxPrice = dto.TaxPrice,
                p_user_id = AbpSession.UserId,
                p_PartNoCPS = dto.PartNoCPS,
                p_ImageFileName = dto.ImageFileName,
                p_Producer =dto.Producer,
                p_Origin = dto.Origin,
                p_HowToPack=dto.HowToPack,
                p_AvailableTime = dto.AvailableTime,
                p_Priority = dto.Priority,
                p_SafetyStockLevel = dto.SafetyStockLevel,
                p_MinimumQuantity = dto.MinimumQuantity,
                p_FactoryUse = dto.FactoryUse,
                p_ConvertionUnitOfCode = dto.ConvertionUnitOfCode,
                p_Material = dto.Material,
                p_Length = dto.Length,
                p_UnitLength = dto.UnitLength,
                p_Width = dto.Width,
                p_UnitWidth = dto.UnitWidth,
                p_Height = dto.Height,
                p_UnitHeight = dto.UnitHeight,
                p_Weight = dto.Weight,
                p_UnitWeight = dto.UnitWeight,
                p_Catalog = dto.Catalog
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.ProductManagement_Import, AppPermissions.MstPriceManagement_Import)]
        public async Task<FileDto> ExportTemplate(int type)
        {
            try
            {
                string fileName = type == 0 ? "CPS_Template_ImportInventoryItemPrices.xlsx" : "CPS_Template_ImportInventoryItems.xlsx";

                // Set License
                var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
                SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

                // Path to File Template
                string template = "wwwroot/Excel_Template";
                string path = "";
                path = Path.Combine(Directory.GetCurrentDirectory(), template, fileName);

                var workBook = ExcelFile.Load(path);
                var workSheet = workBook.Worksheets[0];

                MemoryStream stream = new MemoryStream();
                var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
                workBook.Save(tempFile);

                stream = new MemoryStream(File.ReadAllBytes(tempFile));
                _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
                File.Delete(tempFile);
                stream.Position = 0;

                return await Task.FromResult(file);
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(00, L(ex.ToString()));
            }
        }
        // create list ImpInventoryItemPriceDto
        [AbpAuthorize(AppPermissions.ProductManagement_Import)]
        public async Task<List<ProductImportDto>> CreateImpInventoryItemDto(List<ProductImportDto> listTemp)
        {
            DataTable table = new DataTable();
            table.TableName = "ImpInventoryItemTemp";

            table.Columns.Add("Id", typeof(long));
            table.Columns.Add("ProductGroupName", typeof(string));
            table.Columns.Add("InventoryGroupId", typeof(long));
            table.Columns.Add("CatalogName", typeof(string));
            table.Columns.Add("ItemsCode", typeof(string));
            table.Columns.Add("Color", typeof(string));
            table.Columns.Add("ItemsName", typeof(string));
            table.Columns.Add("PartNameSupplier", typeof(string));
            table.Columns.Add("SupplierName", typeof(string));
            table.Columns.Add("SupplierId", typeof(long));
            table.Columns.Add("InventoryItemId", typeof(long)); 
            table.Columns.Add("CreatorUserId", typeof(long));
            table.Columns.Add("Remark", typeof(string));
            table.Columns.Add("ImageFileName", typeof(string));
            table.Columns.Add("PrimaryUomCode", typeof(string));
            table.Columns.Add("PrimaryUnitOfMeasure", typeof(string));
            table.Columns.Add("Producer", typeof(string));
            table.Columns.Add("Origin", typeof(string));
            table.Columns.Add("HowToPack", typeof(string));
            table.Columns.Add("AvailableTime", typeof(long));
            table.Columns.Add("Priority", typeof(int));
            table.Columns.Add("SafetyStockLevel", typeof(int));
            table.Columns.Add("MinimumQuantity", typeof(int));
            table.Columns.Add("FactoryUse", typeof(string));
            table.Columns.Add("Length", typeof(int));
            table.Columns.Add("Width", typeof(int));
            table.Columns.Add("Height", typeof(int));
            table.Columns.Add("Weight", typeof(int));
            table.Columns.Add("UnitLength", typeof(string));
            table.Columns.Add("UnitWidth", typeof(string));
            table.Columns.Add("UnitHeight", typeof(string));
            table.Columns.Add("UnitWeight", typeof(string));
            table.Columns.Add("Specification", typeof(string));
            table.Columns.Add("ApplicableProgram", typeof(string));
            //table.Columns.Add("CurrencyCode", typeof(string));
            //table.Columns.Add("CurrencyId", typeof(long));

            foreach (var item in listTemp)
            {
                GenarateFileAndCoppy(item.ByteFileImage, item.ProductImage);
                var row = table.NewRow();
                row["Id"] = 0;
                row["ProductGroupName"] = item.ProductGroupName;
                row["InventoryGroupId"] = 0;
                row["CatalogName"] = item.Catalog;
                row["ItemsCode"] = item.ItemsCode;
                row["Color"] = item.Color;
                row["ItemsName"] = item.ItemsName;
                row["PartNameSupplier"] = item.PartNameSupplier;
                row["SupplierName"] = item.SupplierName;
                row["SupplierId"] = 0;
                row["InventoryItemId"] = 0;
                row["CreatorUserId"] = AbpSession.UserId;
                row["Remark"] = "";
                row["ImageFileName"] = item.ProductImage;
                row["PrimaryUomCode"] = item.UnitOfMeasure;
                row["PrimaryUnitOfMeasure"] = "";
                row["Producer"] = item.Producer;
                row["Origin"] = item.Origin;
                row["HowToPack"] = item.HowToPack;
                row["AvailableTime"] = string.IsNullOrEmpty(item.AvailableTime) ? DBNull.Value : item.AvailableTime;
                row["Priority"] = item.Priority;
                row["SafetyStockLevel"] = item.SafetyStockLevel;
                row["MinimumQuantity"] = item.MinimumQuantity;
                row["FactoryUse"] = item.FactoryUse;
                row["Length"] = item.Length;
                row["Width"] = item.Width;
                row["Height"] = item.Height;
                row["UnitLength"] = item.UnitLength;
                row["UnitWidth"] = item.UnitWidth;
                row["UnitHeight"] = item.UnitHeight;
                row["UnitWeight"] = item.UnitWeight;
                row["Specification"] = item.Specification;
                row["ApplicableProgram"] = item.ApplicableProgram;
                //row["CurrencyCode"] = item.CurrencyCode;
                //row["CurrencyId"] = 0;
                table.Rows.Add(row);
            }
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string queryString = "delete from ImpInventoryItemTemp where CreatorUserId = @UserId";
                await conn.OpenAsync();
                SqlCommand command = new SqlCommand(queryString, conn);
                command.Parameters.AddWithValue("@UserId", AbpSession.UserId);
                try
                {
                    await command.ExecuteReaderAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                }
                finally
                 {
                    await conn.CloseAsync();
                }
                await conn.OpenAsync(); 
                using (var bulkInsert = new SqlBulkCopy(conn))
                {
                    bulkInsert.DestinationTableName = table.TableName;
                    try
                    {
                        await bulkInsert.WriteToServerAsync(table);
                        string queryStringUpdate = "EXEC dbo.[sp_MstInventoryItem$Import] @CreatorUserId";
                        SqlCommand commandUpdate = new SqlCommand(queryStringUpdate, conn);
                        commandUpdate.Parameters.AddWithValue("@CreatorUserId", AbpSession.UserId);
                        await commandUpdate.ExecuteReaderAsync();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                    finally
                    {
                        await conn.CloseAsync();
                    }
                }
            }
            IEnumerable<ProductImportDto> inventoryItemsTemp = await _spRepository.QueryAsync<ProductImportDto>("select * from ImpInventoryItemTemp where CreatorUserId = @UserId", new { AbpSession.UserId });
            var result = inventoryItemsTemp.AsQueryable();
            return result.OrderByDescending(r => r.Remark).ToList();
        }

        //Search InventoryItemPrice
        [AbpAuthorize(AppPermissions.MstPriceManagement_Search)]
        public async Task<PagedResultDto<InventoryPriceSearchOutputDto>> searchInventoryPrice(InventoryPriceSearchInputDto inventoryItemsSearchInput)
        {
            IEnumerable<InventoryPriceSearchOutputDto> inventoryItemsSearchOutputDtos = await _spRepository.QueryAsync<InventoryPriceSearchOutputDto>("exec sp_MstInventoryItemPrices$Search @Keyword, @InventoryGroupId, @SupplierId, @Page, @PageSize", new { inventoryItemsSearchInput.Keyword, inventoryItemsSearchInput.InventoryGroupId, inventoryItemsSearchInput.SupplierId, inventoryItemsSearchInput.Page, inventoryItemsSearchInput.PageSize });
            var result = inventoryItemsSearchOutputDtos.AsQueryable();
            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;
            return new PagedResultDto<InventoryPriceSearchOutputDto>(
               totalCount,
               result.ToList()
               );
        }

        //Save File
        private void GenarateFileAndCoppy(byte[] byteFile, string fileName)
        {
            if (byteFile != null)
            {
                var folderName = Path.Combine("wwwroot", "ProductImage");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                var fullPath = Path.Combine(pathToSave, fileName);

                if (Directory.Exists(folderName) == false)
                {
                    Directory.CreateDirectory(folderName);
                }
                if (fullPath != null && fullPath.Length > 0)
                {
                    if (!Directory.Exists(Path.GetDirectoryName(fullPath)))
                        Directory.CreateDirectory(Path.GetDirectoryName(fullPath));
                    FileStream file = File.Create(fullPath);
                    file.Write(byteFile, 0, byteFile.Length);
                    file.Close();
                }
            }
        }

        public async Task<List<VendorComboboxDto>> getAllVendor()
        {
            string _sql = "EXEC sp_MstSuppliersGetVendor ";
            var list = (await _spRepository.QueryAsync<VendorComboboxDto>(_sql, new
            {
            })).ToList();
            return list;
        }

        public async Task<List<CurrencyComboboxDto>> getAllCurrency()
        {
            string _sql = "EXEC sp_MstCurrencyGetAll ";
            var list = (await _spRepository.QueryAsync<CurrencyComboboxDto>(_sql, new
            {
            })).ToList();
            return list;
        }

        public async Task<List<MasterLookupDto>> GetAllMstUnitOfMeasure()
        {
            string _sql = "EXEC sp_MstUnitOfMeasureGetAll";
            var list = (await _spRepository.QueryAsync<MasterLookupDto>(_sql)).ToList();
            return list;
        }

        public async Task<List<MstInventoryCodeConfigDto>> GetAllInventoryGroup()
        {
            string _sql = "EXEC sp_getAllIventoryCodeConfig";
            var list = (await _spRepository.QueryAsync<MstInventoryCodeConfigDto>(_sql)).ToList();
            return list;
        }

        //use MstInventoryItemsDto fe
        public void CreateOrEditInventoryItem(MstInventoryItemsDto mstInventoryItemsDto)
        {

        }

        public async Task<byte[]> GetFileByteImage(long id)
        {
            byte[] byteImage = null;
            if(id > 0)
            {
                //var mstInventoryItem = await _mstInventoryItemsRepository.FirstOrDefaultAsync(id);
                var mstInventoryItem  = (await _spRepository.QueryAsync<MstInventoryItems>("select * from MstInventoryItems where Id = @Id", new { id })).FirstOrDefault();
                
                if (mstInventoryItem != null)
                {
                    if(mstInventoryItem.ImageFileName != null)
                    {
                        var folderName = Path.Combine("wwwroot", "ProductImage");
                        var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                        var imagePath = Path.Combine(pathToSave, mstInventoryItem.ImageFileName);

                        FileStream stream = File.OpenRead(imagePath);
                        byteImage = new byte[stream.Length];
                        stream.Read(byteImage, 0, byteImage.Length);
                    }    
                }
            }
            return byteImage;
        }

        [AbpAuthorize(AppPermissions.ProductManagement_Delete)]
        public async Task<string> MstProductMngtDelete(long id)
        {
            string _sqlVal = "EXEC MstInventoryItemsValidateDelete @p_item_id ";

            var list = (await _spRepository.QueryAsync<InventoryItemsSearchOutputDto>(_sqlVal, new
            {
                p_item_id = id,
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Can't delete this record!";

            string _sqlDel = "EXEC sp_MstInventoryItems_Delete @p_Id ";
            await _spRepository.ExecuteAsync(_sqlDel, new
            {
                p_id = id,
            });

            return "Info: Delete successfully!";
        }

        [AbpAuthorize(AppPermissions.ProductManagement_Export)]
        public async Task<byte[]> MstInventoryItemsExportExcel(InputInventoryItemsSearchInputDto input)
        {

            string _sql = "exec sp_MstInventoryItems_Excel @Keyword, @InventoryGroupId";
            var listData = (await _spRepository.QueryAsync<InventoryItemsSearchOutputDto>(_sql, new
            {
                @Keyword = input.Keyword,
                @InventoryGroupId = input.InventoryGroupId
            })).ToList();

            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = listData.ToList();
            List<string> list = new List<string>();
            list.Add("PartNo");
            list.Add("Color");
            list.Add("PartNoCPS");
            list.Add("PartName");
            list.Add("UnitPrice");
            list.Add("TaxPrice");
            list.Add("CurrencyCode");
            list.Add("PrimaryUnitOfMeasure");
            list.Add("EffectiveFrom");
            list.Add("EffectiveTo");
            list.Add("SupplierName");
            list.Add("PartNameSupplier");
            list.Add("IsActive");


            List<string> listHeader = new List<string>();
            listHeader.Add("PartNo");
            listHeader.Add("Color");
            listHeader.Add("Part No CPS");
            listHeader.Add("Part Name");
            listHeader.Add("Unit Price");
            listHeader.Add("Tax Price");
            listHeader.Add("Currency Code");
            listHeader.Add("Primary Unit Of Measure");
            listHeader.Add("Effective From");
            listHeader.Add("Effective To");
            listHeader.Add("Supplier Name");
            listHeader.Add("Part Name Supplier");
            listHeader.Add("Status");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);

            Commons.ExcelFormatDate(v_worksheet, 8);
            Commons.ExcelFormatDate(v_worksheet, 9);


            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            xlWorkBook.Save(tempFile);
            var tempFile2 = Commons.SetAutoFit(tempFile, p_header.Length);
            byte[] fileByte = await File.ReadAllBytesAsync(tempFile2);
            File.Delete(tempFile);
            File.Delete(tempFile2);
            return fileByte;
        }
    }
}