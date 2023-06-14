using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.EntityFrameworkCore;
using tmss.Master.CancelReason;
using tmss.Master.CancelReason.Dto;
using tmss.Master.ContractTemplate.Dto;

namespace tmss.Master
{
    public class MstCancelReasonAppService : tmssAppServiceBase, IMstCancelReasonAppService
    {

        private readonly IRepository<MstCancelReason, long> _mstCancelReason;
        private readonly IRepository<MstProcessType, long> _mstProcessType;

        public MstCancelReasonAppService(IRepository<MstCancelReason, long> mstCancelReason,
            IRepository<MstProcessType, long> mstProcessType)
        {
            _mstCancelReason = mstCancelReason;
            _mstProcessType = mstProcessType;
        }

        [AbpAuthorize(AppPermissions.CancelReason_Delete)]
        public async Task DeleteCancelReason(long id)
        {
            MstCancelReason mstCancelReasonlateCheck = await _mstCancelReason.FirstOrDefaultAsync(p => p.Id == id);
            if (mstCancelReasonlateCheck != null)
            {
                await _mstCancelReason.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, L(AppConsts.ValRecordsDelete));
            }
        }

        [AbpAuthorize(AppPermissions.CancelReason_Search)]
        public async Task<PagedResultDto<InputCancelReasonDto>> getAllCancelReason(InputSearchCancelReasonDto inputSearchCancelReasonDto)
        {
            var listCancel = from cancelReason in _mstCancelReason.GetAll().AsNoTracking()
                             join process in _mstProcessType.GetAll().AsNoTracking()
                             on cancelReason.Type equals process.ProcessTypeCode
                             where (string.IsNullOrWhiteSpace(inputSearchCancelReasonDto.Keyword) || cancelReason.Name.Contains(inputSearchCancelReasonDto.Keyword))
                             select new InputCancelReasonDto()
                             {
                                 Id = cancelReason.Id,
                                 Code = cancelReason.Code,
                                 Name = cancelReason.Name,
                                 Type = process.ProcessTypeName,
                                 Description = cancelReason.Description
                             };
            var result = listCancel.Skip(inputSearchCancelReasonDto.SkipCount).Take(inputSearchCancelReasonDto.MaxResultCount);
            return new PagedResultDto<InputCancelReasonDto>(
                       listCancel.Count(),
                       result.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.CancelReason_Edit)]
        public Task<InputCancelReasonDto> LoadById(long id)
        {
            var listCancel = from cancelReason in _mstCancelReason.GetAll().AsNoTracking()
                             where cancelReason.Id == id
                             select new InputCancelReasonDto()
                             {
                                 Id = cancelReason.Id,
                                 Code = cancelReason.Code,
                                 Name = cancelReason.Name,
                                 Type = cancelReason.Type,
                                 Description = cancelReason.Description
                             };
            return listCancel.FirstOrDefaultAsync();
        }

        [AbpAuthorize(AppPermissions.CancelReason_Add)]
        public async Task Save(InputCancelReasonDto input)
        {
            MstCancelReason mstCancelReasonlate = await _mstCancelReason.FirstOrDefaultAsync(p => p.Code == input.Code);

            if (input.Id > 0)
            {
                MstCancelReason mstCancelReasonlateCheck = await _mstCancelReason.FirstOrDefaultAsync(p => p.Id == input.Id);
                if (mstCancelReasonlateCheck != null)
                {
                    mstCancelReasonlateCheck = ObjectMapper.Map(input, mstCancelReasonlateCheck);
                }
            }
            else
            {
                if (mstCancelReasonlate != null)
                {
                    throw new UserFriendlyException(400, L("TemplateCodeDuplicate"));
                }
                else
                {
                    MstCancelReason mstCancelReason = new MstCancelReason();
                    mstCancelReason = ObjectMapper.Map(input, mstCancelReason);
                    await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(mstCancelReason);
                }
            }
        }
    }
}
