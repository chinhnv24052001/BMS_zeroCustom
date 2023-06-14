using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Config
{
    public class CfgReportTemplateTable : IEntity<long>
    {
        public long Id { get; set; }
        public long ReportTemplateId { get; set; }
        public string HashTag { get; set; }
        public string PropertyName { get; set; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
