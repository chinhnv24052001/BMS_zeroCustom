using Abp.UI;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace tmss.Web.Controllers
{
    public class RemoveAttachFileController : tmssControllerBase
    {
        [HttpGet]
        public void RemoveGrAttachFile(string attachFile)
        {
            try
            {
                if (attachFile == null)
                {
                    throw new UserFriendlyException(L("File_Name_Missing_Error"));
                }

                // Source Folder to get
                var folderName = Path.Combine("wwwroot", attachFile);
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

        [HttpGet]
        public void RemovePaymentAttachFile(string attachFile)
        {
            try
            {
                if (attachFile == null)
                {
                    throw new UserFriendlyException(L("File_Name_Missing_Error"));
                }

                // Source Folder to get
                var folderName = Path.Combine("wwwroot", attachFile);
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
