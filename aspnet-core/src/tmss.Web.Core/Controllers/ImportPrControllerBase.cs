using Abp.IO.Extensions;
using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using tmss.PR.PurchasingRequest;
using tmss.Storage;

namespace tmss.Web.Controllers
{
    public abstract class ImportPrControllerBase : tmssControllerBase
    {
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private readonly IBinaryObjectManager _binaryObjectManager;
        private readonly IImportPrImportExcelDataReaderAppService _iImportPrImportExcelDataReader;

        public ImportPrControllerBase(
            ITempFileCacheManager tempFileCacheManager,
            IBinaryObjectManager binaryObjectManager,
            IImportPrImportExcelDataReaderAppService iImportPrImportExcelDataReader
        )
        {
            _tempFileCacheManager = tempFileCacheManager;
            _binaryObjectManager = binaryObjectManager;
            _iImportPrImportExcelDataReader = iImportPrImportExcelDataReader;
        }

        [HttpPost]
        public async Task<JsonResult> ImportPrFromExcel()
        {
            try
            {
                var file = Request.Form.Files.First();
                if (file == null)
                {
                    throw new UserFriendlyException(L("File_Empty_Error"));
                }
                if (file.Length > 1048576 * 100) //100 MB
                {
                    throw new UserFriendlyException(L("File_SizeLimit_Error"));
                }
                byte[] fileBytes;
                using (var stream = file.OpenReadStream())
                {
                    fileBytes = stream.GetAllBytes();
                }
                //var tenantId = AbpSession.TenantId;
                //var fileObject = new BinaryObject(tenantId, fileBytes);

                //await _binaryObjectManager.SaveAsync(fileObject);

                var prs = await _iImportPrImportExcelDataReader.GetImportPrFromExcel(fileBytes);
                return Json(new AjaxResponse(new { prs }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }
    }
}
