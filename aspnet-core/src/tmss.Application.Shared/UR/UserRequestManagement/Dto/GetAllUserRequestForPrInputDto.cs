using System;
using tmss.Dto;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllUserRequestForPrInputDto : PagedAndSortedInputDto
    {
        public string UserRequestNumber { get; set; }
        public long? PreparerId { get; set; }
        public long? BuyerId { get; set; }
        public long? SupplierId { get; set; }
        public long? SupplierSiteId { get; set; }
        public long? DocumentTypeId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
