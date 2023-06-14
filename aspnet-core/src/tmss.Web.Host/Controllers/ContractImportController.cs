using Microsoft.AspNetCore.Antiforgery;
using tmss.Price;
using tmss.Storage;

namespace tmss.Web.Controllers
{
    public class ContractImportController : ContractImportControllerBase
    {
        public ContractImportController(IBinaryObjectManager binaryObjectManager,
            IPrcContractTemplateAppService IPrcContractTemplateAppService)
       : base(binaryObjectManager, IPrcContractTemplateAppService) { }
    
    }
}
