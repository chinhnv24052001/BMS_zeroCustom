using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstDistrict :  IEntity<long>
    {
        public string DistrictCode { get; set; }
        public string DistrictName { get; set; }
        public long ProviceId { get; set; }
        public long Id { get ; set; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
