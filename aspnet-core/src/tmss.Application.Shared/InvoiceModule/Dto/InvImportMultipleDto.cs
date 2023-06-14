using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.InvoiceModule.Dto
{
    public class InvImportMultipleDto
    {
        public List<SearchInvoiceOutputDto> listHeader { get; set; }
        public List<SearchInvoiceOutputDetailDto> listItems { get; set; }
    }
}
