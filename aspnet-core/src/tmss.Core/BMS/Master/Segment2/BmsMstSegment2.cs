﻿using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Segment2
{
    public class BmsMstSegment2 : FullAuditedEntity<long>, IEntity<long>
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public long ProjectTypeId { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
