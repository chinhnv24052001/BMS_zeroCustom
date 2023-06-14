using Abp.Application.Services.Dto;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllInventoryGroup : EntityDto<long>
    {
        public string ProductGroupName { get; set; }
        public string ProductGroupCode { get; set; }
    }
}
