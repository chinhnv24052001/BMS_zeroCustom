using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ApprovalTree.Dto
{
    public class ApprovalTreeDetailSelectDto
    {
        public long Id { get; set; }
        public string ProcessType { get; set; }
        public string CurrencyName { get; set; }
        public decimal AmountFrom { get; set; }
        public decimal AmountTo { get; set; }
        public string InventoryGroupName { get; set; }
        public string Description { get; set; }
        public DateTime? CreationTime { get; set; }
        public List<ApprovalTreeDetailOutputSelectDto> ListApprovalTreeDetailItem { get; set; }
    }
}
