using System.Collections.Generic;

namespace tmss.SendMail
{
    public class SendEmailContent
    {
        public string Person { get; set; }
        public string ApprovalPerson { get; set; }
        public string From { get; set; }
        public string Document { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Subject { get; set; }
        public string EmailTemplateCode { get; set; }
        public string Receiver { get; set; }
    }
}
