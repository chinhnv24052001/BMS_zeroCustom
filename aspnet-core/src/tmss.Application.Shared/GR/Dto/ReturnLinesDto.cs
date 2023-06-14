using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.GR.Dto
{
    public class ReturnLinesDto
    {
        public long HeaderId { get; set; }
        public long Id { get; set; }
        public string ReceiptNum { get; set; }
        public string PoNo { get; set; }
        public string PartNo { get; set; }
        public string ItemDescription { get; set; }
        public decimal? QuantityReceived { get; set; }
        public string UnitOfMeasure { get; set; }
        public DateTime? CreationTime { get; set; }
        public string SupplierName { get; set; }
        public string Remark { get; set; }
        public int TotalCount { get; set; }
    }
}
