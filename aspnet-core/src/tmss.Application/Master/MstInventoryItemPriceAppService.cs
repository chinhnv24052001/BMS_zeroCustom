using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.EntityFrameworkCore;
using tmss.Master.InventoryItemPrices;
using tmss.Master.InventoryItemPrices.Dto;
using tmss.Master.InventoryItems.Dto;

namespace tmss.Master
{
    public class MstInventoryItemPriceAppService : tmssAppServiceBase, IMstInventoryItemPriceAppService
    {
        private readonly IDapperRepository<MstInventoryItemPrices, long> _spRepository;
        private readonly IRepository<MstInventoryItemPrices, long> _mstInventoryItemPrices;
        private string _connectionString;
        public MstInventoryItemPriceAppService(
          IDapperRepository<MstInventoryItemPrices, long> spRepository,
          IRepository<MstInventoryItemPrices, long> mstInventoryItemPrices
          )
        {
            _mstInventoryItemPrices = mstInventoryItemPrices;
            _spRepository = spRepository;
            var appsettingsjson = JObject.Parse(File.ReadAllText("appsettings.json"));
            var connectionStrings = (JObject)appsettingsjson["ConnectionStrings"];
            _connectionString = connectionStrings.Property(tmssConsts.ConnectionStringName).Value.ToString();
        }
        public async Task<PagedResultDto<GetByInventoryItemOutputDto>> GetByInventoryItem(long InventoryItemId)
        {
            IEnumerable<GetByInventoryItemOutputDto> inventoryItemsSearchOutputDtos = await _spRepository.QueryAsync<GetByInventoryItemOutputDto>("exec sp_MstInventoryItemPrices_GetByParent @InventoryItemId", new { InventoryItemId });
            var result = inventoryItemsSearchOutputDtos.AsQueryable();
            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;
            return new PagedResultDto<GetByInventoryItemOutputDto>(
               totalCount,
               result.ToList()
               );
        }
        // create   
        public async Task CreateOrEditInventoryItemPrice(CreateOrEditInventoryItemPriceDto input)
        {
            if (input.Id > 0)
            {
                await updateInventoryItemPrice(input);
            }
            else
            {
                await createInventoryItemPrice(input);
            }
        }
        // update
        private async Task updateInventoryItemPrice(CreateOrEditInventoryItemPriceDto input)
        {
            var inventoryItemPrice = await _mstInventoryItemPrices.GetAsync(input.Id);
            ObjectMapper.Map(input, inventoryItemPrice);
        }
        // create
        private async Task createInventoryItemPrice(CreateOrEditInventoryItemPriceDto input)
        {
            var inventoryItemPrice = ObjectMapper.Map<MstInventoryItemPrices>(input);
            await _mstInventoryItemPrices.InsertAsync(inventoryItemPrice);
        }

        // get by id
        public async Task<GetInventoryItemPriceForEditOutput> GetInventoryItemPriceForEdit(long id)
        {
            var inventoryItemPrice = await _mstInventoryItemPrices.GetAsync(id);
            var output = ObjectMapper.Map<GetInventoryItemPriceForEditOutput>(inventoryItemPrice);
            return output;
        }
        // create list ImpInventoryItemPriceDto
        [AbpAuthorize(AppPermissions.MstPriceManagement_Import)]
        public async Task<List<ImpInventoryItemPriceDto>> CreateImpInventoryItemPriceDto(List<ImpInventoryItemPriceDto> listTemp)
        {
            DataTable table = new DataTable();
            table.TableName = "ImpInventoryItemPriceTemp";
            table.Columns.Add("Id", typeof(long));
            table.Columns.Add("ItemsCode", typeof(string));
            table.Columns.Add("PartNameSupplier", typeof(string));
            table.Columns.Add("SupplierCode", typeof(long));
            table.Columns.Add("TaxPrice", typeof(decimal));
            table.Columns.Add("UnitOfMeasure", typeof(string));
            table.Columns.Add("UnitPrice", typeof(decimal));
            table.Columns.Add("CurrencyCode", typeof(string));
            table.Columns.Add("EffectiveFrom", typeof(DateTime));
            table.Columns.Add("EffectiveTo", typeof(DateTime));
            table.Columns.Add("CurrencyId", typeof(long));
            table.Columns.Add("SupplierId", typeof(long));
            table.Columns.Add("UnitOfMeasureId", typeof(long));
            table.Columns.Add("InventoryItemId", typeof(long));
            table.Columns.Add("CreatorUserId", typeof(long));
            table.Columns.Add("Remark", typeof(string));

            foreach (var item in listTemp)
            {

                var row = table.NewRow();
                row["Id"] = 0;
                row["ItemsCode"] = item.ItemsCode;
                row["PartNameSupplier"] = item.PartNameSupplier;
                row["SupplierCode"] = item.SupplierCode;
                row["TaxPrice"] = item.TaxPrice;
                row["UnitOfMeasure"] = item.UnitOfMeasure;
                row["UnitPrice"] = item.UnitPrice ?? 0;
                row["CurrencyCode"] = item.CurrencyCode;
                row["EffectiveFrom"] = item.EffectiveFrom;
                row["EffectiveTo"] = item.EffectiveTo;
                row["CurrencyId"] = 0;
                row["SupplierId"] = 0;
                row["UnitOfMeasureId"] = 0;
                row["InventoryItemId"] = 0;
                row["CreatorUserId"] = AbpSession.UserId;
                row["Remark"] = "";
                table.Rows.Add(row);
            }
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string queryString = "delete from ImpInventoryItemPriceTemp where CreatorUserId = @UserId";
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
                        string queryStringUpdate = "EXEC dbo.[sp_MstInventoryItemPrice$Import] @CreatorUserId";
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
            IEnumerable<ImpInventoryItemPriceDto> inventoryItemsTemp = await _spRepository.QueryAsync<ImpInventoryItemPriceDto>("select * from ImpInventoryItemPriceTemp where CreatorUserId = @UserId", new { AbpSession.UserId });
            var result = inventoryItemsTemp.AsQueryable();
            
            return result.OrderByDescending(r=>r.Remark).ToList();
        }

        //Get by InventoryItemPriceId
        public async Task<PagedResultDto<GetByInventoryItemPriceOutputDto>> GetByInventoryPriceItem(long InventoryItemPriceId)
        {
            IEnumerable<GetByInventoryItemPriceOutputDto> inventoryItemsSearchOutputDtos = await _spRepository.QueryAsync<GetByInventoryItemPriceOutputDto>("exec sp_MstInventoryItemPriceHistory$Search @InventoryItemPriceId", new { InventoryItemPriceId });
            var result = inventoryItemsSearchOutputDtos.AsQueryable();
            var totalCount = result.ToList().Count > 0 ? result.ToList().Count() : 0;
            return new PagedResultDto<GetByInventoryItemPriceOutputDto>(
               totalCount,
               result.ToList()
               );
        }
    }
}
