using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetAllPrForExportDto
    {
        public long? Id { get; set; }
        public string RequisitionNo { get; set; }
        public string PartNo { get; set; }
        public string PartName { get; set; }
        public string ProductGroupName { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public DateTime? NeedByDate { get; set; }
        public DateTime? RateDate { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public string DestinationTypeCode { get; set; }
        public string RequesterName { get; set; }
        public string SuggestedVendorName { get; set; }
        public long? Amount { get; set; }
        public string ChargeAccount { get; set; }
    }
}
