using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master.Relationship
{
    public class AssessRelationship : IEntity<long>
    {
        public double RateValue { get; set; }
        public long AssessGroupId { get; set; }
        public long AssessId { get; set; }
        public long Id { get ; set ; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
