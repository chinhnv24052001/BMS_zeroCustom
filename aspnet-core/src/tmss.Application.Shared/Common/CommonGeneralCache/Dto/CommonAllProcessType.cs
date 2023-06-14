using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllProcessType : EntityDto<long>
    {
        [StringLength(10)]
        public string ProcessTypeCode { get; set; }
        [StringLength(50)]
        public string ProcessTypeName { get; set; }
    }
}
