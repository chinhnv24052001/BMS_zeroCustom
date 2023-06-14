using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetAllPurchaseOrdersAttachmentsForViewDto
    {
        public long Id { get; set; }
        public string FileName { get; set; }
        public string ServerFileName { get; set; }
        public string RootPath { get; set; }
        public DateTime? UploadTime { get; set; }
    }
}
