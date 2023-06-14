using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.ImportExcel.Bms.Segment.Dto
{
    public class SegmentReadDataDto
    {
        public string PeriodName { get; set; }
        public long PeriodId { get; set; }

        //version
        public string PeriodVersionName { get; set; }
        public long PeriodVersion { get; set; }

        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Remark { get; set; }

        //1
        public string TypeCostName { get; set; }
        public long TypeCostId { get; set; }

        //2
        public string ProjectTypeName { get; set; }
        public long ProjectTypeId { get; set; }

        //3
        public string DepartmentName { get; set; }
        public long DepartmentId { get; set; }
        public long DivisionId { get; set; }


        //4
        public long GroupSeg4Id { get; set; }
        public string GroupSeg4Name { get; set; }

        //5
        public bool IsActive { get; set; }

        //budget Plan
        public string segment1Name { get; set; }
        public string segment1Code { get; set; }
        public long Segment1Id { get; set; }

        public string segment2Name { get; set; }
        public string segment2Code { get; set; }
        public long Segment2Id { get; set; }

        public string segment3Name { get; set; }
        public string segment3Code { get; set; }
        public long Segment3Id { get; set; }

        public string segment4Name { get; set; }
        public string segment4Code { get; set; }
        public long Segment4Id { get; set; }

        public string segment5Name { get; set; }
        public string segment5Code { get; set; }
        public long Segment5Id { get; set; }
        public int type { get; set; }

    }
}
