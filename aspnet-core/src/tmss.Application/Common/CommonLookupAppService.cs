using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using tmss.Common.Dto;
using tmss.Editions;
using tmss.Editions.Dto;
using tmss.Price;
using tmss.Price.Dto;

namespace tmss.Common
{
    [AbpAuthorize]
    public class CommonLookupAppService : tmssAppServiceBase, ICommonLookupAppService
    {
        private readonly EditionManager _editionManager;
        private readonly IRepository<MstAttachFiles, long> _attachFileRepo;

        public CommonLookupAppService(
            EditionManager editionManager,
            IRepository<MstAttachFiles, long> attachFileRepo
            )
        {
            _editionManager = editionManager;
            _attachFileRepo = attachFileRepo;
        }

        public async Task<ListResultDto<SubscribableEditionComboboxItemDto>> GetEditionsForCombobox(bool onlyFreeItems = false)
        {
            var subscribableEditions = (await _editionManager.Editions.Cast<SubscribableEdition>().ToListAsync())
                .WhereIf(onlyFreeItems, e => e.IsFree)
                .OrderBy(e => e.MonthlyPrice);

            return new ListResultDto<SubscribableEditionComboboxItemDto>(
                subscribableEditions.Select(e => new SubscribableEditionComboboxItemDto(e.Id.ToString(), e.DisplayName, e.IsFree)).ToList()
            );
        }

        public async Task<PagedResultDto<NameValueDto>> FindUsers(FindUsersInput input)
        {
            if (AbpSession.TenantId != null)
            {
                //Prevent tenants to get other tenant's users.
                input.TenantId = AbpSession.TenantId;
            }

            using (CurrentUnitOfWork.SetTenantId(input.TenantId))
            {
                var query = UserManager.Users
                    .WhereIf(
                        !input.Filter.IsNullOrWhiteSpace(),
                        u =>
                            u.Name.Contains(input.Filter) ||
                            u.Surname.Contains(input.Filter) ||
                            u.UserName.Contains(input.Filter) ||
                            u.EmailAddress.Contains(input.Filter)
                    ).WhereIf(input.ExcludeCurrentUser, u => u.Id != AbpSession.GetUserId());

                var userCount = await query.CountAsync();
                var users = await query
                    .OrderBy(u => u.Name)
                    .ThenBy(u => u.Surname)
                    .PageBy(input)
                    .ToListAsync();

                return new PagedResultDto<NameValueDto>(
                    userCount,
                    users.Select(u =>
                        new NameValueDto(
                            u.FullName + " (" + u.EmailAddress + ")",
                            u.Id.ToString()
                            )
                        ).ToList()
                    );
            }
        }

        public GetDefaultEditionNameOutput GetDefaultEditionName()
        {
            return new GetDefaultEditionNameOutput
            {
                Name = EditionManager.DefaultEditionName
            };
        }

        [AbpAllowAnonymous]
        public async Task<List<GetAttachFileDto>> GetListAttachFileData(long headerId, string type)
        {
            var list = from a in _attachFileRepo.GetAll().Where(e => e.HeaderId == headerId && e.AttachFileType.ToUpper() == (type ?? "").ToUpper())
                       select new GetAttachFileDto
                       {
                           Id = a.Id,
                           HeaderId = a.HeaderId,
                           OriginalFileName = a.OriginalFileName,
                           ServerFileName = a.ServerFileName,
                           RootPath = a.RootPath,
                           AttachFileType = a.AttachFileType,
                       };
            return await list.ToListAsync();
        }

        [AbpAllowAnonymous]
        public async Task SaveAttachFileToDb(GetAttachFileDto input)
        {
            var file = new MstAttachFiles();
            file.OriginalFileName = input.OriginalFileName;
            file.ServerFileName = input.ServerFileName;
            file.HeaderId = input.HeaderId;
            file.AttachFileType = input.AttachFileType;
            file.RootPath = input.RootPath;

            await _attachFileRepo.InsertAsync(file);
        }

        [AbpAllowAnonymous]
        public async Task DeleteAttachFile(long inputId)
        {
            var file = await _attachFileRepo.FirstOrDefaultAsync(e => e.Id == inputId);
            if (file != null) await _attachFileRepo.HardDeleteAsync(file);

        }

        [AbpAllowAnonymous]
        public async Task<GetAttachFileDto> GetAttachFileData(long headerId, string type)
        {
            var list = from a in _attachFileRepo.GetAll().Where(e => e.HeaderId == headerId && e.AttachFileType.ToUpper() == (type ?? "").ToUpper())
                       select new GetAttachFileDto
                       {
                           Id = a.Id,
                           HeaderId = a.HeaderId,
                           OriginalFileName = a.OriginalFileName,
                           ServerFileName = a.ServerFileName,
                           RootPath = a.RootPath,
                           AttachFileType = a.AttachFileType,
                       };
            return list.FirstOrDefault();
        }

        public async Task DeleteAllAttachmentByConTractId(long contractId)
        {
            var listAttach = _attachFileRepo.GetAll().Where(p=> p.HeaderId == contractId).ToList();
            foreach(var item in listAttach)
            {
                //await DeleteAttachFile(item.Id);
                await _attachFileRepo.DeleteAsync(item.Id);

                if (item == null)
                {
                    throw new UserFriendlyException(L("File_Name_Missing_Error"));
                }

                // Source Folder to geô
                var folderName = Path.Combine("wwwroot", item.RootPath);
                var sourcePath = Path.Combine(Directory.GetCurrentDirectory(), folderName);

                if (System.IO.File.Exists(sourcePath))
                {
                    System.IO.File.Delete(sourcePath);
                }
            }
        }
    }
}
