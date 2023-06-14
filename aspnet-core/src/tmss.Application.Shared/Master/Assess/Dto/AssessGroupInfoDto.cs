using Abp.Application.Services.Dto;
using System.Collections.Generic;

namespace tmss.Master.Assess.Dto
{
    public class AssessGroupInfoDto: EntityDto<long?>
    {
        public string AssessGroupCode { get; set; }
        public string AssessGroupName { get; set; }
        public string AssessGroupType { get; set; }
        public string Description { get; set; }
        public List<AssessDetailInfoDto> AssessDetailList { get; set; }
        public List<AssessInfoDto> AssessList { get; set; }
    }
}