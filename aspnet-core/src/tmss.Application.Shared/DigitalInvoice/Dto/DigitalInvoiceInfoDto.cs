using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.DigitalInvoice.Dto
{
    public class DigitalInvoiceInfoDto : EntityDto<long>
    {
        public string InvoiceNum { get; set; }
        public string SerialNo { get; set; }
        public string SupplierName { get; set; }
        public string SupplierNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public int Status { get; set; }
        public double DistAmount { get; set; }
        public double VatAmount { get; set; }
        public double Amount { get; set; }
        public string SellerTaxCode { get; set; }
        public string PoNo { get; set; }
    }
}
