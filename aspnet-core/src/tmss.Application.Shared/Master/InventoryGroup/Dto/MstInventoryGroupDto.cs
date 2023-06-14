using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using tmss.Master.ApprovalTree.Dto;

namespace tmss.Master.InventoryGroup.Dto
{
    public class MstInventoryGroupDto : EntityDto<long>
    {
        public string ProductGroupName { get; set; }
        public string ProductGroupCode { get; set; }
        public string PicDepartmentId { get; set; }
        public string PurchaDepartmentId { get; set; }
        public Guid? DeliDepartmentId { get; set; }
        public long? ProductGroupId { get; set; }
        public bool? IsCatalog { get; set; }
        public string DepartmentName { get; set; }
        public string PurchaDepartmentName { get; set; }
        public string DeliDepartmentName { get; set; }
        public string ProductName { get; set; }
        public string UserName { get; set; }
        public string Description { get; set; }
        public bool? IsInventory { get; set; }
        public bool? UR { get; set; }
        public bool? PR { get; set; }
        public bool? PO { get; set; }
        public string Status { get; set; }
        [StringLength(255)]
        public string BudgetCode { get; set; }
        [StringLength(240)]
        public string OrganizationName { get; set; }
        [StringLength(60)]
        public string Location { get; set; }
        [StringLength(500)]
        public string PurchasePurpose { get; set; }
        public List<UserSearchByHrOgrDto> listUser { get; set; }
    }
}
