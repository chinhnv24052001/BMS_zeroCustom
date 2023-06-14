using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Common;
using tmss.Price;
using tmss.Price.Dto;

namespace tmss.Web.Controllers
{
    public class AttachFileController : tmssControllerBase
    {
        private readonly ICommonLookupAppService _common;

        public AttachFileController(ICommonLookupAppService common)
        {
            _common = common;
        }

        [HttpPost]
        [System.Obsolete]
        public IActionResult UploadFileToFolder(string type, string serverFileName, long headerId, string originalFileName)
        {
            try
            {
                //Delete all attachment by header id
                //_common.DeleteAllAttachmentByConTractId(headerId);

                //var file = Request.Form.Files.First(); 

                var file = Request.Form.Files.FirstOrDefault(e => e.FileName == originalFileName);

                var folderName = "wwwroot/" + type.ToUpper();
                var folderNameDownload = type.ToUpper();

                if (!Directory.Exists(folderName))
                {
                    Directory.CreateDirectory(folderName);
                }

                string[] filePaths = Directory.GetDirectories(folderName).Select(Path.GetFileName)
                            .ToArray();
                if (filePaths.Count() == 0)
                {
                    folderName += "/1";
                    folderNameDownload += "/1";
                    Directory.CreateDirectory(folderName);
                }
                else
                {
                    long max = 0;
                    foreach (var x in filePaths)
                    {
                        if (long.Parse(x) > 0)
                        {
                            max = long.Parse(x);
                        }
                    }

                    var lastPath = (folderName + "/" + max);
                    int fCount = Directory.GetFiles(lastPath, "*", SearchOption.TopDirectoryOnly).Length;
                    if (fCount == 100)
                    {
                        folderName += ("/" + (max + 1));
                        folderNameDownload += ("/" + (max + 1));
                        Directory.CreateDirectory(folderName);
                    }
                    else
                    {
                        folderName += "/" + (max);
                        folderNameDownload += "/" + (max);
                    }
                }

                if (file == null)
                {
                    throw new UserFriendlyException(L("File_Empty_Error"));
                }

                if (file.Length > 1048576 * 100) //100 MB
                {
                    throw new UserFriendlyException(L("File_SizeLimit_Error"));
                }


                if (file.Length > 0)
                {
                    string resultFormat = "";
                    var intermediaries = file.FileName;
                    char[] array = intermediaries.ToCharArray();
                    for (int i = 1; i < array.Length; i++)
                    {
                        if (array[i - 1] == '.')
                        {
                            for (int j = i; j < array.Length; j++)
                            {
                                resultFormat = resultFormat + array[j];
                            }
                        }
                    }

                    var pathToSave = Directory.GetCurrentDirectory() + "/" + folderName;

                    var ms = new MemoryStream();
                    file.CopyTo(ms);
                    var fullPath = pathToSave + "/" + serverFileName;
                    var dbPath = folderNameDownload + "/" + serverFileName;
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                        stream.Close();
                    }

                    GetAttachFileDto contractAttachFile = new GetAttachFileDto { OriginalFileName = file.FileName, ServerFileName = serverFileName,RootPath = dbPath, AttachFileType = type.ToUpper(),HeaderId = headerId };
                    
                    _common.SaveAttachFileToDb(contractAttachFile);

                    return Ok(new { contractAttachFile });
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (UserFriendlyException ex)
            {
                return Json(new AjaxResponse(new ErrorInfo(ex.Message)));
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAttachFileToDownload(string filename , string rootPath)
        {
            if (filename == null)
            {
                throw new UserFriendlyException(L("File_Name_Missing_Error"));
            }

            var folderName = Path.Combine("wwwroot");
            var pathToGet = Path.Combine(Directory.GetCurrentDirectory(), folderName);
            string path = Path.Combine(pathToGet, rootPath);

            var memory = new MemoryStream();
            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }

            memory.Position = 0;
            return File(memory, MimeTypes.GetMimeType(filename), filename);
        }

        [HttpGet]
        public void RemoveAttachFile(string attachFile , string rootPath)
        {
            try
            {
                if (attachFile == null)
                {
                    throw new UserFriendlyException(L("File_Name_Missing_Error"));
                }

                // Source Folder to geô
                var folderName = Path.Combine("wwwroot", rootPath);
                var sourcePath = Path.Combine(Directory.GetCurrentDirectory(), folderName);

                if (System.IO.File.Exists(sourcePath))
                {
                    System.IO.File.Delete(sourcePath);
                }

            }
            catch (UserFriendlyException ex)
            {
                throw new UserFriendlyException(ex.Message);
            }
        }

    }
}
