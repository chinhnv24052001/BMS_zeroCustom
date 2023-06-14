using Abp.Application.Services.Dto;
using System;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetRequesterInfoForViewDto : EntityDto<long>
    {
        public string UserName { get; set; }
        public string DepartmentName { get; set; }
        public Guid DepartmentId { get; set; }
        public string UserTitle { get; set; }
        public long TitleId { get; set; }
        public string Email { get; set; }
    }
}
