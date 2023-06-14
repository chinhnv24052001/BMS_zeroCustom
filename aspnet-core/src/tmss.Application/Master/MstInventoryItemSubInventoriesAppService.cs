using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Stripe.Terminal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryItems;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.Locations.Dto;
using tmss.PR;
using tmss.PR.PurchasingRequest.Dto;

namespace tmss.Master
{
    public class MstInventoryItemSubInventoriesAppService : tmssAppServiceBase, IMstInventoryItemSubInventoriesAppService
    {
        private readonly IRepository<MstInventoryItems, long> _mstInventoryItemsRepository;
        private readonly IDapperRepository<MstInventoryItems, long> _spRepository;

        public MstInventoryItemSubInventoriesAppService(IRepository<MstInventoryItems, long> mstInventoryItemsRepository, IDapperRepository<MstInventoryItems, long> spRepository)
        {
            _mstInventoryItemsRepository = mstInventoryItemsRepository;
            _spRepository = spRepository;
        }

        public async Task<List<GettemsSubInventoriesDto>> getAllItemSubInventories(SearchtemsSubInventoriesDto searchInvItemsDto)
        {
            string _sql = "EXEC sp_RcvGetItemsSubInventories @InventoryItemId, @OrganizationId";

            var listInvItems = await _spRepository.QueryAsync<GettemsSubInventoriesDto>(_sql, new
            {
                @InventoryItemId = searchInvItemsDto.InventoryItemId,
                @OrganizationId = searchInvItemsDto.OrganizationId
            });
            return listInvItems.ToList();
        }
        public async Task<List<GettemsSubInventoriesDto>> getAllSubInventories(SearchtemsSubInventoriesDto searchInvItemsDto)
        {
            string _sql = "EXEC sp_RcvGetSubInventories @OrganizationId";

            var listInvItems = await _spRepository.QueryAsync<GettemsSubInventoriesDto>(_sql, new
            {
                @OrganizationId = searchInvItemsDto.OrganizationId
            });
            return listInvItems.ToList();
        }



    }
}
