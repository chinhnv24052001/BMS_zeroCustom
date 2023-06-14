using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.InvoiceModule;
using tmss.Storage;

namespace tmss.Web.Controllers
{
    public class InvoiceImportController: InvoiceImportControllerBase
    {
        public InvoiceImportController(IBinaryObjectManager binaryObjectManager,
           IInvoiceAppService IInvoiceAppService)
      : base(binaryObjectManager, IInvoiceAppService) { }
    }
}
