using Abp.UI;
using Abp.Web.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.GR.Dto;

namespace tmss.Web.Controllers
{
    public class UploadGrControllerBase : tmssControllerBase
    {
        [HttpPost]
        [System.Obsolete]
        public IActionResult UploadGrFileToFolder()
        {
            try
            {
                var file = Request.Form.Files[0];

                var folderName = "wwwroot/AttachFile/Receipts";
                var folderNameDownload = "AttachFile/Receipts";
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
                    var fullPath = pathToSave + "/" + file.FileName;
                    var dbPath = folderNameDownload + "/" + file.FileName;
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }

                    GetListAttachFileDto attachComplainMgmts = new GetListAttachFileDto { AttachFile = dbPath, AttachName = file.FileName, AttachSize = file.Length };
                    return Ok(new { attachComplainMgmts });
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

        [HttpPost]
        [System.Obsolete]
        public IActionResult UploadPaymentFileToFolder()
        {
            try
            {
                var file = Request.Form.Files[0];

                var folderName = "wwwroot/AttachFile/Payments";
                var folderNameDownload = "AttachFile/Payments";
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
                    var fullPath = pathToSave + "/" + file.FileName;
                    var dbPath = folderNameDownload + "/" + file.FileName;
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }

                    GetListAttachFileDto attachComplainMgmts = new GetListAttachFileDto { AttachFile = dbPath, AttachName = file.FileName, AttachSize = file.Length };
                    return Ok(new { attachComplainMgmts });
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

    }

}
