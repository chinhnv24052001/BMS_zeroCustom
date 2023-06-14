using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.Supplier.Dto
{
    public class SupplierContactInputSearchDto: PagedAndSortedInputDto
    {
        public long SupplierSiteId { get; set; }
    }
}
