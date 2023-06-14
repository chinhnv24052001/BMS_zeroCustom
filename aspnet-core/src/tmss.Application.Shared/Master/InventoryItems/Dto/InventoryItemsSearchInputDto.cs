using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.InventoryItems.Dto
{
    public class InventoryItemsSearchInputDto 
    {
        public string Keyword { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? CatalogId { get; set; }
        public long? SupplierId { get; set; }
        public long Page { get; set; }
        public long PageSize { get; set; }



    }
}
