using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.InvoiceModule.Dto
{
    public class GetAllCancelReasonForInvoice : EntityDto<long>
    {
        public string Code { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
