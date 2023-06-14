using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using PayPalCheckoutSdk.Orders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.BMS.BudgetPIC.Dto;
using tmss.BMS.Master.PairingSegment;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment1.Dto;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Status;
using tmss.BMS.Master.UserControl;
using tmss.Core.BMS.Master.Period;
using tmss.InvoiceModule.Dto;
using tmss.Master.BMS.Department;

namespace tmss.BMS.BudgetPIC
{
    public class BudgetTransferAppService : tmssAppServiceBase, IBudgetTransferAppService
    {
        private readonly IRepository<BmsTransferBudget, long> _bmsTransferBudgetRepository;
        private readonly IRepository<BmsBudgetTransferItem, long> _bmsBudgetTransferItemRepository;
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        private readonly IRepository<BmsBudgetPlan, long> _bmsMstPairingSegmentRepository;
        private readonly IRepository<BmsTransferAutoNo, long> _bmsTransferAutoNoRepository;
        private readonly IRepository<BmsMstStatus, long> _bmsMstStatusRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<BmsMstTransferBudgetType, long> _bmsMstTransferBudgetTypeRepository;
        private readonly IRepository<BmsTransferBudgetLog, long> _bmsTransferBudgetLogRepository;
        private readonly IRepository<BmsMstSegment3, long> _bmsMstSegment3Repository;
        private readonly IRepository<BmsMstDepartment, long> _bmsMstDepartmentRepository;
        private readonly IDapperRepository<User, long> _dapper;
        private readonly IRepository<BmsBudgetUserControl, long> _bmsBudgetUserControlRepository;
        public BudgetTransferAppService(
            IRepository<BmsTransferBudget, long> bmsTransferBudgetRepository,
            IRepository<BmsBudgetTransferItem, long> bmsBudgetTransferItemRepository,
            IRepository<BmsMstPeriod, long> mstPeriodRepository,
             IRepository<BmsBudgetPlan, long> bmsMstPairingSegmentRepository,
             IRepository<BmsTransferAutoNo, long> bmsTransferAutoNoRepository,
             IRepository<BmsMstStatus, long> bmsMstStatusRepository,
             IRepository<User, long> userRepository,
             IRepository<BmsMstTransferBudgetType, long> bmsMstTransferBudgetTypeRepository,
             IRepository<BmsTransferBudgetLog, long> bmsTransferBudgetLogRepository,
             IDapperRepository<User, long> dapper,
             IRepository<BmsMstSegment3, long> bmsMstSegment3Repository,
             IRepository<BmsMstDepartment, long> bmsMstDepartmentRepository,
             IRepository<BmsBudgetUserControl, long> bmsBudgetUserControlRepository
            )
        {
            _bmsTransferBudgetRepository = bmsTransferBudgetRepository;
            _bmsBudgetTransferItemRepository = bmsBudgetTransferItemRepository;
            _mstPeriodRepository = mstPeriodRepository;
            _bmsMstPairingSegmentRepository = bmsMstPairingSegmentRepository;
            _bmsTransferAutoNoRepository = bmsTransferAutoNoRepository;
            _userRepository = userRepository;
            _bmsMstStatusRepository = bmsMstStatusRepository;
            _bmsMstTransferBudgetTypeRepository = bmsMstTransferBudgetTypeRepository;
            _bmsTransferBudgetLogRepository = bmsTransferBudgetLogRepository;
            _dapper = dapper;
            _bmsMstSegment3Repository = bmsMstSegment3Repository;
            _bmsMstDepartmentRepository = bmsMstDepartmentRepository;
            _bmsBudgetUserControlRepository = bmsBudgetUserControlRepository;
        }

        public async Task Delete(long id)
        {
            BmsTransferBudget bmsTransferBudget = _bmsTransferBudgetRepository.Load(id);
            if (bmsTransferBudget != null)
            {
                await _bmsTransferBudgetRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<BudgetTransferDto>> getAllBudgetTransfer(SearchBudgetTransferDto input)
        {

            string _sql = @"EXEC sp_Bms_BudgetTransfer_Search
                            @PeriodId,
                            @PeriodVersionId,
                            @UserId,
                            @TabKey";
            var list = (await _dapper.QueryAsync<BudgetTransferDto>(_sql, new
            {
                @PeriodId = input.PeriodId,
                @PeriodVersionId = input.PeriodVersionId,
                UserId = AbpSession.UserId,
                @TabKey = input.TabKey,
            }));

            var result = list.Skip(input.SkipCount).Take(input.MaxResultCount);
            return new PagedResultDto<BudgetTransferDto>(
                       list.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputBudgetTransferDto> LoadById(long id)
        {
            var budgetTransferEnum = from bugetTran in _bmsTransferBudgetRepository.GetAll().AsNoTracking()
                                     join bugetPlan1 in _bmsMstPairingSegmentRepository.GetAll().AsNoTracking()
                                     on bugetTran.FromBudgetId equals bugetPlan1.Id into listBudgetPlan1
                                     from bg1 in listBudgetPlan1.DefaultIfEmpty()

                                     join budgetPlan2 in _bmsMstPairingSegmentRepository.GetAll().AsNoTracking()
                                     on bugetTran.ToBudgetId equals budgetPlan2.Id
                                     where bugetTran.Id == id
                                     select new InputBudgetTransferDto
                                     {
                                         Id = bugetTran.Id,
                                         Date = bugetTran.Date,
                                         TransferNo = bugetTran.TransferNo,
                                         FromDepId = bugetTran.FromDepId,
                                         FromPICName = bugetTran.FromPICName,
                                         FromPICNoEmail = bugetTran.FromPICNoEmail,
                                         FromBudgetId = bugetTran.FromBudgetId,
                                         BudgetName1 = bg1.ActivitiesName,
                                         BudgetName2 = budgetPlan2.ActivitiesName,
                                         FromRemaining = bugetTran.FromRemaining,
                                         ToDepId = bugetTran.ToDepId,
                                         ToPICName = bugetTran.ToPICName,
                                         ToPICNoEmail = bugetTran.ToPICNoEmail,
                                         ToPICUserId = bugetTran.ToPICUserId,
                                         ToBudgetId = bugetTran.ToBudgetId,
                                         ToRemaining = bugetTran.ToRemaining,

                                         AmountTransfer = bugetTran.AmountTransfer,
                                         Purpose = bugetTran.Purpose,
                                         Status = bugetTran.Status,
                                         Type = bugetTran.Type,
                                     };


            var budgetTransfer =  budgetTransferEnum.FirstOrDefault();
            if (budgetTransfer != null)
            {
                var fromDepartment = await _bmsMstDepartmentRepository.FirstOrDefaultAsync(budgetTransfer.FromDepId);
                if(fromDepartment != null)
                {
                    budgetTransfer.FromDepName = fromDepartment.DepartmentName;
                }

                var toDepartment = await _bmsMstDepartmentRepository.FirstOrDefaultAsync(budgetTransfer.ToDepId);
                if (toDepartment != null)
                {
                    budgetTransfer.ToDepName = toDepartment.DepartmentName;
                }

                var budgetTransferItemEnum = from item in _bmsBudgetTransferItemRepository.GetAll().AsNoTracking()
                                             where item.BudgetTransferId == budgetTransfer.Id
                                             select new BudgetTransferItemDto
                                             {
                                                 Id = item.Id,
                                                 Description = item.Description,
                                                 Amount = item.Amount,
                                                 Remarks = item.Remarks,
                                                 BudgetTransferId = item.BudgetTransferId,
                                             };
                budgetTransfer.BudgetTransferItemDtos = budgetTransferItemEnum.ToList();
            }
            return budgetTransfer;
        }

        public async Task<string> GenarateTransferNo ()
        {
            BmsTransferAutoNo bmsTransferAutoNo = new BmsTransferAutoNo();
            var transferNo = "TA-" + DateTime.Now.ToString("MMyy");
            var bmsTransfer = _bmsTransferAutoNoRepository.GetAll().OrderBy(p=> p.Id).FirstOrDefault();
            if(bmsTransfer != null )
            {
                if(bmsTransfer.CreationTime.Month == DateTime.Now.Month && bmsTransfer.CreationTime.Year == DateTime.Now.Year)
                {
                    bmsTransferAutoNo.TransferNoAuto = bmsTransfer.TransferNoAuto++;
                }
                else
                {
                    bmsTransferAutoNo.TransferNoAuto = 1;
                }
            }
            else
            {
                bmsTransferAutoNo.TransferNoAuto = 1;
            }
            await _bmsTransferAutoNoRepository.InsertAsync(bmsTransferAutoNo);
            transferNo += $"-{(bmsTransferAutoNo.TransferNoAuto).ToString("0000")}";
            return transferNo;
        }
        public async Task Save(InputBudgetTransferDto intput)
        {
            if (intput.Id == 0)
            {
                await Create(intput);
            }
            else
            {
                await Update(intput);
            }
        }

        private async Task Create(InputBudgetTransferDto intput) 
        {
            BmsTransferBudget bmsTransferBudget = new BmsTransferBudget();
            BmsBudgetTransferItem bmsBudgetTransferItem = new BmsBudgetTransferItem();
            bmsTransferBudget.Date = intput.Date;
            bmsTransferBudget.TransferNo = intput.TransferNo;
            bmsTransferBudget.FromDepId = intput.FromDepId;
            bmsTransferBudget.FromPICName = intput.FromPICName;
            bmsTransferBudget.FromPICNoEmail = intput.FromPICNoEmail;
            bmsTransferBudget.FromBudgetId = intput.FromBudgetId;
            bmsTransferBudget.FromRemaining = intput.FromRemaining;
            bmsTransferBudget.ToDepId = intput.ToDepId;
            bmsTransferBudget.ToPICName = intput.ToPICName;
            bmsTransferBudget.ToPICUserId = intput.ToPICUserId;
            bmsTransferBudget.ToPICNoEmail = intput.ToPICNoEmail;
            bmsTransferBudget.ToBudgetId = intput.ToBudgetId;
            bmsTransferBudget.ToRemaining = intput.ToRemaining;
            bmsTransferBudget.AmountTransfer = intput.AmountTransfer;
            bmsTransferBudget.Purpose = intput.Purpose;
            bmsTransferBudget.Status = intput.Status;
            bmsTransferBudget.Type = intput.Type;

            await _bmsTransferBudgetRepository.InsertAsync(bmsTransferBudget);
            await CurrentUnitOfWork.SaveChangesAsync();

            if(intput.BudgetTransferItemDtos != null)
            {
                foreach (var item in intput.BudgetTransferItemDtos)
                {
                    bmsBudgetTransferItem = new BmsBudgetTransferItem();
                    bmsBudgetTransferItem.Id = item.Id;
                    bmsBudgetTransferItem.Description = item.Description;
                    bmsBudgetTransferItem.Amount = item.Amount;
                    bmsBudgetTransferItem.Remarks = item.Remarks;
                    bmsBudgetTransferItem.BudgetTransferId = bmsTransferBudget.Id;
                    await _bmsBudgetTransferItemRepository.InsertAsync(bmsBudgetTransferItem);
                }
            }
        }


        private async Task Update(InputBudgetTransferDto intput)
        {
            //BmsMstSegment1 mstSegment1 = await _mstSegment1Repository.FirstOrDefaultAsync(p => p.Id == input.Id);
            //mstSegment1.PeriodId = input.PeriodId;
            //mstSegment1.TypeCostId = input.TypeCostId;
            //mstSegment1.Code = input.Code;
            //mstSegment1.Name = input.Name;
            //mstSegment1.Description = input.Description;
            ////mstCurExchangeRate = ObjectMapper.Map<MstCurExchangeRate>(input);
            //await _mstSegment1Repository.UpdateAsync(mstSegment1);
            //await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<UserInfoToTransferBudgetDto> getUserInfoToTransferBudget()
        {
            UserInfoToTransferBudgetDto userInfoToTransferBudgetDto = new UserInfoToTransferBudgetDto();
            var userLogin = await _userRepository.FirstOrDefaultAsync(AbpSession.UserId.Value);
            if(userLogin != null)
            {
                userInfoToTransferBudgetDto.Id = userLogin.Id;
                userInfoToTransferBudgetDto.UserName = userLogin.FullName;
                userInfoToTransferBudgetDto.UserEmail = userLogin.EmailAddress;
            }
            return userInfoToTransferBudgetDto;
        }

        public async Task<List<UserInfoToTransferBudgetDto>> getListUserInfoDtopdownToTransferBudget(long DepId)
        {
            var userEnum = from user in _userRepository.GetAll().AsNoTracking()
                           where user.HrOrgStructureId != null                      //Sau nay se update list nay theo Department Id truyem vao khi duoc moc DB
                           select new UserInfoToTransferBudgetDto
                           {
                               Id = user.Id,
                               UserEmail = user.EmailAddress,
                               UserName = user.FullName
                           };

            return userEnum.ToList();
        }

        //Approval and submit
        public async Task ApprovalAndSubmit(ApprovalTransferBudgetDto approvalTransferBudgetDto)
        {
            var budgetTransfer = await _bmsTransferBudgetRepository.FirstOrDefaultAsync(approvalTransferBudgetDto.TransferBudgetId);
            BmsTransferBudgetLog bmsTransferBudgetLog = new BmsTransferBudgetLog();
            if (budgetTransfer != null)
            {
                if(budgetTransfer.Type == 2)
                {
                    switch (budgetTransfer.Status)
                    {
                        case 1:
                            budgetTransfer.Status = 2;
                            break;

                        //Truong hop da bi tu choi
                        case 3:
                            budgetTransfer.Status = 2;
                            break;
                        case 5:
                            budgetTransfer.Status = 2;
                            break;
                        case 7:
                            budgetTransfer.Status = 2;
                            break;
                        case 9:
                            budgetTransfer.Status = 2;
                            break;

                        case 2:
                            var budgetPlan2 = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(budgetTransfer.ToBudgetId); //Chac la k null dau
                            var budgetControl2 = await _bmsBudgetUserControlRepository.FirstOrDefaultAsync(p => p.BudgetId == budgetPlan2.Segment3Id && p.UserId == AbpSession.UserId);

                            if (budgetControl2 != null)
                            {
                                budgetTransfer.Status = 6;
                            }
                            else
                            {
                                budgetTransfer.Status = 4;
                            }
                            
                            break;
                        case 4:
                            budgetTransfer.Status = 6;
                            break;
                        case 6:
                            budgetTransfer.Status = 8;
                            break;
                        case 8:
                            budgetTransfer.Status = 10;
                            await LastApproval(budgetTransfer);
                            break;
                    }
                }
                else
                {
                    switch (budgetTransfer.Status)
                    {
                        case 1:
                            budgetTransfer.Status = 2;
                            break;
                        //Truong hop da bi tu choi
                        case 5:
                            budgetTransfer.Status = 2;
                            break;
                        case 7:
                            budgetTransfer.Status = 2;
                            break;
                        case 9:
                            budgetTransfer.Status = 2;
                            break;
                        case 2:
                            budgetTransfer.Status = 6;
                            break;
                        case 6:
                            budgetTransfer.Status = 8;
                            break;
                        case 8:
                            budgetTransfer.Status = 10;
                            await LastApproval(budgetTransfer);
                            break;
                    }
                }
                
                budgetTransfer.LastModificationTime = DateTime.Now;
                budgetTransfer.LastModifierUserId = AbpSession.UserId;
                await _bmsTransferBudgetRepository.UpdateAsync(budgetTransfer);

                bmsTransferBudgetLog.BudgetTransferId = budgetTransfer.Id;
                bmsTransferBudgetLog.UserId = AbpSession.UserId.Value;
                bmsTransferBudgetLog.StatusApproval = budgetTransfer.Status;
                await _bmsTransferBudgetLogRepository.InsertAsync(bmsTransferBudgetLog);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            else
            {
                throw new NotImplementedException();
            }
        }

        //Reject
        public async Task Reject(ApprovalTransferBudgetDto approvalTransferBudgetDto)
        {
            var budgetTransfer = await _bmsTransferBudgetRepository.FirstOrDefaultAsync(approvalTransferBudgetDto.TransferBudgetId);
            BmsTransferBudgetLog bmsTransferBudgetLog = new BmsTransferBudgetLog();
            if (budgetTransfer != null)
            {
                if(budgetTransfer.Type == 2)
                {
                    switch (budgetTransfer.Status)
                    {
                        case 2:
                            budgetTransfer.Status = 3;
                            break;
                        case 4:
                            budgetTransfer.Status = 5;
                            break;
                        case 6:
                            budgetTransfer.Status = 7;
                            break;
                        case 8:
                            budgetTransfer.Status = 9;
                            break;
                    }
                }
                else
                {
                    switch (budgetTransfer.Status)
                    {
                        case 2:
                            budgetTransfer.Status = 5;
                            break;
                        case 6:
                            budgetTransfer.Status = 7;
                            break;
                        case 8:
                            budgetTransfer.Status = 9;
                            break;
                    }
                }
                
                budgetTransfer.LastModificationTime = DateTime.Now;
                budgetTransfer.LastModifierUserId = AbpSession.UserId;
                await _bmsTransferBudgetRepository.UpdateAsync(budgetTransfer);

                bmsTransferBudgetLog.BudgetTransferId = budgetTransfer.Id;
                bmsTransferBudgetLog.UserId = AbpSession.UserId.Value;
                bmsTransferBudgetLog.StatusApproval = budgetTransfer.Status;
                bmsTransferBudgetLog.ReasonReject = approvalTransferBudgetDto.ReasonReject;
                await _bmsTransferBudgetLogRepository.InsertAsync(bmsTransferBudgetLog);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            else
            {
                throw new NotImplementedException();
            }
        }

        public async Task LastApproval(BmsTransferBudget input)
        {
            if (input.Type == 2)
            {
               var bmsBudgetPlanFrom = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(input.FromBudgetId);
                bmsBudgetPlanFrom.AmountTransfer += input.AmountTransfer;
                bmsBudgetPlanFrom.TransferBudgetId += input.Id;
                await _bmsMstPairingSegmentRepository.UpdateAsync(bmsBudgetPlanFrom);

               var bmsBudgetPlanTo = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(input.ToBudgetId);
                bmsBudgetPlanTo.AmountTransfer -= input.AmountTransfer;
                bmsBudgetPlanTo.TransferBudgetId -= input.Id;
                await _bmsMstPairingSegmentRepository.UpdateAsync(bmsBudgetPlanTo);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            else
            {
                var bmsBudgetPlanTo = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(input.ToBudgetId);
                bmsBudgetPlanTo.AmountTransfer += input.AmountTransfer;
                bmsBudgetPlanTo.TransferBudgetId += input.Id;
                await _bmsMstPairingSegmentRepository.UpdateAsync(bmsBudgetPlanTo);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        public async Task<bool> IsMAFinUser()
        {
            var user = await _userRepository.FirstOrDefaultAsync(AbpSession.UserId.Value);
            if(user.IsFinanceMA == true)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public async Task<bool> IsGroupReceived(long transferBudgetId)
        {
            var transferBudget = await _bmsTransferBudgetRepository.FirstOrDefaultAsync(transferBudgetId);
            var budgetPlan2 = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(transferBudget.ToBudgetId); //Chac la k null dau
            var budgetControl2 = await _bmsBudgetUserControlRepository.FirstOrDefaultAsync(p => p.BudgetId == budgetPlan2.Segment3Id && p.UserId == AbpSession.UserId);

            if (budgetControl2 != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
      
    }
}
