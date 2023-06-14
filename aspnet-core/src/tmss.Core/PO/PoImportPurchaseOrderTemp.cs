using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Stripe;
using System.IO;

namespace tmss.PO
{
    public class PoImportPurchaseOrderTemp : FullAuditedEntity<long>, IEntity<long>
    {
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductGroupName { get; set; }
        public string Comments { get; set; }
        public string Uom { get; set; }
        public string Quantity { get; set; }
        public string UnitPrice { get; set; }
        public string BudgetCode { get; set; }
        public string VendorName { get; set; }
        public long? VendorId { get; set; }
        public string VendorSiteName { get; set; }
        public long? VendorSiteId { get; set; }
        public string PriceType { get; set; }
        public string Contract { get; set; }
        public string NeedByPaintSteel { get; set; }
        public string NeedByLocalParts { get; set; }
        public string Requisition { get; set; }
        public string GlDate { get; set; }
        public string Organization { get; set; }
        public string DestinationType { get; set; }
        public string Requester { get; set; }
        public string Location { get; set; }
        public string Subinventory { get; set; }
        public string MinimumReleaseAmount { get; set; }
        public string TransactionNature { get; set; }
        public string Promised { get; set; }
        public string RequisitionLine { get; set; }
        public string ChargeAccount { get; set; }
        public string ShipTo { get; set; }

    }
}
