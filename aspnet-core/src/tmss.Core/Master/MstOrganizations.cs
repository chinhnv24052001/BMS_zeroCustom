using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstOrganizations : FullAuditedEntity<long>, IEntity<long>
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
