using Abp.UI;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace tmss.Web.Controllers
{
    public class DownloadFileController : tmssControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetGrAttachFileToDownload(string filename)
        {
            if (filename == null)
            {
                throw new UserFriendlyException(L("File_Name_Missing_Error"));
            }

            var folderName = Path.Combine("wwwroot/AttachFile/Receipts");
            var pathToGet = Path.Combine(Directory.GetCurrentDirectory(), folderName);
            string path = Path.Combine(pathToGet, filename);

            var memory = new MemoryStream();
            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }

            memory.Position = 0;
            return File(memory, MimeTypes.GetMimeType(filename), filename);
        }


        [HttpGet]
        public async Task<IActionResult> GetPaymentAttachFileToDownload(string filename)
        {
            if (filename == null)
            {
                throw new UserFriendlyException(L("File_Name_Missing_Error"));
            }

            var folderName = Path.Combine("wwwroot/AttachFile/Payments");
            var pathToGet = Path.Combine(Directory.GetCurrentDirectory(), folderName);
            string path = Path.Combine(pathToGet, filename);

            var memory = new MemoryStream();
            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }

            memory.Position = 0;
            return File(memory, MimeTypes.GetMimeType(filename), filename);
        }

        
    }
}
