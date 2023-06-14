using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class PrcContractTemplateDto
    {
        public long? Id { get; set; }
        public long? ContractId { get; set; }
        public string ContractNo { get; set; }
        public DateTime? ContractDate { get; set; }
        public string ContractDateStr { get; set; }
        public DateTime? AppendixDate { get; set; }
        public string AppendixDateStr { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public string EffectiveFromStr { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public DateTime? CreationTime { get; set; }
        public string EffectiveToStr { get; set; }
        public long? SupplierId { get; set; }
        public string SupplierName { get; set; }
        public string Description { get; set; }
        public string ApprovalStatus { get; set; }
        public string DepartmentApprovalName { get; set; }
        public string ApproveName { get; set; }
        public string Signer_By { get; set; }
        public string Signer_By_Suplier { get; set; }
        public string Signer_By_Titles { get; set; }
        public string Signer_By_Suplier_Titles { get; set; }

        public decimal? TotalAmount { get; set; }
        public int? TotalCount { get; set; }
        public int? CountItem { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? PaymentTermsId { get; set; }
        public string ProductGroupName { get; set; }
        public string PaymentermsName { get; set; }

        public string TitleSigner { get; set; }
        public string TitleSignerNcc { get; set; }
        public string PlaceOfDelivery { get; set; }
        public string Shipment { get; set; }
        public string PaidBy { get; set; }
        public string Orthers { get; set; }

        public string ContractAppendixNo { get; set; }
        public DateTime? EffectiveFromAppendix { get; set; }
        public string EffectiveFromStrAppendix { get; set; }
        public DateTime? EffectiveToAppendix { get; set; }
        public string EffectiveToStrAppendix { get; set; }
        public string DescriptionAppendix { get; set; }
        public string SignerByAppendix { get; set; }
        public string SignerBySuplierAppendix { get; set; }

        public string TitlesSignerByAppendix { get; set; }
        public string TitlesSignerBySuplierAppendix { get; set; }
        public string ERROR_DESCRIPTION { get; set; }
    }
}
