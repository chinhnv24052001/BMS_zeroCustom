using Abp.Application.Services.Dto;
using System.Collections.Generic;

namespace tmss.Dashboard.MainDashboard.Dto
{
    public class DashboardInventoryGroupForViewDto : EntityDto<long>
    {
        public string InventoryGroupName { get; set; }
        public List<DasboardCatalogs> Catalogs { get; set; }
    }
}
