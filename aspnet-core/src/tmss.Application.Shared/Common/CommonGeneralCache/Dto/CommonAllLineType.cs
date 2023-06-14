using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllLineType : EntityDto<long>
    {
        [StringLength(20)]
        public string LineTypeCode { get; set; }
        [StringLength(50)]
        public string LineTypeName { get; set; }
    }
}
