using Abp.Application.Services.Dto;
using System;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllOrganization : EntityDto<long>
    {
        public string Language { get; set; }
        public string SourceLang { get; set; }
        public string Name { get; set; }
        public string OrganizationCode { get; set; }
        public long SetOfBooksId { get; set; }
        public long ChartOfAccountsId { get; set; }
        public DateTime? UserDefinitionEnableDate { get; set; }
        public DateTime? DisableDate { get; set; }
        public long OperatingUnit { get; set; }
    }
}
