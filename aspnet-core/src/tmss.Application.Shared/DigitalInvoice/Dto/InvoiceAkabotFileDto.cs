using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.DigitalInvoice.Dto
{
    public class InvoiceAkabotFileDto : EntityDto<long>
    {
        public long InvAkabotHeaderId { get; set; }
        public string OriginalFileName { get; set; }
        public string ServerFileName { get; set; }
        public string RootPath { get; set; }
        public string FileType { get; set; }

    }
}
