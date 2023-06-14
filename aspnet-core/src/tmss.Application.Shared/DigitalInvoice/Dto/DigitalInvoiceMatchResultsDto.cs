using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.DigitalInvoice.Dto
{
    public class DigitalInvoiceMatchResultsDto : EntityDto<long>
    {
        public string InvoiceNum { get; set; }
        public string PoNo { get; set; }
        public string NameOnInvoice { get; set; }
        public string NameOnSupplier { get; set; }
        public string NameOnPO { get; set; }
        public long? ItemId { get; set; }
        public int Status { get; set; }
        public int EInvErrorStatus { get; set; }
        public int QuantityOrdered { get; set; }
        public int QuantityShipped { get; set; }
        public int QuantityReceived { get; set; }
        public int QuantityBilled { get; set; }
        public int QuantityInvoiced { get; set; }
        public int AmountOrdered { get; set; }
        public int AmountBilled { get; set; }
        public double DistAmount { get; set; }
        public string Note { get; set; }
        public string UnitOfMeasure { get; set; }
        public long? InterfaceHeaderId { get; set; }
        public long? InterfaceLineId { get; set; }
        public long? VendorId { get; set; }
    }
}
