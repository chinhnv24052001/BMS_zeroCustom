using System;
using System.ComponentModel.DataAnnotations;
using tmss.Dto;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllUserRequestInput : PagedAndSortedInputDto
    {
        [StringLength(50)]
        public string URNumber { get; set; }
        public long? InventoryGroupId { get; set; }
        [StringLength(25)]
        public string Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public long? PicUserId { get; set; }
    }
}
