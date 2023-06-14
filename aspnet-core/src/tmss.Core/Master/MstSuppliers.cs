using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("MstSuppliers")]
    public partial class MstSuppliers : FullAuditedEntity<long>, IEntity<long>
    {
        [StringLength(255)]
        public string SupplierName { get; set; }
        [StringLength(50)]
        public string SupplierNumber { get; set; }
        [StringLength(255)]
        public string VatRegistrationNum { get; set; }
        [StringLength(255)]
        public string VatRegistrationInvoice { get; set; }
        [StringLength(255)]
        public string TaxPayerId { get; set; }
        public long? RegistryId { get; set; }
        public DateTime? StartDateActive { get; set; }
        public DateTime? EndDateActive { get; set; }
        public bool? IsFormOrc { get; set; }
        public string AbbreviateName { get; set; }
        public string Status { get; set; }
    }
}
