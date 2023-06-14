using Abp.Application.Services.Dto;

namespace tmss.Dashboard.MainDashboard.Dto
{
    public class DasboardCatalogs : EntityDto<long>
    {
        public long InventoryGroupId { get; set; }
        public string CatalogName { get; set; }
    }
}
