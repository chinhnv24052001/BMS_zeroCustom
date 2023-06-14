using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllUserRequestInfoToExportDto
    {
        [StringLength(50)]
        public string UserRequestNumber { get; set; }
        [StringLength(255)]
        public string UserRequestName { get; set; }
        public DateTime? RequestDate { get; set; }
        public string RequestUser { get; set; }
        [StringLength(200)]
        public string DepartmentName { get; set; }
        public string SupplierName { get; set; }
        [StringLength(25)]
        public string ApprovalStatus { get; set; }
        [StringLength(200)]
        public string DepartmentApprovalName { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? TotalPrice { get; set; }
        [StringLength(15)]
        public string CurrencyCode { get; set; }
        public string ProductGroupName { get; set; }
        public string BudgetCode { get; set; }
        public string Note { get; set; }

        [StringLength(40)]
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Uom { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal Quantity { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string ProductBudgetCode { get; set; }
    }
}
