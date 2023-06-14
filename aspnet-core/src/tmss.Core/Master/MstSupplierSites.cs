using Abp;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstSupplierSites : FullAuditedEntity<long>, IEntity<long>
    {
        public string Country { get; set; }
        public long? ShipToLocationId { get; set; }
        public long? BillToLocationId { get; set; }
        public int AcctsPayCodeCombinationId { get; set; }
        public string PrePayCodeCombinationId { get; set; }
        public string InvoiceCurrencyCode { get; set; }
        public string PaymentCurrencyCode { get; set; }
        public long SupplierId { get; set; }
        public string VendorSiteCode { get; set; }
        public string PurchasingSiteFlag { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public long PartySiteId { get; set; }
        public string LegalBusinessName { get; set; }
        public string InactiveDate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsSiteDefault { get; set; }
    }
}
