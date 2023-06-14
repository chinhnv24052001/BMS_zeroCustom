using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllSupplier : EntityDto<long>
    {
        [StringLength(255)]
        public string SupplierName { get; set; }
        [StringLength(50)]
        public string SupplierNumber { get; set; }
        [StringLength(255)]
        public string VatRegistrationNum { get; set; }
        [StringLength(255)]
        public string TaxPayerId { get; set; }
        public long? RegistryId { get; set; }
        public DateTime? StartDateActive { get; set; }
        public DateTime? EndDateActive { get; set; }
    }
}
