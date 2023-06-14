using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstProvince :  IEntity<long>
    {
        public string ProvinceCode { get; set; }
        public string ProvinceName { get; set; }
        public long NationId { get; set; }
        public long Id { get ; set ; }

        public bool IsTransient()
        {
            throw new NotImplementedException();
        }
    }
}
