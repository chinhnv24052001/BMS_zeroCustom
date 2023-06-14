using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstAssessDetail : IEntity<long>
    {
        public long Id { get ; set ; }
        public long AssessId { get; set; }
        public string AssessItemName { get; set; }
        public string Description { get; set; }
        public double RateValue { get; set; }
        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
