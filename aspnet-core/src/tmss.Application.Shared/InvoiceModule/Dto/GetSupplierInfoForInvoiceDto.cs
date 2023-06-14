using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.InvoiceModule.Dto
{
    public class GetSupplierInfoForInvoiceDto : EntityDto<long>
    {
        [StringLength(255)]
        public string SupplierName { get; set; }
        [StringLength(50)]
        public string SupplierNumber { get; set; }
        [StringLength(255)]
        public string VatRegistrationNum { get; set; }
        [StringLength(255)]
        public string VatRegistrationInvoice { get; set; }
    }
}
