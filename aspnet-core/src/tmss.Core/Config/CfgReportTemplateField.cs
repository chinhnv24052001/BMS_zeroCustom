using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Config
{
    public class CfgReportTemplateField : IEntity<long>
    {
        public long Id { get; set; }
        public long ReportTemplateId { get; set; }

        public string Hashtag { get; set; }
        public string DtoName { get; set; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
