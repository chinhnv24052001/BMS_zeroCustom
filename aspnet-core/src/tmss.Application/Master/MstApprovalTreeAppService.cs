using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Abp.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Supplier.Dto;
using tmss.Master.Supplier;
using tmss.Master;
using tmss;
using tmss.Master.ApprovalTree;
using tmss.Master.ApprovalTree.Dto;
using Microsoft.EntityFrameworkCore;
using PayPalCheckoutSdk.Orders;
using Stripe;
using tmss.Authorization.Users;
using tmss.Master.UnitOfMeasure.Dto;
using Abp.Dapper.Repositories;
using Abp.Authorization;
using tmss.Authorization;

namespace tmss.Master
{
    public class MstApprovalTreeAppService : tmssAppServiceBase, IMstApprovalTreeAppService
    {
        private readonly IRepository<MstTitles, long> _mstMstTitlesRepository;
        private readonly IRepository<MstProcessType, long> _mstMstProcessTypeRepository;
        private readonly IRepository<MstHrOrgStructure, Guid> _mstMstHrOrgStructureRepository;
        private readonly IRepository<MstApprovalType, long> _mstMstApprovalTypeRepository;
        private readonly IRepository<MstApprovalTreeDetail, long> _mstMstApprovalTreeDetailRepository;
        private readonly IRepository<MstApprovalTree, long> _mstMstApprovalTreeRepository;
        private readonly IRepository<MstCurrency, long> _mstMstCurrencyRepository;
        private readonly IRepository<MstInventoryGroup, long> _mstInventoryGroupRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<MstApprovalTreeDetailUser, long> _mstApprovalTreeDetailUserRepository;
        private readonly IRepository<MstPosition, long> _mstPositionRepository;
        private readonly IDapperRepository<User, long> _dapper;

        public MstApprovalTreeAppService(IRepository<MstTitles, long> mstMstTitlesRepository,
           IRepository<MstProcessType, long> mstMstProcessTypeRepository,
           IRepository<MstHrOrgStructure, Guid> mstMstHrOrgStructureRepository,
           IRepository<MstApprovalType, long> mstMstApprovalTypeRepository,
           IRepository<MstApprovalTreeDetail, long> mstMstApprovalTreeDetailRepository,
           IRepository<MstApprovalTree, long> mstMstApprovalTreeRepository,
           IRepository<MstCurrency, long> mstMstCurrencyRepository,
           IRepository<MstInventoryGroup, long> mstInventoryGroupRepository,
           IRepository<User, long> userRepository,
           IRepository<MstApprovalTreeDetailUser, long> mstApprovalTreeDetailUserRepository,
           IDapperRepository<User, long> dapper,
           IRepository<MstPosition, long> mstPositionRepository
           )
        {
            _mstMstTitlesRepository = mstMstTitlesRepository;
            _mstMstProcessTypeRepository = mstMstProcessTypeRepository;
            _mstMstHrOrgStructureRepository = mstMstHrOrgStructureRepository;
            _mstMstApprovalTypeRepository = mstMstApprovalTypeRepository;
            _mstMstApprovalTreeDetailRepository = mstMstApprovalTreeDetailRepository;
            _mstMstApprovalTreeRepository = mstMstApprovalTreeRepository;
            _mstMstCurrencyRepository = mstMstCurrencyRepository;
            _mstInventoryGroupRepository = mstInventoryGroupRepository;
            _userRepository = userRepository;
            _mstApprovalTreeDetailUserRepository = mstApprovalTreeDetailUserRepository;
            _dapper = dapper;
            _mstPositionRepository = mstPositionRepository;

        }

        //Delete
        [AbpAuthorize(AppPermissions.ApprovalTree_Delete)]
        public async Task Delete(long id)
        {
            MstApprovalTree mstApprovalTree = await _mstMstApprovalTreeRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstApprovalTree != null)
            {
                var listApprovalTreeDetail = _mstMstApprovalTreeDetailRepository.GetAll().Where(p => p.ApprovalTreeId == mstApprovalTree.Id).ToList();
                foreach(var item in listApprovalTreeDetail)
                {
                    await _mstMstApprovalTreeDetailRepository.DeleteAsync(item.Id);
                }
                await _mstMstApprovalTreeRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, AppConsts.ValRecordsDelete);
            }
        }

        //Get list process dropdown
        public async Task<List<ProcessTypeDto>> GetListProcessType()
        {
            var listProcessType = from processType in _mstMstProcessTypeRepository.GetAll().AsNoTracking()
                                  select new ProcessTypeDto
                                  {
                                      Id = processType.Id,
                                      ProcessName = processType.ProcessTypeName
                                  };
            return listProcessType.ToList();
        }

        //Get list iventory group dropdown
        public async Task<List<IventoryGroupDto>> GetListIventoryGroup()
        {
            var listIventoryGroup = from iventory in _mstInventoryGroupRepository.GetAll().AsNoTracking()
                                  select new IventoryGroupDto
                                  {
                                      Id = iventory.Id,
                                      Name = iventory.ProductGroupName
                                  };
            return listIventoryGroup.ToList();
        }

        

        //Get list user in abpUser
        public async Task<List<UserSearchByHrOgrDto>> GetListUser()
        {
            var listUser = from user in _userRepository.GetAll().AsNoTracking()
                           select new UserSearchByHrOgrDto
                           {
                               Id = user.Id,
                               UserName = user.Name
                           };
            return listUser.ToList();
        }

        //Get list approval type dropdown
        public async Task<List<ApprovalTypeDto>> GetListApprovalType()
        {
            var listApprovalType = from approvalType in _mstMstApprovalTypeRepository.GetAll().AsNoTracking()
                                  select new ApprovalTypeDto
                                  {
                                      Id = approvalType.Id,
                                      ApprovalTypeName = approvalType.ApprovalTypeName
                                  };
            return listApprovalType.ToList();
        }

        //Get list HrOrgStructure dropdown _mstMstHrOrgStructureRepository
        public async Task<List<HrOrgStructureDto>> GetListHrOrgStructure()
        {
            var listHrOrgStructure = from hrOrgStructure in _mstMstHrOrgStructureRepository.GetAll().AsNoTracking()
                                     where hrOrgStructure.Published == 1
                                     select new HrOrgStructureDto
                                     {
                                         Id = hrOrgStructure.Id.ToString(),
                                         Name = hrOrgStructure.Name + " (" + hrOrgStructure.OrgStructureTypeName + ")"
                                     };
            return listHrOrgStructure.ToList();
        }

        //Get list title dropdown
        public async Task<List<TitleDto>> GetListTitle()
        {
            var listTitle = from title in _mstMstTitlesRepository.GetAll().AsNoTracking()
                                   select new TitleDto
                                   {
                                       Id = title.Id,
                                       Name = title.Name
                                   };
            return listTitle.ToList();
        }

        //Get list currency
        public async Task<List<CurrencyDto>> GetListCurrency()
        {
            var listCurrency = from currency in _mstMstCurrencyRepository.GetAll().AsNoTracking()
                            select new CurrencyDto
                            {
                                Id = currency.Id,
                                Name = currency.CurrencyCode + " - " + currency.Name,
                            };
            return listCurrency.ToList();
        }

        //Get hrOrg Internal
        public async Task<string> GetHrOrgInternal()
        {
            var user = await _userRepository.FirstOrDefaultAsync(AbpSession.UserId.Value);
            string hrOrgId;
            if(user != null)
            {
                hrOrgId= user.HrOrgStructureId != null ? user.HrOrgStructureId.ToString() : null;
            }
            else
            {
                throw new Exception("Do not find user");
            }
            
            return hrOrgId;
        }

        //Get all Approval tree
        [AbpAuthorize(AppPermissions.ApprovalTree_Search)]
        public async Task<PagedResultDto<ApprovalTreeOutputSelectDto>> getAllApproval(ApprovalTreeInputSearchDto approvalTreeInputSearchDto)
        {
            //var _list = _mstMstApprovalTreeRepository.GetAll().ToList();
        var listApprovalTree = from approvalTree in _mstMstApprovalTreeRepository.GetAll().AsNoTracking()
                               join process in _mstMstProcessTypeRepository.GetAll().AsNoTracking()
                               on approvalTree.ProcessTypeId equals process.Id
                               join iventory in _mstInventoryGroupRepository.GetAll().AsNoTracking() on approvalTree.InventoryGroupId equals iventory.Id into k
                                from iventory in k.DefaultIfEmpty()
                               join curency in _mstMstCurrencyRepository.GetAll().AsNoTracking() on approvalTree.CurrencyId equals curency.Id into l
                               from curency in l.DefaultIfEmpty()

                               where ((approvalTreeInputSearchDto.ProcessTypeId == 0 || approvalTree.ProcessTypeId == approvalTreeInputSearchDto.ProcessTypeId)
                               && (approvalTreeInputSearchDto.InventoryGroupId == 0 || approvalTree.InventoryGroupId == approvalTreeInputSearchDto.InventoryGroupId))
                               //&& (approvalTreeInputSearchDto.CreationTime == null || approvalTree.CreationTime.Date == approvalTreeInputSearchDto.CreationTime.Value.Date))
                               select new ApprovalTreeOutputSelectDto()
                               {
                                   Id = approvalTree.Id,
                                   ProcessType = process.ProcessTypeName,
                                   CurrencyName = curency.CurrencyCode,
                                   AmountFrom = approvalTree.AmountFrom,
                                   AmountTo = approvalTree.AmountTo,
                                   InventoryGroupName = iventory.ProductGroupName,
                                   Description = approvalTree.Description,
                                   CreationTime = approvalTree.CreationTime
                               };

        var result = listApprovalTree.Skip(approvalTreeInputSearchDto.SkipCount).Take(approvalTreeInputSearchDto.MaxResultCount);
            return new PagedResultDto<ApprovalTreeOutputSelectDto>(
                       listApprovalTree.Count(),
                       result.ToList()
                      );
        }

        //Load by Approval tree Id
        public async Task<ApprovalTreeSaveDto> LoadById(long id)
        {
            var listApprovalTree = from approvalTree in _mstMstApprovalTreeRepository.GetAll().AsNoTracking()
                                   where approvalTree.Id == id
                                   select new ApprovalTreeSaveDto()
                                   {
                                       Id = approvalTree.Id,
                                       ProcessTypeId = approvalTree.ProcessTypeId,
                                       CurrencyId = approvalTree.CurrencyId,
                                       AmountFrom = approvalTree.AmountFrom,
                                       AmountTo = approvalTree.AmountTo,
                                       InventoryGroupId = approvalTree.InventoryGroupId,
                                       Description = approvalTree.Description
                                   };
            var _approvalTree = listApprovalTree.FirstOrDefault();
            if (_approvalTree != null)
            {
                var listApprovalTreeDetail = from approvalTreeDetail in _mstMstApprovalTreeDetailRepository.GetAll().AsNoTracking()
                                             where approvalTreeDetail.ApprovalTreeId == _approvalTree.Id

                                             select new ApprovalTreeDetailSaveDto()
                                             {
                                                 Id = approvalTreeDetail.Id,
                                                 ApprovalTreeId = approvalTreeDetail.ApprovalTreeId,
                                                 ApprovalTypeId = approvalTreeDetail.ApprovalTypeId,
                                                 HrOrgStructureId = approvalTreeDetail.HrOrgStructureId.ToString(),
                                                 TitleId = approvalTreeDetail.TitleId,
                                                 ApprovalSeq = approvalTreeDetail.ApprovalSeq,
                                                 DayOfProcess = approvalTreeDetail.DayOfProcess,
                                                 PositionId = approvalTreeDetail.PositionId,
                                             };
               
                _approvalTree.ListApprovalTreeDetailSave = listApprovalTreeDetail.OrderBy(x => x.ApprovalSeq).ToList();

                foreach (var item in _approvalTree.ListApprovalTreeDetailSave)
                {
                    var listUserId = from approvalDetailUser in _mstApprovalTreeDetailUserRepository.GetAll().AsNoTracking()
                                     where approvalDetailUser.ApprovalTreeDetailId == item.Id
                                     select approvalDetailUser.ApprovalUserId;
                    item.ListUserId = listUserId.ToList();
                }
            }
            return _approvalTree;
        }

        //Save Approval tree
        public async Task<string> Save(ApprovalTreeSaveDto approvalTreeSaveDto)
        {
            if (approvalTreeSaveDto.Id > 0)
            {
               return await Update(approvalTreeSaveDto);
            }
            else
            {
               return  await Create(approvalTreeSaveDto);
            }
        }

        //Create Approval tree
        [AbpAuthorize(AppPermissions.ApprovalTree_Add)]
        private async Task<string> Create(ApprovalTreeSaveDto approvalTreeSaveDto)
        {

            string _sql = "EXEC sp_MstApprovalTreeCheckExists @p_ProcessTypeID, @p_InventoryGroupId, @p_CurrencyId, @p_amount_From, @p_amount_to";
            var list = (await _dapper.QueryAsync<ApprovalTreeSaveDto>(_sql, new
            {
                p_ProcessTypeID = approvalTreeSaveDto.ProcessTypeId,
                p_InventoryGroupId = approvalTreeSaveDto.InventoryGroupId,
                p_CurrencyId = approvalTreeSaveDto.CurrencyId,
                p_amount_From = approvalTreeSaveDto.AmountFrom,
                p_amount_to = approvalTreeSaveDto.AmountTo,
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";

            MstApprovalTree mstApprovalTree = new MstApprovalTree();
            MstApprovalTreeDetail mstApprovalTreeDetail = new MstApprovalTreeDetail();
            MstApprovalTreeDetailUser mstApprovalTreeDetailUser = new MstApprovalTreeDetailUser();

            mstApprovalTree.ProcessTypeId = approvalTreeSaveDto.ProcessTypeId;
            mstApprovalTree.CurrencyId = approvalTreeSaveDto.CurrencyId;
            mstApprovalTree.AmountFrom = approvalTreeSaveDto.AmountFrom;
            mstApprovalTree.AmountTo = approvalTreeSaveDto.AmountTo;
            mstApprovalTree.InventoryGroupId = approvalTreeSaveDto.InventoryGroupId;
            mstApprovalTree.Description = approvalTreeSaveDto.Description;
            mstApprovalTree.CreationTime = DateTime.Now;
            mstApprovalTree.CreatorUserId = AbpSession.UserId;
            await _mstMstApprovalTreeRepository.InsertAsync(mstApprovalTree);
            await CurrentUnitOfWork.SaveChangesAsync();

            foreach ( var item in approvalTreeSaveDto.ListApprovalTreeDetailSave)
            {
                mstApprovalTreeDetail = new MstApprovalTreeDetail();
                mstApprovalTreeDetail.ApprovalTreeId = mstApprovalTree.Id;
                mstApprovalTreeDetail.HrOrgStructureId = item.HrOrgStructureId != null ? new Guid(item.HrOrgStructureId) : null;
                mstApprovalTreeDetail.ApprovalSeq = item.ApprovalSeq;
                mstApprovalTreeDetail.TitleId = item.TitleId;
                mstApprovalTreeDetail.ApprovalTypeId = item.ApprovalTypeId;
                mstApprovalTreeDetail.DayOfProcess = item.DayOfProcess;
                mstApprovalTreeDetail.PositionId = item.PositionId;
                if (mstApprovalTreeDetail.ApprovalTypeId == 1)
                {
                    mstApprovalTreeDetail.HrOrgStructureId = null;
                }    
                mstApprovalTreeDetail.CreationTime = DateTime.Now;
                mstApprovalTreeDetail.CreatorUserId = AbpSession.UserId;
                await _mstMstApprovalTreeDetailRepository.InsertAsync(mstApprovalTreeDetail);
                await CurrentUnitOfWork.SaveChangesAsync();

                if(item.ListUserId != null)
                {
                    foreach (var user in item.ListUserId)
                    {
                        mstApprovalTreeDetailUser = new MstApprovalTreeDetailUser();
                        mstApprovalTreeDetailUser.ApprovalUserId = user;
                        mstApprovalTreeDetailUser.ApprovalTreeDetailId = mstApprovalTreeDetail.Id;
                        mstApprovalTreeDetailUser.CreationTime = DateTime.Now;
                        mstApprovalTreeDetailUser.CreatorUserId = AbpSession.UserId;
                        await _mstApprovalTreeDetailUserRepository.InsertAsync(mstApprovalTreeDetailUser);
                    }
                }
            }
            return "Info: Save successfully!";

        }

        //Create Approval tree
        [AbpAuthorize(AppPermissions.ApprovalTree_Edit)]
        private async Task<string> Update(ApprovalTreeSaveDto approvalTreeSaveDto)
        {

            string _sql = "EXEC sp_MstApprovalTreeCheckExists @p_ProcessTypeID, @p_InventoryGroupId, @p_CurrencyId, @p_amount_From, @p_amount_to";
            var list = (await _dapper.QueryAsync<ApprovalTreeSaveDto>(_sql, new
            {
                p_ProcessTypeID = approvalTreeSaveDto.ProcessTypeId,
                p_InventoryGroupId = approvalTreeSaveDto.InventoryGroupId,
                p_CurrencyId = approvalTreeSaveDto.CurrencyId,
                p_amount_From = approvalTreeSaveDto.AmountFrom,
                p_amount_to = approvalTreeSaveDto.AmountTo,
            })).ToList();
            if (list[0].CountItem > 1)
                return "Error: Data Exists!";
            MstApprovalTreeDetail mstApprovalTreeDetail = new MstApprovalTreeDetail();
            MstApprovalTreeDetailUser mstApprovalTreeDetailUser = new MstApprovalTreeDetailUser();
            MstApprovalTree mstApprovalTree = await _mstMstApprovalTreeRepository.FirstOrDefaultAsync(p => p.Id == approvalTreeSaveDto.Id);
            mstApprovalTree.ProcessTypeId = approvalTreeSaveDto.ProcessTypeId;
            mstApprovalTree.CurrencyId = approvalTreeSaveDto.CurrencyId;
            mstApprovalTree.AmountFrom = approvalTreeSaveDto.AmountFrom;
            mstApprovalTree.AmountTo = approvalTreeSaveDto.AmountTo;
            mstApprovalTree.InventoryGroupId = approvalTreeSaveDto.InventoryGroupId;
            mstApprovalTree.Description = approvalTreeSaveDto.Description;
            mstApprovalTree.LastModificationTime = DateTime.Now;
            mstApprovalTree.LastModifierUserId = AbpSession.GetUserId();
            await _mstMstApprovalTreeRepository.UpdateAsync(mstApprovalTree);

            var listTemp = _mstMstApprovalTreeDetailRepository.GetAll().Where(p => p.ApprovalTreeId == approvalTreeSaveDto.Id && !approvalTreeSaveDto.ListApprovalTreeDetailSave.Select(e => e.Id).Contains(p.Id)).Select(e => e.Id).ToList();
            if (listTemp != null)
            {
                foreach (var id in listTemp)
                {
                    await _mstMstApprovalTreeDetailRepository.DeleteAsync(id);
                }
            }

            foreach (var item in approvalTreeSaveDto.ListApprovalTreeDetailSave)
            {

                if (item.Id > 0)
                {
                    mstApprovalTreeDetail = await _mstMstApprovalTreeDetailRepository.FirstOrDefaultAsync(p => p.Id == item.Id);
                    mstApprovalTreeDetail.ApprovalTreeId = mstApprovalTree.Id;
                    mstApprovalTreeDetail.HrOrgStructureId = item.HrOrgStructureId != null ? new Guid(item.HrOrgStructureId) : null;
                    mstApprovalTreeDetail.TitleId = item.TitleId;
                    //mstApprovalTreeDetail.ApprovalSeq = item.ApprovalSeq;
                    mstApprovalTreeDetail.ApprovalTypeId = item.ApprovalTypeId;
                    mstApprovalTreeDetail.DayOfProcess = item.DayOfProcess;
                    mstApprovalTreeDetail.ApprovalSeq = item.ApprovalSeq;
                    mstApprovalTreeDetail.PositionId = item.PositionId;
                    if (mstApprovalTreeDetail.ApprovalTypeId == 1)
                    {
                        mstApprovalTreeDetail.HrOrgStructureId = null;
                    }
                    mstApprovalTreeDetail.LastModificationTime = DateTime.Now;
                    mstApprovalTreeDetail.LastModifierUserId = AbpSession.GetUserId();
                    await _mstMstApprovalTreeDetailRepository.UpdateAsync(mstApprovalTreeDetail);

                    var listApprovalTreeDetailUser = _mstApprovalTreeDetailUserRepository.GetAll().Where(p=> p.ApprovalTreeDetailId == item.Id).ToList();
                    foreach(var user in listApprovalTreeDetailUser)
                    {
                        await _mstApprovalTreeDetailUserRepository.DeleteAsync(user.Id);
                    }

                    if (item.ListUserId != null)
                    {

                        foreach (var user in item.ListUserId)
                        {
                            mstApprovalTreeDetailUser = new MstApprovalTreeDetailUser();
                            mstApprovalTreeDetailUser.ApprovalUserId = user;
                            mstApprovalTreeDetailUser.ApprovalTreeDetailId = mstApprovalTreeDetail.Id;
                            mstApprovalTreeDetailUser.CreationTime = DateTime.Now;
                            mstApprovalTreeDetailUser.CreatorUserId = AbpSession.UserId;

                            await _mstApprovalTreeDetailUserRepository.InsertAsync(mstApprovalTreeDetailUser);
                        }
                    }
                }
                else
                {
                    mstApprovalTreeDetail = new MstApprovalTreeDetail();
                    mstApprovalTreeDetail.ApprovalTreeId = mstApprovalTree.Id;
                    mstApprovalTreeDetail.HrOrgStructureId = item.HrOrgStructureId != null ? new Guid(item.HrOrgStructureId) : null;
                    mstApprovalTreeDetail.TitleId = item.TitleId;
                    mstApprovalTreeDetail.PositionId = item.PositionId;
                    mstApprovalTreeDetail.ApprovalTypeId = item.ApprovalTypeId;
                    mstApprovalTreeDetail.ApprovalSeq = item.ApprovalSeq;
                    mstApprovalTreeDetail.DayOfProcess = item.DayOfProcess;
                    if (mstApprovalTreeDetail.ApprovalTypeId == 1)
                    {
                        mstApprovalTreeDetail.HrOrgStructureId = null;
                    }
                    mstApprovalTreeDetail.CreationTime = DateTime.Now;
                    mstApprovalTreeDetail.CreatorUserId = AbpSession.UserId;
                    await _mstMstApprovalTreeDetailRepository.InsertAsync(mstApprovalTreeDetail);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    if (item.ListUserId != null)
                    {
                        foreach (var user in item.ListUserId)
                        {
                            mstApprovalTreeDetailUser = new MstApprovalTreeDetailUser();
                            mstApprovalTreeDetailUser.ApprovalUserId = user;
                            mstApprovalTreeDetailUser.ApprovalTreeDetailId = mstApprovalTreeDetail.Id;
                            mstApprovalTreeDetailUser.CreationTime = DateTime.Now;
                            mstApprovalTreeDetailUser.CreatorUserId = AbpSession.UserId;
                            await _mstApprovalTreeDetailUserRepository.InsertAsync(mstApprovalTreeDetailUser);
                        }
                    }
                }
            }
            await CurrentUnitOfWork.SaveChangesAsync();

            return "Info: Save successfully!";

        }

        //Detail approval tree
        public async Task<ApprovalTreeDetailSelectDto> getDetailApprovalTree(long Id)
        {
            var listApprovalTree = from approvalTree in _mstMstApprovalTreeRepository.GetAll().AsNoTracking()
                                   join process in _mstMstProcessTypeRepository.GetAll().AsNoTracking()
                                   on approvalTree.ProcessTypeId equals process.Id
                                   join currency in _mstMstCurrencyRepository.GetAll().AsNoTracking()
                                   on approvalTree.CurrencyId equals currency.Id
                                   join iventory in _mstInventoryGroupRepository.GetAll().AsNoTracking()
                                   on approvalTree.InventoryGroupId equals iventory.Id
                                   where approvalTree.Id == Id
                                   select new ApprovalTreeDetailSelectDto()
                                   {
                                       Id = approvalTree.Id,
                                       ProcessType = process.ProcessTypeName,
                                       CurrencyName = currency.Name,
                                       AmountFrom = approvalTree.AmountFrom,
                                       AmountTo = approvalTree.AmountTo,
                                       InventoryGroupName = iventory.ProductGroupName,
                                       Description = approvalTree.Description
                                   };
            var _approvalTree = listApprovalTree.FirstOrDefault();
            if (_approvalTree != null)
            {
                var listApprovalTreeDetail = from approvalTreeDetail in _mstMstApprovalTreeDetailRepository.GetAll().AsNoTracking()
                                             join approvalType in _mstMstApprovalTypeRepository.GetAll().AsNoTracking()
                                             on approvalTreeDetail.ApprovalTypeId equals approvalType.Id
                                             join org in  _mstMstHrOrgStructureRepository.GetAll().AsNoTracking()
                                             on approvalTreeDetail.HrOrgStructureId equals org.Id
                                             join title in  _mstMstTitlesRepository.GetAll().AsNoTracking()
                                             on approvalTreeDetail.TitleId equals title.Id
                                             where approvalTreeDetail.ApprovalTreeId == _approvalTree.Id
                                             select new ApprovalTreeDetailOutputSelectDto()
                                             {
                                                 Id = approvalTreeDetail.Id,
                                                 ApprovalTreeId = approvalTreeDetail.ApprovalTreeId,
                                                 ApprovalTypeName = approvalType.ApprovalTypeName,
                                                 HrOrgStructureName = org.Name,
                                                 TitleName = title.Name
                                             };
                _approvalTree.ListApprovalTreeDetailItem = listApprovalTreeDetail.ToList();
            }
            return _approvalTree;
        }

        //Get list process dropdown
        public async Task<List<PositionDropdownDto>> GetListPosition()
        {
            var listProcessType = from position in _mstPositionRepository.GetAll().AsNoTracking()
                                  select new PositionDropdownDto
                                  {
                                      Id = position.Id,
                                      PositionName = position.PositionName
                                  };
            return listProcessType.ToList();
        }
    }
}
