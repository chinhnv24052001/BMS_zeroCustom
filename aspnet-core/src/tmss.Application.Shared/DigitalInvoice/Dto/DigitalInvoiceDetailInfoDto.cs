using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.DigitalInvoice.Dto
{
    public class DigitalInvoiceDetailInfoDto : EntityDto<long>
    {
        public string DistDescription { get; set; }
        public string UnitOfMeasure { get; set; }
        public int QuantityInvoiced { get; set; }
        public double UnitPrice { get; set; }
        public double DistAmount { get; set; }
        public string PoNo { get; set; }
        public string VatRate { get; set; }

    }
}
