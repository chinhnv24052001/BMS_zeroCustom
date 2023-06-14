using Castle.MicroKernel.SubSystems.Conversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Prepayment.Dto
{
    public class GetPoHeadersDto
    {
        public long PoHeaderId { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public string PoNo { get; set; }
        public string VendorName { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public int? TotalCount { get; set; }

        public decimal PreAmount { get; set;}
        public decimal AvailableAmount { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal TotalPriceUsd { get; set; }

    }
}
