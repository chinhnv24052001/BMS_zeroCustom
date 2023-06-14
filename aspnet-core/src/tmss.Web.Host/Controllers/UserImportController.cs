using Abp.IO.Extensions;
using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.ExcelDataReader;

namespace tmss.Web.Controllers
{
    public class UserImportController : tmssControllerBase
    {
        private readonly IPcsUserRequestExcelDataReader _userRequestDataReader;

        public UserImportController(
            IPcsUserRequestExcelDataReader userRequestDataReader
        )
        {
            _userRequestDataReader = userRequestDataReader;
        }

        #region -- Import Catalog Image
        [HttpPost]
        public async Task<JsonResult> UploadCatalogImage()
        {
            try
            {
                var file = Request.Form.Files.First();
                if (file == null)
                {
                    throw new UserFriendlyException("File_Empty_Error");
                }

                if (file.Length > 1048576 * 5) // 5MB
                {
                    throw new UserFriendlyException("File_SizeLimit_Error");
                }

                var folderName = Path.Combine("wwwroot", "AttachFile", "CatalogPriceImages");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                var fullPath = Path.Combine(pathToSave, file.FileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
                return Json(new AjaxResponse(new { fullPath }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }
        #endregion

        [HttpGet]
        public async Task<IActionResult> GetAttachFileToDownload(string fileName)
        {
            if (fileName == null)
            {
                throw new UserFriendlyException(L("File_Name_Missing_Error"));
            }

            var folderName = Path.Combine("wwwroot", "AttachFile", "CatalogPriceImages");
            var pathToGet = Path.Combine(Directory.GetCurrentDirectory(), folderName);
            string path = Path.Combine(pathToGet, fileName);

            var memory = new MemoryStream();
            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }

            memory.Position = 0;
            return File(memory, MimeTypes.GetMimeType(fileName), fileName);
        }

        [HttpPost]
        public async Task<JsonResult> ImportUserRequestFromExcel()
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

                var requests = await _userRequestDataReader.ReadDataFromExcel(fileBytes);
                return Json(new AjaxResponse(new { requests }));
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }
    }
}
