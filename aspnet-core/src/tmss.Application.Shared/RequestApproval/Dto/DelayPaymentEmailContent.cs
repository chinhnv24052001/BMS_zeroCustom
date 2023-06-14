using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class DelayPaymentEmailContent
    {
        public string[] ReceiveEmail { get; set; }
        public string Subject { get; set; }
        public string DealerName { get; set; }
        public string ContentEmail { get; set; }
        public string FileName { get; set; }
        public string CCEmail { get; set; }

    }
}
