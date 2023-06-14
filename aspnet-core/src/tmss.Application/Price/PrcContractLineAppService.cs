using Abp.Dapper.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryItems.Dto;
using tmss.Price.Dto;

namespace tmss.Price
{
    public class PrcContractLineAppService : tmssAppServiceBase, IPrcContractLineAppService
    {
        private readonly IDapperRepository<PrcContractLines, long> _prcContractLineRepository;

        public PrcContractLineAppService(
            IDapperRepository<PrcContractLines, long> prcContractLineRepository
            )
        {
            _prcContractLineRepository = prcContractLineRepository;
        }

        public async Task<List<GetContactLineByIdOutputDto>> GetByHeaderId(long PrcContractHeaderId)
        {
            string _sql = "EXEC sp_PrcContractLines$GetByHeader @PrcContractHeaderId";
            var lstLines = await _prcContractLineRepository.QueryAsync<GetContactLineByIdOutputDto>(_sql, new
            {
                @PrcContractHeaderId = PrcContractHeaderId
            });

            return lstLines.ToList();
        }

        public async Task SaveToTempTable(List<ImpInventoryItemPriceDto> inputData )
        {

            
            if (inputData != null)
            {
                string _sql1 = "delete from ImpInventoryItemPriceTemp where CreatorUserId = @CreatorUserId";
                await _prcContractLineRepository.ExecuteAsync(_sql1, new
                {
                    @CreatorUserId = AbpSession.UserId,
                });
                foreach(var input in inputData)
                {
                    string _sql = "insert into ImpInventoryItemPriceTemp  Values(@ItemsCode, @PartNameSupplier, @SupplierCode, @TaxPrice, @UnitOfMeasure, @UnitPrice, @CurrencyCode, @EffectiveFrom, @EffectiveTo,0,0,0,0,@CreatorUserId,'')";
                    await _prcContractLineRepository.ExecuteAsync(_sql, new
                    {
                        @ItemsCode = input.ItemsCode,
                        @PartNameSupplier = input.PartNameSupplier,
                        @SupplierCode = input.SupplierCode,
                        @TaxPrice = input.TaxPrice,
                        @UnitOfMeasure = input.UnitOfMeasure,
                        @UnitPrice = input.UnitPrice,
                        @CurrencyCode = input.CurrencyCode,
                        @EffectiveFrom = input.EffectiveFrom,
                        @EffectiveTo = input.EffectiveTo,
                        @CreatorUserId = AbpSession.UserId,
                    });
                }
            }
        }

        public async Task<List<ImpInventoryItemPriceDto>> ImportAndGetData(long headerId )
        {
            string _sql1 = "EXEC sp_PrcContractLines$Import @PrcContractHeaderId, @CreatorUserId";
            await _prcContractLineRepository.ExecuteAsync(_sql1, new
            {
                @PrcContractHeaderId = headerId,
                @CreatorUserId = AbpSession.UserId,
            });

            string _sql = "select * from ImpInventoryItemPriceTemp  where CreatorUserId = @CreatorUserId";
            var lstLines = await _prcContractLineRepository.QueryAsync<ImpInventoryItemPriceDto>(_sql, new
            {
                @CreatorUserId = AbpSession.UserId,
            });


            return lstLines.ToList();

        }
    }
}
