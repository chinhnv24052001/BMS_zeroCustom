using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Config
{
    public class CfgEmailTemplate : IEntity<long>
    {
        public string EmailTemplateCode { get; set; }
        public string EmailTemplateContent { get; set; }
        public long Id { get; set; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
