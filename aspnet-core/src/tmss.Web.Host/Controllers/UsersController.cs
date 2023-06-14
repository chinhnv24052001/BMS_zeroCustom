using Abp.AspNetCore.Mvc.Authorization;
using tmss.Authorization;
using tmss.Storage;
using Abp.BackgroundJobs;
using tmss.ImportExcel;

namespace tmss.Web.Controllers
{
    [AbpMvcAuthorize(AppPermissions.Pages_Administration_Users)]
    public class UsersController : UsersControllerBase
    {
        public UsersController(IBinaryObjectManager binaryObjectManager, IBackgroundJobManager backgroundJobManager)
            : base(binaryObjectManager, backgroundJobManager)
        {
        }
    }
}