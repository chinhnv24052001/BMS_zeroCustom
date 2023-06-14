using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstNation :  IEntity<long>
    {
        public string NationName { get; set; }
        public long Id { get ; set; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
