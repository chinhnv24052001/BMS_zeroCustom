using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.Supplier.Dto
{
    public class SupplierSiteInputSearchDto: PagedAndSortedInputDto
    {
        public long SupplierId { get; set; }
    }
}
