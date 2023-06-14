using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Config
{
    public class CfgReportTemplate : IEntity<long>
    {
        public long Id { get; set; }
        public string ReportCode { get; set; }
        public string ReportName { get; set; }
        public string ReportTemplate { get; set; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
