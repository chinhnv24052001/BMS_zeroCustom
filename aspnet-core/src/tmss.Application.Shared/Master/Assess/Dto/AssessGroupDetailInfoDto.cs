using Abp.Application.Services.Dto;
using System.Collections.Generic;

namespace tmss.Master.Assess.Dto
{
    public class AssessGroupDetailInfoDto: EntityDto<long?>
    {
        public long? AssessGroupId { get; set; }
        public long? AssessId { get; set; }
        public List<AssessInfoDto> AssessInfo { get; set; }
    }
}