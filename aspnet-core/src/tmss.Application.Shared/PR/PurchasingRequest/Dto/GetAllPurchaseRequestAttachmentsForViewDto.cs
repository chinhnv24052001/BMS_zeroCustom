using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetAllPurchaseRequestAttachmentsForViewDto
    {
        public long Id { get; set; }
        public string FileName { get; set; }
        public string ServerFileName { get; set; }
        public string RootPath { get; set; }
        public DateTime? UploadTime { get; set; }
    }
}
