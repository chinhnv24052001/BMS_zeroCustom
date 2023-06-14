using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.Payment.Dto
{
    public class PaymentAttachmentsDto
    {
        public long Id { get; set; }
        public long PaymentHeaderId { get; set; }
        public string ServerFileName { get; set; }
        public string ServerLink { get; set; }
        public string ContentType { get; set; }
    }
}
