using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Price.Dto
{
    public class InputSearchContractTemplate : PagedAndSortedInputDto
    {
        public string ContractNo { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public DateTime? CreationTime { get; set; }
        public string AppendixNo { get; set; }
        public string ApproveBy { get; set; }
        public bool? IsInternal { get; set; }
        public string ApprovalStatus { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? SupplierId { get; set; }
        public long? UserId { get; set; }
    }
}
