using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllApprovalInfoForViewDto : EntityDto<long>
    {

        public long? ApprovalSeq { get; set; }
        public string ApprovalUserName { get; set; }
        public string ApprovalUserDepartment { get; set; }
        public string ApprovalUserTitle { get; set; }
        public DateTime? LeadTime { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public DateTime? RejectDate { get; set; }
        [StringLength(20)]
        public string ApprovalStatus { get; set; }
        [StringLength(500)]
        public string Note { get; set; }
        public long DayOfProcess { get; set; }
        public long? ApprovalUserId { get; set; }
        public long? ApprovalTreeDetailId { get; set; }
        public bool? IsBuyer { get; set; }
    }
}
