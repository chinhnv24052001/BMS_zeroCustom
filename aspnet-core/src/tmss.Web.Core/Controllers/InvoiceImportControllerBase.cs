using Abp.IO.Extensions;
using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.InvoiceModule;
using tmss.Storage;

namespace tmss.Web.Controllers
{
    public class InvoiceImportControllerBase : tmssControllerBase
    {
        protected readonly IBinaryObjectManager BinaryObjectManager;
        private readonly IInvoiceAppService _invoiceAppService;

        public InvoiceImportControllerBase(IBinaryObjectManager binaryObjectManager,
            IInvoiceAppService invoiceAppService)
        {
            BinaryObjectManager = binaryObjectManager;
            _invoiceAppService = invoiceAppService;
        }

        [HttpPost]
        public async Task<JsonResult> ImportInvoiceMultipleFromExcel()
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
                var invoiceData = await _invoiceAppService.ImportMultipleInvoice(fileBytes);

                return Json(new AjaxResponse(new { invoiceData }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        [HttpPost]
        public async Task<JsonResult> ImportPOLinesFromExcel()
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
                var poLine = await _invoiceAppService.ImportData(fileBytes);

                return Json(new AjaxResponse(new { poLine }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        //[HttpPost]
        //public async Task<JsonResult> UploadInvoice()
        //{
        //    try
        //    {
        //        var file = Request.Form.Files.First();
        //        if (file == null)
        //        {
        //            throw new UserFriendlyException(L("File_Empty_Error"));
        //        }
        //        if (file.Length > 1048576 * 100) // 100 MB
        //        {
        //            throw new UserFriendlyException(L("File_SizeLimit_Error"));
        //        }
        //        byte[] fileBytes;
        //        using (var stream = file.OpenReadStream())
        //        {
        //            fileBytes = stream.GetAllBytes();
        //        }

        //        var requests = _invoiceAppService.ReadXmlManual(fileBytes);
        //        return Json(new AjaxResponse(new { }));
        //    }
        //    catch (UserFriendlyException ex)
        //    {
        //        return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
        //    }
        //}

    }
}