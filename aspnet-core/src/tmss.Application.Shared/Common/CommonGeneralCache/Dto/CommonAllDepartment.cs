using Abp.Application.Services.Dto;
using System;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllDepartment : EntityDto<Guid>
    {
        public string DepartmentName { get; set; }
    }
}
