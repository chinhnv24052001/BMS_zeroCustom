using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllUserRequestForViewDto : EntityDto<long>
    {
        [StringLength(50)]
        public string UserRequestNumber { get; set; }
        [StringLength(255)]
        public string UserRequestName { get; set; }
        public DateTime? RequestDate { get; set; }
        public long? CreatorUserId { get; set; }
        public string RequestUser { get; set; }
        [StringLength(200)]
        public string DepartmentName { get; set; }
        [StringLength(25)]
        public string ApprovalStatus { get; set; }
        [StringLength(200)]
        public string DepartmentApprovalName { get; set; }
        [StringLength(25)]
        public string CheckBudgetStatus { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? TotalPrice { get; set; }
        [StringLength(15)]
        public string CurrencyCode { get; set; }
        [StringLength(50)]
        public string ProductGroupName { get; set; }
        public int TotalCount { get; set;}
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }

    }
}
