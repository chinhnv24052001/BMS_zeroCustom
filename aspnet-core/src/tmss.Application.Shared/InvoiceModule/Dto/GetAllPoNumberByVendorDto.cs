using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.InvoiceModule.Dto
{
    public class GetAllPoNumberByVendorDto : EntityDto<long>
    {
        [StringLength(15)]
        public string PoNumber { get; set; }
        public string VendorName { get; set; }
        public string Description { get; set; }
        public DateTime CreationTime { get; set; }
    }
}
