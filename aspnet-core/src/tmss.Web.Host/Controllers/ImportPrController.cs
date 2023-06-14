using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using System;
using System.IO;
using System.Threading.Tasks;
using tmss.PR.PurchasingRequest;
using tmss.Price;
using tmss.Storage;

namespace tmss.Web.Controllers
{
    public class ImportPrController : ImportPrControllerBase
    {
        public ImportPrController(ITempFileCacheManager tempFileCacheManager, IBinaryObjectManager binaryObjectManager, IImportPrImportExcelDataReaderAppService importPrImportExcelDataReader) : base(tempFileCacheManager, binaryObjectManager, importPrImportExcelDataReader)
        {
        }

        
    }
}
