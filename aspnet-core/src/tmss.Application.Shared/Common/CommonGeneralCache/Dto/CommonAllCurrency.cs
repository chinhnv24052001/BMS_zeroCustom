using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllCurrency : EntityDto<long>
    {
        [StringLength(15)]
        public string CurrencyCode { get; set; }
        [StringLength(80)]
        public string Name { get; set; }
        public int EnabledFlag { get; set; }
        public DateTime? StartDateActive { get; set; }
        public DateTime? EndDateActive { get; set; }
    }
}
