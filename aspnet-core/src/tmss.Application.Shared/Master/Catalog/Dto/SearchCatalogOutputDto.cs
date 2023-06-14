using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Catalog.Dto
{
    public class SearchCatalogOutputDto: EntityDto<long>
    {
        public string CatalogCode { get; set; }
        public string CatalogName { get; set; }
        public bool IsActive { get; set; }
        public long? InventoryGroupId { get; set; }
    }
}
