using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.AspNetCore.Mvc.Authorization;
using Abp.IO.Extensions;
using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using tmss.Chat;
using tmss.Price;
using tmss.Storage;

namespace tmss.Web.Controllers
{
    public class ContractImportControllerBase : tmssControllerBase
    {
        protected readonly IBinaryObjectManager BinaryObjectManager;
        private readonly IPrcContractTemplateAppService _IPrcContractTemplateAppService;  

        public ContractImportControllerBase(IBinaryObjectManager binaryObjectManager,
            IPrcContractTemplateAppService IPrcContractTemplateAppService)
        {
            BinaryObjectManager = binaryObjectManager;
            _IPrcContractTemplateAppService = IPrcContractTemplateAppService;
        }

        [HttpPost]
        public async Task<JsonResult> ImportContractFromExcel()
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
                var taxImportData = await _IPrcContractTemplateAppService.ImportData(fileBytes);

                return Json(new AjaxResponse(new { taxImportData }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        [HttpPost]
        public async Task<JsonResult> ImportContractMultipleFromExcel()
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
                var taxImportData = await _IPrcContractTemplateAppService.ImportMultipleContract(fileBytes);

                return Json(new AjaxResponse(new { taxImportData }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

    }
   }