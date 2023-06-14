using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.Formula.PTG;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Common;
using tmss.EntityFrameworkCore;
using tmss.Master.ContractTemplate;
using tmss.Master.ContractTemplate.Dto;
using tmss.Master.PurchasePurpose.Dto;
using tmss.PR;
using tmss.Price;

namespace tmss.Master
{
    public class MstContractTemplateAppService : tmssAppServiceBase, IMstContractTemplateAppService
    {

        private readonly IRepository<MstContractTemplate, long> _mstContractTemplateRepository;
        private readonly IRepository<MstInventoryGroup, long> _mstInventoryGroupRepository;
        private readonly ICommonLookupAppService _commonLookupAppService;
        private readonly IRepository<MstAttachFiles, long> _attachFileRepo;

        public MstContractTemplateAppService(IRepository<MstContractTemplate, long> mstContractTemplateRepository, 
            IRepository<MstInventoryGroup, long> mstInventoryGroupRepository,
            ICommonLookupAppService commonLookupAppService,
            IRepository<MstAttachFiles, long> attachFileRepo)
        {
            _mstContractTemplateRepository = mstContractTemplateRepository;
            _mstInventoryGroupRepository = mstInventoryGroupRepository;
            _commonLookupAppService = commonLookupAppService;
            _attachFileRepo = attachFileRepo;
        }

        [AbpAuthorize(AppPermissions.FrameworkContractCatalog_Search)]
        public async Task<PagedResultDto<GetContractTemplateDto>> getAllContractTemplate(InputSearchContractTemplateDto inputSearchContractTemplate)
        {
            var listContractTemplate = from contractTemplate in _mstContractTemplateRepository.GetAll().AsNoTracking()
                                       join invGroup in _mstInventoryGroupRepository.GetAll().AsNoTracking()
                                       on contractTemplate.InventoryGroupId equals invGroup.Id
                                       join attach in _attachFileRepo.GetAll().AsNoTracking()
                                       on contractTemplate.Id equals attach.HeaderId 
                                       into listAttachFileTem
                                       from attachTem in listAttachFileTem.DefaultIfEmpty()
                                       where (string.IsNullOrWhiteSpace(inputSearchContractTemplate.Keyword) || contractTemplate.TemplateName.Contains(inputSearchContractTemplate.Keyword))
                                       select new GetContractTemplateDto()
                                       {
                                           Id = contractTemplate.Id,
                                           InventoryGroupName = invGroup.ProductGroupName,
                                           TemplateCode = contractTemplate.TemplateCode,
                                           TemplateName = contractTemplate.TemplateName,
                                           IsActive = contractTemplate.IsActive,
                                           Attachments = attachTem.ServerFileName,
                                           Description = contractTemplate.Description
                                       };
            var result = listContractTemplate.Skip(inputSearchContractTemplate.SkipCount).Take(inputSearchContractTemplate.MaxResultCount);
            return new PagedResultDto<GetContractTemplateDto>(
                       listContractTemplate.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputContractTemplateDto> LoadById(long id)
        {
            var attachMentName = await _commonLookupAppService.GetAttachFileData(id, "TC");
            var listContractTemplate = from contractTemplate in _mstContractTemplateRepository.GetAll().AsNoTracking()
                                       where contractTemplate.Id == id
                                       select new InputContractTemplateDto()
                                       {
                                           Id = contractTemplate.Id,
                                           InventoryGroupId = contractTemplate.InventoryGroupId,
                                           TemplateCode = contractTemplate.TemplateCode,
                                           TemplateName = contractTemplate.TemplateName,
                                           IsActive = contractTemplate.IsActive,
                                           Description = contractTemplate.Description,
                                           AttachmentFileName = attachMentName!= null? attachMentName.ServerFileName : "",
                                           RootPath = attachMentName!= null? attachMentName.RootPath : "",
                                       };
            return await listContractTemplate.FirstOrDefaultAsync();
        }

        [AbpAuthorize(AppPermissions.FrameworkContractCatalog_Add, AppPermissions.FrameworkContractCatalog_Edit)]
        public async Task<long> Save(InputContractTemplateDto input)
        {
            MstContractTemplate mstContractTemplateInsert = new MstContractTemplate();
            if (input.Id > 0)
            {
                MstContractTemplate mstContractTemplateCheck = await _mstContractTemplateRepository.FirstOrDefaultAsync(p => p.Id == input.Id);
                if (mstContractTemplateCheck != null)
                {
                    mstContractTemplateCheck = ObjectMapper.Map(input, mstContractTemplateCheck);
                }
                return mstContractTemplateCheck.Id;
            }
            else
            {
                MstContractTemplate mstContractTemplate = await _mstContractTemplateRepository.FirstOrDefaultAsync(p => p.TemplateCode == input.TemplateCode);
                if (mstContractTemplate != null)
                {
                    throw new UserFriendlyException(400, L("TemplateCodeDuplicate"));
                }
                else
                {
                    
                    mstContractTemplateInsert = ObjectMapper.Map(input, mstContractTemplateInsert);
                    await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(mstContractTemplateInsert);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                return mstContractTemplateInsert.Id;
            }

        }

        [AbpAuthorize(AppPermissions.FrameworkContractCatalog_Delete)]
        public async Task DeleteContractTemplate(long id)
        {
            MstContractTemplate mstContractTemplateCheck = await _mstContractTemplateRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstContractTemplateCheck != null)
            {
                await _mstContractTemplateRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, L(AppConsts.ValRecordsDelete));
            }
        }

        [AbpAuthorize(AppPermissions.FrameworkContractCatalog_Delete)]
        public async Task DeleteAttachment(long ContractId)
        {
            await _commonLookupAppService.DeleteAllAttachmentByConTractId(ContractId);
        }

    }
}
