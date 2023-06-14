using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllGlCodeCombination : EntityDto<long>
    {
        [StringLength(255)]
        public string ConcatenatedSegments { get; set; }
    }
}
