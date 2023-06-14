using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Config
{
    public class CfgReportTemplateTableColumn : IEntity<long>
    {
        public long Id { get; set; }
        public long ReportTemplateTableId { get; set; }
        public string HeaderName { get; set; }
        public string PropertyName { get; set; }
        public int Seq { get; set; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
