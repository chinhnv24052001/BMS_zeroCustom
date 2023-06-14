using tmss.Dto;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllProductInput : PagedAndSortedInputDto
    {
        public long? InventoryGroupId { get; set; }
        public string ProductCode { get; set; }
        public long? CurrencyId { get; set; }
    }
}
