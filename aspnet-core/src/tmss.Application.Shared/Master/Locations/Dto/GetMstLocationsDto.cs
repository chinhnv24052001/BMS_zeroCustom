using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Locations.Dto
{
    public class GetMstLocationsDto
    {
        public long Id { get; set; }
        public string Language { get; set; }
        public string SourceLanguage { get; set; }
        public string LocationCode { get; set; }
        public string Description { get; set; }
    }
}
