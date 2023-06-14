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
using tmss.Master.Assess.Dto;
using tmss.Master.CancelReason;
using tmss.Master.Relationship;
using System.Linq.Expressions;
using Abp.Linq.Extensions;
using Abp.Extensions;

namespace tmss.Master
{
    public class MstAssessAppService : tmssAppServiceBase, IMstAssessAppService
    {

        private readonly IRepository<MstCancelReason, long> _mstCancelReason;
        private readonly IRepository<MstAssess, long> _assessRepo;
        private readonly IRepository<MstAssessDetail, long> _assessDetailRepo;
        private readonly IRepository<MstAssessGroup, long> _assessGroupRepo;
        private readonly IRepository<AssessRelationship, long> _assessRelationshipRepo;
        private readonly IRepository<MstProcessType, long> _mstProcessType;

        public MstAssessAppService(IRepository<MstCancelReason, long> mstCancelReason,
            IRepository<MstAssess, long> assessRepo,
            IRepository<MstAssessDetail, long> assessDetailRepo,
            IRepository<MstAssessGroup, long> assessGroupRepo,
            IRepository<AssessRelationship, long> assessRelationshipRepo,
            IRepository<MstProcessType, long> mstProcessType)
        {
            _mstCancelReason = mstCancelReason;
            _assessRepo = assessRepo;
            _assessDetailRepo = assessDetailRepo;
            _assessGroupRepo = assessGroupRepo;
            _assessRelationshipRepo = assessRelationshipRepo;
            _mstProcessType = mstProcessType;
        }


        // tìm kiếm list nhóm tiêu chí đánh giá
        public async Task<PagedResultDto<AssessInfoDto>> GetAssessDataInfo(AssessSearchInput input)
        {
            var searchDataList =  from a in _assessRepo.GetAll().AsNoTracking()
                                  where string.IsNullOrWhiteSpace(input.SearchValue) ? 1== 1 : a.AssessName.Contains(input.SearchValue)
                                 select new AssessInfoDto
                                 {
                                     Id = a.Id,
                                     AssessName = a.AssessName,
                                 };

            var totalCount = await searchDataList.CountAsync();

            var result = await searchDataList.PageBy(input).ToListAsync();

            return new PagedResultDto<AssessInfoDto>(
                       totalCount,
                       result
                      );

        }

        public async Task<PagedResultDto<AssessGroupInfoDto>> GetAssessGroupDataInfo(AssessSearchInput input)
        {
            var searchDataList = from a in _assessGroupRepo.GetAll().AsNoTracking()
                                 where string.IsNullOrWhiteSpace(input.SearchValue) ? 1 == 1 : (a.AssessGroupName.Contains(input.SearchValue) || a.AssessGroupCode.Contains(input.SearchValue))
                                 select new AssessGroupInfoDto
                                 {
                                     Id = a.Id,
                                     AssessGroupName = a.AssessGroupName,
                                     AssessGroupCode = a.AssessGroupCode,
                                     Description = a.Description,
                                     AssessGroupType = a.AssessGroupType,
                                     AssessDetailList =  (from ad in _assessDetailRepo.GetAll().AsNoTracking()
                                                  join ars in _assessRelationshipRepo.GetAll().AsNoTracking() on ad.AssessId equals ars.AssessId into k
                                                  from ars in k.DefaultIfEmpty()
                                                  join ai in _assessRepo.GetAll().AsNoTracking() on ad.AssessId equals ai.Id into l
                                                  from ai in l.DefaultIfEmpty()
                                                      //join ad in _assessDetailRepo.GetAll().AsNoTracking() on a.Id equals ad.AssessId into k 
                                                      //from ad in k.DefaultIfEmpty()
                                                  where ars.AssessGroupId == a.Id
                                                  orderby ad.AssessId
                                                  select new AssessDetailInfoDto
                                                  {
                                                      Id = ad.Id,
                                                      AssessItemName = ad.AssessItemName,
                                                      AssessId = ad.AssessId,
                                                      Description = ad.Description,
                                                      RateValue = ad.RateValue,
                                                      AssessName = ai.AssessName,
                                                      AssessGroupId = ars.AssessGroupId,
                                                  }).ToList(),
                                     AssessList = (from ai in _assessRepo.GetAll().AsNoTracking()
                                                   join  ars in _assessRelationshipRepo.GetAll().AsNoTracking() on ai.Id equals ars.AssessId
                                                   where ars.AssessGroupId == a.Id
                                                   select new AssessInfoDto
                                                   {
                                                       Id = ai.Id,
                                                       AssessName = ai.AssessName,
                                                       RateValue = ars.RateValue,
                                                   }).ToList(),
        };

            var totalCount = await searchDataList.CountAsync();

            var result = await searchDataList.PageBy(input).ToListAsync();

            return new PagedResultDto<AssessGroupInfoDto>(
                       totalCount,
                       result
                      );
        }

        public async Task<List<AssessDetailInfoDto>> GetAssessGroupDetailDataInfo(long? assessGroupId)
        {
            var searchDataList = from ad in _assessDetailRepo.GetAll().AsNoTracking() 
                                join  ars in _assessRelationshipRepo.GetAll().AsNoTracking() on ad.AssessId equals ars.AssessId into k 
                                from ars in k.DefaultIfEmpty()
                                 join a in _assessRepo.GetAll().AsNoTracking() on ad.AssessId equals a.Id into l
                                 from a in l.DefaultIfEmpty()
                                 //join ad in _assessDetailRepo.GetAll().AsNoTracking() on a.Id equals ad.AssessId into k 
                                 //from ad in k.DefaultIfEmpty()
                                 where (assessGroupId == null || assessGroupId == 0 ) ? 1==1 :  ars.AssessGroupId == assessGroupId
                                 orderby ad.AssessId
                                 select new AssessDetailInfoDto
                                 {
                                     Id = ad.Id,
                                     AssessItemName = ad.AssessItemName,
                                     AssessId = ad.AssessId,
                                     Description = ad.Description,
                                     RateValue = ad.RateValue,
                                     AssessName = a.AssessName,
                                 };
            return await searchDataList.ToListAsync();

        }

        // Thêm hoạc chỉnh sửa nhóm tiêu chí
        public async Task CreateOrEditAssessGroup(AssessGroupInfoDto input)
        {

            var sumRateValue = input.AssessList.Sum(e => (e.RateValue));

            if (sumRateValue != 100) throw new UserFriendlyException("Tổng tỉ trọng các nhóm tiêu chí phải bằng 100");

            if (input.Id == null)
            {
                await CreateAssessGroup(input);
            }
            else
            {
                await UpdateAssessGroup(input);
            }
        }

        private async Task UpdateAssessGroup(AssessGroupInfoDto input)
        {
            var asssess = await _assessGroupRepo.FirstOrDefaultAsync((long)input.Id);

            ObjectMapper.Map(input, asssess);
            await CurrentUnitOfWork.SaveChangesAsync();

            var assessRemoveList = await _assessRelationshipRepo.GetAll().Where(e => e.AssessGroupId == input.Id).ToListAsync();

            foreach (var assessRemove in assessRemoveList)
            {
                if (!input.AssessList.Any(e => e.Id == assessRemove.AssessId)) await _assessRelationshipRepo.DeleteAsync(assessRemove);
            }


            foreach (var assessInfo in input.AssessList)
            {
                var assessInfoData = await _assessRelationshipRepo.FirstOrDefaultAsync(c => c.AssessId == assessInfo.Id && c.AssessGroupId == input.Id);
                if (assessInfoData == null)
                {
                    var assessRelationship = new AssessRelationship();
                    assessRelationship.AssessGroupId = (long)input.Id;
                    assessRelationship.AssessId = (long)assessInfo.Id;
                    assessRelationship.RateValue = assessInfo.RateValue;
                    await _assessRelationshipRepo.InsertAsync(assessRelationship);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                else
                {
                    assessInfoData.RateValue = assessInfo.RateValue;
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }
        }

        private async Task CreateAssessGroup(AssessGroupInfoDto input)
        {
            var checkExist = await _assessGroupRepo.FirstOrDefaultAsync(e => e.AssessGroupName == input.AssessGroupName);
            if (checkExist != null) throw new UserFriendlyException("Tên nhóm tiêu chí đã tồn tại");

            long maxSeq = 0;

            var lastData = await _assessGroupRepo.GetAll().Select(e => new { Seq =  long.Parse(e.AssessGroupCode.Substring(4, 4)) }).ToListAsync();
            if (lastData.Count() != 0) maxSeq = lastData.Max(e => e.Seq);

            input.AssessGroupCode = $"TCDG{(maxSeq+1).ToString("0000")}";

            var assessGroup = ObjectMapper.Map<MstAssessGroup>(input);
            var assessGroupId = await _assessGroupRepo.InsertAndGetIdAsync(assessGroup);

            //List<MstAssessGroup> addList = new List<MstAssessGroup>();

            foreach (var assessInfo in input.AssessList)
            {
                var assessRelationship = new AssessRelationship();
                assessRelationship.AssessGroupId = assessGroupId;
                assessRelationship.AssessId = (long)assessInfo.Id;
                assessRelationship.RateValue = assessInfo.RateValue;
                await _assessRelationshipRepo.InsertAsync(assessRelationship);
                await CurrentUnitOfWork.SaveChangesAsync();
            }


        }

        public async Task<List<AssessDetailInfoDto>> GetAssessDetailDataInfo(long assessId)
        {
            var searchDataList = from ad in _assessDetailRepo.GetAll().AsNoTracking()
                                 where ad.AssessId == assessId
                                 select new AssessDetailInfoDto
                                 {
                                     Id = ad.Id,
                                     AssessItemName = ad.AssessItemName,
                                     AssessId = ad.AssessId,
                                     Description = ad.Description,
                                     RateValue = ad.RateValue,
                                 };
            return await searchDataList.ToListAsync();

        }

        // Thêm hoạc chỉnh sửa nhóm tiêu chí
        public async Task CreateOrEditAssess(AssessInfoDto input)
        {

            var sumRateValue = input.AssessDetailList.Sum(e => e.RateValue);

            if (sumRateValue != 100) throw new UserFriendlyException("Tổng tỉ trọng các tiêu chí phải bằng 100");

            if (input.Id == null)
            {
                await CreateAssess(input);
            }
            else
            {
                await UpdateAssess(input);
            }
        }

        private async Task UpdateAssess(AssessInfoDto input)
        {

            var asssess = await _assessRepo.FirstOrDefaultAsync((long)input.Id);

            ObjectMapper.Map(input, asssess);
            await CurrentUnitOfWork.SaveChangesAsync();

            var assessDetailRemoveList = await _assessDetailRepo.GetAll().Where(e => e.AssessId == input.Id).ToListAsync();

            foreach (var assessDetailRemove in assessDetailRemoveList)
            {
                if (!input.AssessDetailList.Any(e => e.Id == assessDetailRemove.Id)) await _assessDetailRepo.DeleteAsync(assessDetailRemove);
            }


            foreach (var assessDetailInfo in input.AssessDetailList)
            {
                MstAssessDetail assessDetail = await _assessDetailRepo.FirstOrDefaultAsync(c => c.Id == assessDetailInfo.Id);
                if (assessDetail != null)
                {
                    var assessDetailUpdate = ObjectMapper.Map<MstAssessDetail>(assessDetailInfo);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                else
                {
                    var assessDetailAdd = ObjectMapper.Map<MstAssessDetail>(assessDetailInfo);
                    await _assessDetailRepo.InsertAsync(assessDetailAdd);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    //CurrentUnitOfWork.GetDbContext<tmssDbContext>().Add(comment);
                    //  CurrentUnitOfWork.SaveChanges();
                }
            }

            

            
        }

        private async Task CreateAssess(AssessInfoDto input)
        {
            var checkExist = await _assessRepo.FirstOrDefaultAsync(e => e.AssessName == input.AssessName);
            if (checkExist != null) throw new UserFriendlyException("Tên nhóm tiêu chí đã tồn tại");
            var assess = ObjectMapper.Map<MstAssess>(input);
            var assetId = await _assessRepo.InsertAndGetIdAsync(assess);

            List<MstAssessDetail> addList = new List<MstAssessDetail>();

            foreach (var assessDetailInfo in input.AssessDetailList)
            {
                    var assessDetailAdd = ObjectMapper.Map<MstAssessDetail>(assessDetailInfo);
                assessDetailAdd.AssessId = assetId;
                await _assessDetailRepo.InsertAsync(assessDetailAdd);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            
           // CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddRange(addList);
            
        }


        // Thêm hoạc chỉnh sửa tiêu chí
        public async Task CreateOrEditAssessDetail(AssessDetailInfoDto input)
        {
            if (input.Id == null)
            {
                await CreateAssessDetail(input);
            }
            else
            {
                await UpdateAssessDetail(input);
            }
        }

        private async Task CreateAssessDetail(AssessDetailInfoDto input)
        {
            var assessDetail = ObjectMapper.Map<MstAssessDetail>(input);
            await _assessDetailRepo.InsertAsync(assessDetail);
        }

        private async Task UpdateAssessDetail(AssessDetailInfoDto input)
        {
            var asssessDetail = await _assessDetailRepo.FirstOrDefaultAsync((long)input.Id);

            ObjectMapper.Map(input, asssessDetail);
            await CurrentUnitOfWork.SaveChangesAsync();
        }


        // xóa nhóm tiêu chí
        public async Task DeleteAssess(long id)
        {
            var assessDetails = await _assessDetailRepo.GetAll().Where(e => e.AssessId == id).ToListAsync();
            foreach(var assessDetail in assessDetails)
            {
                await _assessDetailRepo.DeleteAsync(assessDetail);
            }

            var assess = await _assessRepo.FirstOrDefaultAsync(id);
            //await _assessRepo.DeleteAsync(assess);
            if (assess != null) await _assessRepo.DeleteAsync(assess);
        }

        // xóa tiêu chí
        public async Task DeleteAssessDetail(long id)
        {
            var assessDetail = await _assessDetailRepo.FirstOrDefaultAsync(id);
            if (assessDetail != null) await _assessDetailRepo.DeleteAsync(assessDetail);
        }

        // xóa booj tiêu chí
        public async Task DeleteAssessGroup(long id)
        {
            var assessGroup = await _assessGroupRepo.FirstOrDefaultAsync(id);
            if (assessGroup != null) await _assessGroupRepo.DeleteAsync(assessGroup);

            var assessRemoveList = await _assessRelationshipRepo.GetAll().Where(e => e.AssessGroupId == id).ToListAsync();

            foreach (var assessRemove in assessRemoveList)
            {
                 await _assessRelationshipRepo.DeleteAsync(assessRemove);
            }
        }


    }
}
