using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.InvoiceModule.Dto
{
    public class CancelInvoiceInputDto : EntityDto<long>
    {
        [StringLength(500)]
        public string CancelReason { get; set; }
    }
}
