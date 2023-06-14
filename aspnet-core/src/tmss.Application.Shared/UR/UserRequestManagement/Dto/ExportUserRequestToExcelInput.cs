using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class ExportUserRequestToExcelInput
    {
        public bool IsIncludeDetail { get; set; }
        public long? UserId { get; set; }
        public long? InventoryGroupId { get; set; }
        [StringLength(25)]
        public string Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
