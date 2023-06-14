using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.ApprovalTree.Dto
{
    public class ApprovalTreeInputSearchDto : PagedAndSortedInputDto
    {
        public long ProcessTypeId { get; set; }
        public DateTime? CreationTime { get; set; }
        public long InventoryGroupId { get; set; }
    }
}
