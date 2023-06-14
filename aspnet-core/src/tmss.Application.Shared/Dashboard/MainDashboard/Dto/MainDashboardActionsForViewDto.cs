using Abp.Application.Services.Dto;
using System;

namespace tmss.Dashboard.MainDashboard.Dto
{
    public class MainDashboardActionsForViewDto : EntityDto<long>
    {
        public string Type { get; set; }
        public string Subject { get; set; }
        public string Requester { get; set; }
        public DateTime RequestDate { get; set; }
        public string ApprovalStatus { get; set; }
        public string RequisitionNo { get; set; }
    }
}
