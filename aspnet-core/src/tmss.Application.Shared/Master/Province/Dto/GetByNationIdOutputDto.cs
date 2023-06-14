using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Province.Dto
{
    public class GetByNationIdOutputDto
    {
        public long Id { get; set; }
        public string ProvinceName { get; set; }
        public long NationId { get; set; }
    }
}
