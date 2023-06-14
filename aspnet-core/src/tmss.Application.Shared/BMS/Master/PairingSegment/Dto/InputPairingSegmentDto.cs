using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.PairingSegment.Dto
{
    public class InputPairingSegmentDto
    {
        public long Id { get; set; }
        public long Segment1Id { get; set; }
        public long Segment2Id { get; set; }
        public long Segment3Id { get; set; }
        public long Segment4Id { get; set; }
        public long Segment5Id { get; set; }
        public string PairingText { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public long PeriodVersion { get; set; }
        public long PeriodId { get; set; }
        public double? AmountTransfer { get; set; }
        public int? Type { get; set; }
    }
}
