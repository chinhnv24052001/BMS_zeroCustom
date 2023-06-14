using Abp.Application.Services.Dto;

namespace tmss.Common.Dto
{
    public class AbpUserDto : EntityDto<long>
    {
        public int? TenantId { get; set; }
        public long? EmpId { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string EmployeeCode { get; set; }
    }
}