using Abp.BackgroundJobs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.Storage;

namespace tmss.Web.Controllers
{
    public class UploadGrController: UploadGrControllerBase
    {
        public UploadGrController(IBinaryObjectManager binaryObjectManager, IBackgroundJobManager backgroundJobManager) { }
    }
}
