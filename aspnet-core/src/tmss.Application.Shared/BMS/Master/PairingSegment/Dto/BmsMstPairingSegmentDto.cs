using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.PairingSegment.Dto
{
    public class BmsMstPairingSegmentDto
    {
        public long Id { get; set; }
        public string Segment1Name { get; set; }
        public string Segment2Name { get; set; }
        public string Segment3Name { get; set; }
        public string Segment4Name { get; set; }
        public string Segment5Name { get; set; }
        public string PairingText { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public string PeriodName { get; set; }
        public string PeriodVersionName  { get; set; }
        public double? AmountTransfer { get; set; }
        public string Type { get; set; }
    }
}
