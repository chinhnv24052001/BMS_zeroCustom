using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstAssessGroup : IEntity<long>
    {
        public long Id { get ; set ; }
        public string AssessGroupCode { get; set; }
        public string AssessGroupName { get; set; }
        public string AssessGroupType { get; set; }
        public string Description { get; set; }
        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
