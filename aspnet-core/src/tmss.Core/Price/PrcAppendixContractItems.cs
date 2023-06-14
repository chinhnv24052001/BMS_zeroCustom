using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PayPalCheckoutSdk.Orders;
using Stripe;
using System.Drawing;

namespace tmss.Price
{
    public class PrcAppendixContractItems : FullAuditedEntity<long>, IEntity<long>
    {

        public long? AppendixId { get; set; }
        public long? ItemId {get; set; }
        public string PartNo {get; set; }
        public string PartName {get; set; }
        public string PartNameSupplier {get; set; }
        public decimal? UnitPrice {get; set; }
        public decimal? TaxPrice {get; set; }
        public decimal? Qty {get; set; }
        public string CurrencyCode {get; set; }
        public long? UnitOfMeasureId {get; set; }
        public long? InventoryGroupId {get; set; }
        public long? CatalogId {get; set; }
        public string Length {get; set; }
        public string Width {get; set; }
        public string Height {get; set; }
        public string UnitLength {get; set; }
        public string UnitWidth {get; set; }
        public string UnitHeight {get; set; }
        public string Weight {get; set; }
        public string UnitWeight {get; set; }
        public string COO {get; set; }
        public string UnitOfProduct {get; set; }
        public string UnitOfExchangeProd {get; set; }
        public string Producer {get; set; }
        public long? ContractId {get; set; }
        public string Description {get; set; }
        public string Material {get; set; }
        public string Color {get; set; }
        public long? CurrencyId {get; set; }
        public long? SupplierId {get; set; }

    }
}
