using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Supplier.Dto
{
    public class SupplierSiteOutputSelectDto
    {
        public long Id { get; set; }
        public string Country { get; set; }
        public long SupplierId { get; set; }
        public string VendorSiteCode { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string LegalBusinessName { get; set; }
        public bool? IsSiteDefault { get; set; }
        public string BankName { get; set; }
        public string BankAccountName { get; set; }
        public string BankAccountNum { get; set; }
    }
}
