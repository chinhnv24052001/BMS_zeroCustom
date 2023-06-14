using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.District.Dto
{
    public class GetByProvinceIdOutputDto
    {
        public long Id { get; set; }
        public string DistrictName { get; set; }
        public long ProvinceId { get; set; }
    }
}
