using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.SupplierRequest.Dto
{
    public class SupplierRequestInput : PagedAndSortedInputDto
    {
        public string FilterText { get; set; }
    }
}
