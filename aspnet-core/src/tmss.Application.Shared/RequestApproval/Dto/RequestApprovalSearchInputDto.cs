using Abp.Application.Services.Dto;
using System;

namespace tmss.RequestApproval.Dto
{
    public class RequestApprovalSearchInputDto : PagedAndSortedResultRequestDto
    {
        public long ApprovalUserId { get; set; }
        public string ApprovalStatus { get; set; }
        public string RequestNo { get; set; }
        public DateTime? SendDateFrom { get; set; }
        public DateTime? SendDateTo { get; set; }
        public long RequestTypeId { get; set; }
    }
}
