using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Supplier.Dto
{
    public class SupplierOutputSelectDto
    {
        public long Id { get; set; }
        public string SupplierName { get; set; }
        public string SupplierNumber { get; set; }
        public string VatRegistrationNum { get; set; }
        public string VatRegistrationInvoice { get; set; }
        public string TaxPayerId { get; set; }
        public long? RegistryId { get; set; }
        public DateTime? StartDateActive { get; set; }
        public DateTime? EndDateActive { get; set; }
        public string AbbreviateName { get; set; }
    }
}
