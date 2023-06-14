using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.Catalog.Dto
{
    public class GetCatalogSearchInput : PagedAndSortedInputDto
    {
        public string FilterText { get; set; }
    }
}
