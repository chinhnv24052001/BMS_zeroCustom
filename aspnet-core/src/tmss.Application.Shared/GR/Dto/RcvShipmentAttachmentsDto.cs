using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.GR.Dto
{
    public class RcvShipmentAttachmentsDto
    {
        public long Id { get; set; }
        public long ShipmentHeaderId { get; set; }
        public string ServerFileName { get; set; }
        public string ServerLink { get; set; }
        public string ContentType { get; set; }
    }
}
