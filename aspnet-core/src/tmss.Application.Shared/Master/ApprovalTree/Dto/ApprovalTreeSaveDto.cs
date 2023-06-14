using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ApprovalTree.Dto
{
    public class ApprovalTreeSaveDto
    {
        public long Id { get; set; }
        public long ProcessTypeId { get; set; }
        public long CurrencyId { get; set; }
        public decimal AmountFrom { get; set; }
        public decimal AmountTo { get; set; }
        public long InventoryGroupId { get; set; }
        public string Description { get; set; }
        public List<ApprovalTreeDetailSaveDto> ListApprovalTreeDetailSave { get; set; }
        public long CountItem { get; set; }

    }
}
