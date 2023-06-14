using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace tmss.UR.BuyFromCatalogRequest.Dto
{
    public class GetAllCatalogProductInput : PagedAndSortedResultRequestDto
    {
        public string ProductName { get; set; }
        [StringLength(255)]
        public string SupplierName { get; set; }
        public long? InventoryGroupId { get; set; }
    }
}
