using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Abp.IO.Extensions;
using Abp.UI;
using Abp.Web.Models;
using tmss.Authorization.Users.Dto;
using tmss.Storage;
using Abp.BackgroundJobs;
using tmss.Authorization;
using Abp.AspNetCore.Mvc.Authorization;
using Abp.Runtime.Session;
using tmss.Authorization.Users.Importing;
using System.IO;
using tmss.ImportExcel;
using tmss.ImportExcel.Product;
using tmss.PO.PurchaseOrders;
using Abp;
using tmss.ImportExcel.PurchasePurpose;
using tmss.ImportExcel.Bms.Segment;

namespace tmss.Web.Controllers
{
    public abstract class ImportExcelControllerBase : tmssControllerBase
    {
        protected readonly IProductImportExcelAppService _productImportExcel;
        protected readonly IImportPurchaseOrdersAppService _importPurchaseOrdersAppService;
        protected readonly IPurchasePurposeImportExcelAppService _ipurchasePurposeImportExcelAppService;
        protected readonly ISegmentExcelAppService _isegmentAppService;

        protected ImportExcelControllerBase(
            IProductImportExcelAppService productImportExcel,
            IImportPurchaseOrdersAppService importPurchaseOrdersAppService,
            IPurchasePurposeImportExcelAppService ipurchasePurposeImportExcelAppService,
            ISegmentExcelAppService isegmentAppService
            )
        {
            _productImportExcel = productImportExcel;
            _importPurchaseOrdersAppService = importPurchaseOrdersAppService;
            _ipurchasePurposeImportExcelAppService = ipurchasePurposeImportExcelAppService;
            _isegmentAppService = isegmentAppService;
        }

        //Import Product
        public async Task<JsonResult> ImportProductFromExcel()
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

                var folderName = Path.Combine("wwwroot", "TempFile");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                string fileName = Path.GetFileNameWithoutExtension (file.FileName) + DateTime.Now.Millisecond.ToString() + Path.GetExtension(file.FileName);
                var fullPath = Path.Combine(pathToSave, fileName);
                if (Directory.Exists(folderName) == false)
                {
                    Directory.CreateDirectory(folderName);
                }

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                var report = await _productImportExcel.GetListProductFromExcel(fileBytes, fileName);

                return Json(new AjaxResponse(new { report }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        [HttpPost]
        public async Task<JsonResult> ImportPoFromExcel()
        {
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

                    var prs = await _importPurchaseOrdersAppService.GetImportPoFromExcel(fileBytes);
                    return Json(new AjaxResponse(new { prs }));
                }
                catch (UserFriendlyException ex)
                {
                    return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
                }
            }
        }

        //Upload Image
        public async Task<JsonResult> UploadImage()
        {
            try
            {
                var file = Request.Form.Files.First();
                //var productId = Request.Form["productId"];
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

                var report = fileBytes;

                return Json(new AjaxResponse(new { report }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        //Import PurchasePurpose
        public async Task<JsonResult> ImportPurchasePurposeFromExcel()
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

                var folderName = Path.Combine("wwwroot", "TempFile");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                string fileName = Path.GetFileNameWithoutExtension(file.FileName) + DateTime.Now.Millisecond.ToString() + Path.GetExtension(file.FileName);
                var fullPath = Path.Combine(pathToSave, fileName);
                if (Directory.Exists(folderName) == false)
                {
                    Directory.CreateDirectory(folderName);
                }

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                var report = await _ipurchasePurposeImportExcelAppService.GetListPurchasePurposeFromExcel(fileBytes, fileName);

                return Json(new AjaxResponse(new { report }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        //BMS
        //Import Segment
        public async Task<JsonResult> BmsImportSegmentFromExcel()
        {
            try
            {
                var file = Request.Form.Files.First();
                var segNum = Request.Form["segNum"];
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

                var folderName = Path.Combine("wwwroot", "TempFile");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                string fileName = Path.GetFileNameWithoutExtension(file.FileName) + DateTime.Now.Millisecond.ToString() + Path.GetExtension(file.FileName);
                var fullPath = Path.Combine(pathToSave, fileName);
                if (Directory.Exists(folderName) == false)
                {
                    Directory.CreateDirectory(folderName);
                }

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                var report = await _isegmentAppService.GetListSegmentFromExcel(fileBytes, fileName, segNum);

                return Json(new AjaxResponse(new { report }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }
    }
}
