using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Common.GeneratePurchasingNumber;
using tmss.GR.Enum;
using tmss.Price.Dto;

namespace tmss.Price
{
    public class PrcContractHeaderAppService : tmssAppServiceBase, IPrcContractHeaderAppService
    {
        private readonly IDapperRepository<PrcContractHeaders, long> _prcContractHeaderRepository;
        private readonly IRepository<PrcContractHeaders, long> _headerRepo;
        private readonly IRepository<MstAttachFiles, long> _attachFileRepo;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGeneratePurchasingNumberAppService;


        public PrcContractHeaderAppService(
            IDapperRepository<PrcContractHeaders, long> prcContractHeaderRepository,
            IRepository<PrcContractHeaders, long> headerRepo,
            IRepository<MstAttachFiles, long> attachFileRepo,
            ICommonGeneratePurchasingNumberAppService commonGeneratePurchasingNumberAppService
            )
        {
            _prcContractHeaderRepository = prcContractHeaderRepository;
            _headerRepo = headerRepo;
            _attachFileRepo = attachFileRepo;
            _commonGeneratePurchasingNumberAppService = commonGeneratePurchasingNumberAppService;
        }



        public async Task DeleteContract(long headerId)
        {
            string _sql1 = "delete from PrcContractHeaders where Id = @id";
            await _prcContractHeaderRepository.ExecuteAsync(_sql1, new
            {
                @id = headerId,
            });

        }

        public async Task<long> CreateOrEdit(GetAllContractHeaderDto input)
        {
            if (input.Id == 0)
            {
                string pcNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.Annex);

                var check = await _headerRepo.FirstOrDefaultAsync(e => e.ContractNo == input.ContractNo && e.Id != input.Id);

                if (check != null) throw new UserFriendlyException("Contract No Exist");

                var data = new PrcContractHeaders();
                data.ContractNo = input.ContractNo;
                //data.ApprovalStatus = input;
                data.EffectiveFrom = input.EffectiveFrom;
                data.EffectiveTo = input.EffectiveTo;
                data.Description = input.Description;
                data.ApprovalStatus = AppConsts.STATUS_PENDING;
                data.SeqNo = pcNo;

                long id = _headerRepo.InsertAndGetId(data);
                return id;

                //if (input.AttachFiles != null)
                //{
                //    foreach (var x in input.AttachFiles)
                //    {
                //        var file = new MstAttachFiles();
                //        file.OriginalFileName = x.OriginalFileName;
                //        file.ServerFileName = x.ServerFileName;
                //        file.HeaderId = id;

                //        await _attachFileRepo.InsertAsync(file);
                //    }
                //}
                

            }
            else
            {
                var check = await _headerRepo.FirstOrDefaultAsync(e => e.ContractNo == input.ContractNo && e.Id != input.Id);

                if (check != null) throw new UserFriendlyException("Contract No Exist");
                var data = await _headerRepo.FirstOrDefaultAsync(e => e.Id == input.Id);
                data.ContractNo = input.ContractNo;
                //data.ApprovalStatus = input;
                data.EffectiveFrom = input.EffectiveFrom;
                data.EffectiveTo = input.EffectiveTo;
                data.Description = input.Description;
                return input.Id;

                //if (input.AttachFiles != null)
                //{
                //    foreach (var x in input.AttachFiles)
                //    {
                //        var file = new MstAttachFiles();
                //        file.OriginalFileName = x.OriginalFileName;
                //        file.ServerFileName = x.ServerFileName;
                //        file.HeaderId = input.Id;

                //        await _attachFileRepo.InsertAsync(file);
                //    }
                //}

            }
        }

        public async Task<PagedResultDto<GetAllContractHeaderDto>> GetAllData(SearchInputDto searchInputDto)
        {
            string _sql = "EXEC sp_PrcContractHeader$Search @ContractNo, @EffectiveFrom, @EffectiveTo, @Page, @PageSize";
            var lstContract = await _prcContractHeaderRepository.QueryAsync<GetAllContractHeaderDto>(_sql, new
            {
                @ContractNo = searchInputDto.ContractNo,
                @EffectiveFrom = searchInputDto.EffectiveFrom,
                @EffectiveTo = searchInputDto.EffectiveTo,
                @Page = searchInputDto.Page,
                @PageSize = searchInputDto.PageSize 
            });

            int totalCount = 0;
            if (lstContract != null && lstContract.Count() > 0)
            {
                totalCount = (int)lstContract.ToList()[0].TotalCount;
            }
            return new PagedResultDto<GetAllContractHeaderDto>(
                       totalCount,
                       lstContract.ToList()
                      );
        }

        public GetAllContractHeaderDto GetContractDataById(long id)
        {
            //string _sql = "EXEC sp_PrcContractHeader$Search @ContractNo, @EffectiveFrom, @EffectiveTo, @Page, @PageSize";
            //var lstContract = await _prcContractHeaderRepository.QueryAsync<GetAllContractHeaderDto>(_sql, new
            //{
            //    @ContractNo = searchInputDto.ContractNo,
            //    @EffectiveFrom = searchInputDto.EffectiveFrom,
            //    @EffectiveTo = searchInputDto.EffectiveTo,
            //    @Page = searchInputDto.Page,
            //    @PageSize = searchInputDto.PageSize
            //});
            var data = (from e in _prcContractHeaderRepository.GetAll()
                        where e.Id == id
                        select new GetAllContractHeaderDto
                        {
                            Id = e.Id,
                            ContractNo = e.ContractNo,
                            EffectiveFrom = e.EffectiveFrom,
                            EffectiveTo = e.EffectiveTo,
                            Description = e.Description,
                            ApprovalStatus = e.ApprovalStatus,
                        }).FirstOrDefault();
            return data;
        }

        //public async Task<List<GetAttachFileDto>> GetListAttachFileData(long headerId, string type)
        //{
        //    var list = from a in _attachFileRepo.GetAll().Where(e => e.HeaderId == headerId && e.AttachFileType.ToUpper() == (type ?? "").ToUpper() )
        //               select new GetAttachFileDto
        //               {
        //                   Id = a.Id,
        //                   HeaderId = a.HeaderId,
        //                   OriginalFileName = a.OriginalFileName,
        //                   ServerFileName = a.ServerFileName,
        //               };
        //    return await list.ToListAsync();
        //}
    }
}
