using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstTitleSeq 
    {
        public long Id { get; set; }
        public string TitleName { get; set; }
        public long? Seq { get; set; }
        

    }
}
