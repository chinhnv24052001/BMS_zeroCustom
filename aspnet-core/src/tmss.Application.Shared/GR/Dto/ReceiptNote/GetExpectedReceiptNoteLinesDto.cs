using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.GR.Dto
{
    public class GetExpectedReceiptNoteLinesDto
    {
        public bool Checked { get; set; }
        public decimal? QuantityShipped { get; set; }
        public decimal? QuantityRemained { get; set; }
        public decimal? QuantityReceived { get; set; }
        public decimal? QuantityOrdered { get; set; }
        public decimal? QuantityAccumulated { get; set; }
        public string UnitOfMeasure { get; set; }
        public string ItemDescription { get; set; }
        public long? ItemId { get; set; }
        public long? CategoryId { get; set; }
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public string PoTypeLookupCode { get; set; }
        public string PoNo { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public string VendorName { get; set; }
        public string VendorSiteCode { get; set; }
        public string PartNo { get; set; }
        public int PoLineNum { get; set; }

        public DateTime? ExpiryDate { get; set; }
        public DateTime? FinishedDate { get; set; }
        public bool IsManuallyAdded { get; set; }
        public long? InventoryGroupId { get; set; }
        public bool IsInventory { get; set; }
        public string ProductGroupName { get; set; }
    }
}
