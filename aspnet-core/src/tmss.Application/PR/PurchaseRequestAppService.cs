using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Users;
using tmss.Common.CommonGeneralCache;
using tmss.Common.GeneratePurchasingNumber;
using tmss.Dto;
using tmss.EntityFrameworkCore;
using tmss.GR.Enum;
using tmss.Master;
using tmss.Master.GlCode.Dto;
using tmss.Master.InventoryItems.Dto;
using tmss.PO;
using tmss.PR.PurchasingRequest;
using tmss.PR.PurchasingRequest.Dto;
using tmss.Price;
using tmss.RequestApproval;
using tmss.RequestApproval.Dto;
using tmss.Storage;
using tmss.UR.UserRequestManagement.Dto;

namespace tmss.PR
{
    [AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement, AppPermissions.PurchaseRequest_CreatePurchaseRequest, AppPermissions.PurchaseOrders_AutoCreatePurchaseOrders)]
    public class PurchaseRequestAppService : tmssAppServiceBase, IPurchaseRequestAppService
    {
        private readonly IRepository<PrRequisitionHeaders, long> _prRequisitionHeadersRepository;
        private readonly IRepository<PrRequisitionLines, long> _prPrRequisitionLinesRepository;
        private readonly IRepository<MstLineType, long> _mstLineTypeRepository;
        private readonly IRepository<MstGlCodeCombination, long> _mstGlCodeCombinationRepository;
        private readonly IRepository<PrRequisitionDistributions, long> _requisitionDistributionsRepository;
        private readonly IDapperRepository<PrRequisitionHeaders, long> _purchaseRequestRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<MstLastPurchasingSeq, long> _lastSeqRepo;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGeneratePurchasingNumberAppService;
        private readonly IRepository<PrImportPrTemp, long> _importPrRepo;
        private readonly IRepository<MstOrganizations, long> _mstOrganizationsRepo;
        private readonly IRepository<MstSupplierSites, long> _mstSupplierSitesRepo;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private readonly IRepository<MstAttachFiles, long> _attachRepo;
        private readonly IRepository<MstTitles, long> _titlesRepo;
        private readonly ICommonGeneralCacheAppService _iCommonGeneralCacheAppService;
        private readonly IRepository<MstGlExchangeRate, long> _mstGlExchangeRateRepository;
        private readonly IRepository<MstInventoryGroup, long> _mstInventoryGroupRepository;
        private readonly IRepository<MstCurrency, long> _mstCurrencyGroupRepository;
        private readonly IRequestApprovalTreeAppService _sentRequestInf;
        public PurchaseRequestAppService(
            IRepository<PrRequisitionHeaders, long> prRequisitionHeadersRepository,
            IRepository<PrRequisitionLines, long> prPrRequisitionLinesRepository,
            IDapperRepository<PrRequisitionHeaders, long> purchaseRequestRepository,
            IRepository<User, long> userRepository,
            IRepository<MstLastPurchasingSeq, long> lastSeqRepo,
            ICommonGeneratePurchasingNumberAppService commonGeneratePurchasingNumberAppService,
            IRepository<MstLineType, long> mstLineTypeRepository,
            IRepository<PrRequisitionDistributions, long> requisitionDistributionsRepository,
            IRepository<MstGlCodeCombination, long> mstGlCodeCombinationRepository,
            IRepository<PrImportPrTemp, long> importPrRepo,
            IRepository<MstOrganizations, long> mstOrganizationsRepo,
            IRepository<MstSupplierSites, long> mstSupplierSitesRepo,
            ITempFileCacheManager tempFileCacheManager,
            IRepository<MstAttachFiles, long> attachRepo,
            ICommonGeneralCacheAppService iCommonGeneralCacheAppService,
            IRepository<MstTitles, long> titlesRepo,
            IRepository<MstGlExchangeRate, long> mstGlExchangeRateRepository,
            IRepository<MstInventoryGroup, long> mstInventoryGroupRepository,
            IRepository<MstCurrency, long> mstCurrencyGroupRepository,
            IRequestApprovalTreeAppService sentRequestInf
            )
        {
            _prRequisitionHeadersRepository = prRequisitionHeadersRepository;
            _prPrRequisitionLinesRepository = prPrRequisitionLinesRepository;
            _purchaseRequestRepository = purchaseRequestRepository;
            _userRepository = userRepository;
            _lastSeqRepo = lastSeqRepo;
            _commonGeneratePurchasingNumberAppService = commonGeneratePurchasingNumberAppService;
            _mstLineTypeRepository = mstLineTypeRepository;
            _requisitionDistributionsRepository = requisitionDistributionsRepository;
            _mstGlCodeCombinationRepository = mstGlCodeCombinationRepository;
            _importPrRepo = importPrRepo;
            _mstOrganizationsRepo = mstOrganizationsRepo;
            _mstSupplierSitesRepo = mstSupplierSitesRepo;
            _tempFileCacheManager = tempFileCacheManager;
            _attachRepo = attachRepo;
            _iCommonGeneralCacheAppService = iCommonGeneralCacheAppService;
            _titlesRepo = titlesRepo;
            _mstGlExchangeRateRepository = mstGlExchangeRateRepository;
            _mstInventoryGroupRepository = mstInventoryGroupRepository;
            _mstCurrencyGroupRepository = mstCurrencyGroupRepository;
            _sentRequestInf = sentRequestInf;
        }

        [AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Search)]
        public async Task<PagedResultDto<GetPurchaseRequestDto>> getAllPurchaseRequest(SearchPurchaseRequestDto searchPaymentRequestDto)
        {
            string _sql = "EXEC sp_PrSearchPr @RequisitionNo, @Preparer, @Buyer, @FromDate, @ToDate, @InventoryGroupId, @Status, @UserId, @IsInternal, @MaxResultCount, @SkipCount";
            var listPr = await _purchaseRequestRepository.QueryAsync<GetPurchaseRequestDto>(_sql, new
            {
                @RequisitionNo = searchPaymentRequestDto.RequisitionNo,
                @Preparer = searchPaymentRequestDto.PreparerId,
                @Buyer = searchPaymentRequestDto.BuyerId,
                @FromDate = searchPaymentRequestDto.FromDate,
                @ToDate = searchPaymentRequestDto.ToDate,
                @InventoryGroupId = searchPaymentRequestDto.InventoryGroupId,
                @Status = searchPaymentRequestDto.Status,
                @UserId = AbpSession.UserId,
                @IsInternal = searchPaymentRequestDto.IsInternal,
                @MaxResultCount = searchPaymentRequestDto.MaxResultCount,
                @SkipCount = searchPaymentRequestDto.SkipCount,
            });

            int totalCount = 0;
            if (listPr != null && listPr.Count() > 0)
            {
                totalCount = (int)listPr.ToList()[0].TotalCount;
            }
            return new PagedResultDto<GetPurchaseRequestDto>(
                       totalCount,
                       listPr.ToList()
                      );
        }

        //[AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Add)]
        public async Task<long> createPurchaseRequest(InputPurchaseRequestHeaderDto inputPurchaseRequestHeaderDto)
        {
            string requistionNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.PurchasingRequest);
            if (string.IsNullOrEmpty(requistionNo))
            {
                throw new UserFriendlyException(400, L("CannotGenRequistionNo"));
            }
            User user = await _userRepository.FirstOrDefaultAsync(p => p.Id == AbpSession.UserId);
            if (user == null)
            {
                throw new UserFriendlyException(400, "CannotFindUser");
            }
            else
            {
                MstGlExchangeRate mstGlExchangeRate = _mstGlExchangeRateRepository.GetAll().Where(p => p.FromCurrency.Equals(AppConsts.CURRENCY_CODE_VND) && p.ToCurrency.Equals(AppConsts.CURRENCY_CODE_USD) && p.ConversionDate.Value.Date == inputPurchaseRequestHeaderDto.RateDate.Value.Date).FirstOrDefault();
                if (inputPurchaseRequestHeaderDto.Id <= 0)
                {

                    PrRequisitionHeaders prRequisitionHeaders = new PrRequisitionHeaders();
                    prRequisitionHeaders = ObjectMapper.Map<PrRequisitionHeaders>(inputPurchaseRequestHeaderDto);
                    prRequisitionHeaders.RequisitionNo = requistionNo;
                    prRequisitionHeaders.PicDepartmentId = (Guid)user.HrOrgStructureId;
                    prRequisitionHeaders.PreparerId = (long)AbpSession.UserId;
                    prRequisitionHeaders.AuthorizationStatus = AppConsts.STATUS_INCOMPLETE;
                    prRequisitionHeaders.TypeLookupCode = AppConsts.TYPE_LOOKUP_CODE;
                    prRequisitionHeaders.CurrencyCode = AppConsts.CURRENCY_CODE_VND;
                    prRequisitionHeaders.CurrencyRate = (mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 0;
                    prRequisitionHeaders.TotalPriceUsd = (inputPurchaseRequestHeaderDto.TotalPrice ?? 0) * ((mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 1);
                    await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prRequisitionHeaders);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    foreach (InputPurchaseRequestLineDto inputPurchaseRequestLineDto in inputPurchaseRequestHeaderDto.inputPurchaseRequestLineDtos)
                    {
                        MstLineType mstLineType = await _mstLineTypeRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseRequestLineDto.LineTypeId);
                        if (mstLineType == null)
                        {
                            throw new UserFriendlyException(400, L("NoLineType"));
                        }
                        PrRequisitionLines prRequisitionLines = new PrRequisitionLines();
                        prRequisitionLines = ObjectMapper.Map<PrRequisitionLines>(inputPurchaseRequestLineDto);
                        prRequisitionLines.PrRequisitionHeaderId = prRequisitionHeaders.Id;
                        prRequisitionLines.ItemDescription = inputPurchaseRequestLineDto.PartName;
                        prRequisitionLines.DestinationOrganizationId = inputPurchaseRequestLineDto.DestinationOrganizationId ?? inputPurchaseRequestHeaderDto.DestinationOrganizationId;
                        prRequisitionLines.DeliverToLocationId = inputPurchaseRequestLineDto.DeliverToLocationId ?? inputPurchaseRequestHeaderDto.DeliverToLocationId;
                        prRequisitionLines.MatchingBasis = AppConsts.MATCHING_BASIS;
                        prRequisitionLines.SourceTypeCode = AppConsts.SOURCE_TYPE;
                        prRequisitionLines.PurchaseBasis = mstLineType.LineTypeCode.ToUpper();
                        prRequisitionLines.OrderTypeLookupCode = (mstLineType.LineTypeCode.ToUpper().Equals(AppConsts.LINE_TYPE_GOODS)) ? AppConsts.ORDER_TYPE_LOOKUP_CODE_QUANTITY : AppConsts.ORDER_TYPE_LOOKUP_CODE_AMOUNT;
                        prRequisitionLines.LineNum = 0;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prRequisitionLines);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        await InsertOrUpdatePrRequisitionDistributions(inputPurchaseRequestLineDto, prRequisitionLines.Id, inputPurchaseRequestHeaderDto.ChargeAccount);
                    }

                    var input = new CreateRequestApprovalInputDto();
                    input.ReqId = prRequisitionHeaders.Id;
                    input.ProcessTypeCode = "PR";
                    await _sentRequestInf.CreateRequestApprovalTree(input);
                    return prRequisitionHeaders.Id;
                }
                else
                {
                    PrRequisitionHeaders prRequisitionHeaders = await _prRequisitionHeadersRepository.GetAll().FirstOrDefaultAsync(p => p.Id == inputPurchaseRequestHeaderDto.Id);

                    if(prRequisitionHeaders != null && prRequisitionHeaders.CreatorUserId != AbpSession.UserId)
                    {
                        throw new UserFriendlyException(400, L("YouDoNotEditOrDelete"));
                    }

                    List<PrRequisitionLines> listPrRequisitionLines = _prPrRequisitionLinesRepository.GetAll().Where(p => p.PrRequisitionHeaderId == prRequisitionHeaders.Id).ToList();
                    List<long> listIdLinesCannotDelete = new List<long>();
                    string status = prRequisitionHeaders.AuthorizationStatus;
                    if (prRequisitionHeaders == null)
                    {
                        throw new UserFriendlyException(400, L("NoRecordToUpdate"));
                    }
                    ObjectMapper.Map(inputPurchaseRequestHeaderDto, prRequisitionHeaders);
                    prRequisitionHeaders.CurrencyRate = (mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 0;
                    prRequisitionHeaders.TotalPriceUsd = (inputPurchaseRequestHeaderDto.TotalPrice ?? 0) * ((mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 1);
                    prRequisitionHeaders.AuthorizationStatus = status;
                    //await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prRequisitionHeaders);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    foreach (InputPurchaseRequestLineDto inputPurchaseRequestLineDto in inputPurchaseRequestHeaderDto.inputPurchaseRequestLineDtos)
                    {

                        if (inputPurchaseRequestLineDto.Id > 0)
                        {
                            PrRequisitionLines prRequisitionLines = await _prPrRequisitionLinesRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseRequestLineDto.Id);
                            if (prRequisitionLines == null)
                            {
                                throw new UserFriendlyException(400, L("NoRecordToUpdate"));
                            }

                            MstLineType mstLineType = await _mstLineTypeRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseRequestLineDto.LineTypeId);
                            if (mstLineType == null)
                            {
                                throw new UserFriendlyException(400, L("NoLineType"));
                            }
                            prRequisitionLines = ObjectMapper.Map(inputPurchaseRequestLineDto, prRequisitionLines);
                            prRequisitionLines.PrRequisitionHeaderId = prRequisitionHeaders.Id;
                            prRequisitionLines.ItemDescription = inputPurchaseRequestLineDto.PartName;
                            prRequisitionLines.MatchingBasis = AppConsts.MATCHING_BASIS;
                            prRequisitionLines.SourceTypeCode = AppConsts.SOURCE_TYPE;
                            prRequisitionLines.DestinationOrganizationId = inputPurchaseRequestLineDto.DestinationOrganizationId ?? inputPurchaseRequestHeaderDto.DestinationOrganizationId;
                            prRequisitionLines.DeliverToLocationId = inputPurchaseRequestLineDto.DeliverToLocationId ?? inputPurchaseRequestHeaderDto.DeliverToLocationId;
                            prRequisitionLines.PurchaseBasis = mstLineType.LineTypeCode.ToUpper();
                            prRequisitionLines.OrderTypeLookupCode = (mstLineType.LineTypeCode.ToUpper().Equals(AppConsts.LINE_TYPE_GOODS)) ? AppConsts.ORDER_TYPE_LOOKUP_CODE_QUANTITY : AppConsts.ORDER_TYPE_LOOKUP_CODE_AMOUNT;
                            prRequisitionLines.LineNum = 0;
                            listIdLinesCannotDelete.Add(prRequisitionLines.Id);
                            await InsertOrUpdatePrRequisitionDistributions(inputPurchaseRequestLineDto, prRequisitionLines.Id, inputPurchaseRequestHeaderDto.ChargeAccount);
                        }
                        else
                        {
                            PrRequisitionLines prRequisitionLines = new PrRequisitionLines();
                            MstLineType mstLineType = await _mstLineTypeRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseRequestLineDto.LineTypeId);
                            if (mstLineType == null)
                            {
                                throw new UserFriendlyException(400, L("NoLineType"));
                            }
                            prRequisitionLines = ObjectMapper.Map(inputPurchaseRequestLineDto, prRequisitionLines);
                            prRequisitionLines.PrRequisitionHeaderId = prRequisitionHeaders.Id;
                            prRequisitionLines.ItemDescription = inputPurchaseRequestLineDto.PartName;
                            prRequisitionLines.MatchingBasis = AppConsts.MATCHING_BASIS;
                            prRequisitionLines.SourceTypeCode = AppConsts.SOURCE_TYPE;
                            prRequisitionLines.DestinationOrganizationId = inputPurchaseRequestLineDto.DestinationOrganizationId ?? inputPurchaseRequestHeaderDto.DestinationOrganizationId;
                            prRequisitionLines.DeliverToLocationId = inputPurchaseRequestLineDto.DeliverToLocationId ?? inputPurchaseRequestHeaderDto.DeliverToLocationId;
                            prRequisitionLines.PurchaseBasis = mstLineType.LineTypeCode.ToUpper();
                            prRequisitionLines.OrderTypeLookupCode = (mstLineType.LineTypeCode.ToUpper().Equals(AppConsts.LINE_TYPE_GOODS)) ? AppConsts.ORDER_TYPE_LOOKUP_CODE_QUANTITY : AppConsts.ORDER_TYPE_LOOKUP_CODE_AMOUNT;
                            prRequisitionLines.LineNum = 0;
                            await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prRequisitionLines);
                            await CurrentUnitOfWork.SaveChangesAsync();
                            await InsertOrUpdatePrRequisitionDistributions(inputPurchaseRequestLineDto, prRequisitionLines.Id, inputPurchaseRequestHeaderDto.ChargeAccount);
                        }

                    }

                    if (listIdLinesCannotDelete.Count > 0)
                    {
                        foreach (PrRequisitionLines line in listPrRequisitionLines)
                        {
                            if (!listIdLinesCannotDelete.Any(e => e == line.Id))
                            {
                                CurrentUnitOfWork.GetDbContext<tmssDbContext>().Remove(line);
                            }
                        }
                    }

                    return prRequisitionHeaders.Id;
                }
            }
        }

        private async Task InsertOrUpdatePrRequisitionDistributions(InputPurchaseRequestLineDto inputPurchaseRequestLineDto, long lineId, string chargeAccountHeader)
        {
            if (inputPurchaseRequestLineDto.listDistributions != null)
            {
                foreach (GetPurchaseRequestDistributionsDto distributionDto in inputPurchaseRequestLineDto.listDistributions)
                {
                    //string[] arrChargeAccount = (distributionDto.ChargeAccount != null ? distributionDto.ChargeAccount : "").Split('.');
                    //string[] arrBudgetAccount = (distributionDto.BudgetAccount != null ? distributionDto.BudgetAccount : "").Split('.');
                    //string[] arrAccrualAccount = (distributionDto.AccrualAccount != null ? distributionDto.AccrualAccount : "").Split('.');
                    //string[] arrVarianceAccount = (distributionDto.VarianceAccount != null ? distributionDto.VarianceAccount : "").Split('.');

                    //if (arrChargeAccount.Length == 6 && arrBudgetAccount.Length == 6 && arrAccrualAccount.Length == 6 && arrVarianceAccount.Length == 6)
                    //{
                    MstGlCodeCombination chargeAccount = await _mstGlCodeCombinationRepository.FirstOrDefaultAsync(p => p.ConcatenatedSegments.Equals(string.IsNullOrEmpty(distributionDto.ChargeAccount) ? chargeAccountHeader : distributionDto.ChargeAccount));
                    MstGlCodeCombination budgetAccount = await _mstGlCodeCombinationRepository.FirstOrDefaultAsync(p => p.ConcatenatedSegments.Equals(distributionDto.BudgetAccount));
                    MstGlCodeCombination accrualAccount = await _mstGlCodeCombinationRepository.FirstOrDefaultAsync(p => p.ConcatenatedSegments.Equals(distributionDto.AccrualAccount));
                    MstGlCodeCombination varianceAccount = await _mstGlCodeCombinationRepository.FirstOrDefaultAsync(p => p.ConcatenatedSegments.Equals(distributionDto.VarianceAccount));
                    if (chargeAccount != null)
                    {
                        if (distributionDto.Id > 0)
                        {
                            PrRequisitionDistributions prRequisitionDistributions = await _requisitionDistributionsRepository.FirstOrDefaultAsync(p => p.Id == distributionDto.Id);

                            prRequisitionDistributions.DistributionNum = 0;
                            prRequisitionDistributions.GlEncumberedDate = distributionDto.GlDate;
                            prRequisitionDistributions.CodeCombinationId = chargeAccount.Id;
                            prRequisitionDistributions.BudgetAccountId = budgetAccount == null ? 0 : budgetAccount.Id;
                            prRequisitionDistributions.AccrualAccountId = accrualAccount == null ? 0 : accrualAccount.Id;
                            prRequisitionDistributions.VarianceAccountId = varianceAccount == null ? 0 : varianceAccount.Id;
                            prRequisitionDistributions.ReqLineQuantity = distributionDto.Quantity;
                            prRequisitionDistributions.RecoverRate = distributionDto.RecoverRate;
                            prRequisitionDistributions.TaxRecoveryOverrideFlag = distributionDto.RecoverRate != null ? AppConsts.STATUS_Y : AppConsts.STATUS_N;
                            //await _requisitionDistributionsRepository.InsertAsync(prRequisitionDistributions);
                        }
                        else
                        {

                            PrRequisitionDistributions prRequisitionDistributions = new PrRequisitionDistributions();
                            prRequisitionDistributions.PrRequisitionLineId = lineId;
                            prRequisitionDistributions.DistributionNum = 0;
                            prRequisitionDistributions.GlEncumberedDate = distributionDto.GlDate;
                            prRequisitionDistributions.CodeCombinationId = chargeAccount.Id;
                            prRequisitionDistributions.BudgetAccountId = budgetAccount == null ? 0 : budgetAccount.Id;
                            prRequisitionDistributions.AccrualAccountId = accrualAccount == null ? 0 : accrualAccount.Id;
                            prRequisitionDistributions.VarianceAccountId = varianceAccount == null ? 0 : varianceAccount.Id;
                            prRequisitionDistributions.ReqLineQuantity = distributionDto.Quantity;
                            prRequisitionDistributions.RecoverRate = distributionDto.RecoverRate;
                            prRequisitionDistributions.TaxRecoveryOverrideFlag = distributionDto.RecoverRate != null ? AppConsts.STATUS_Y : AppConsts.STATUS_N;
                            await _requisitionDistributionsRepository.InsertAsync(prRequisitionDistributions);
                        }
                    }
                    else
                    {
                        throw new UserFriendlyException(400, L("AccountNotValid"));
                    }

                }
            }
        }

        public async Task<GetPurchaseRequestForEditDto> getPurchaseRequestById(int id)
        {
            string _sqlHeader = "EXEC sp_PrGetPrHearders @PrRequisitionHeaderId";
            string _sqlLines = "EXEC sp_PrGetPRLinesByHeaders @PrRequisitionHeaderId";
            string _sqlDistributions = "EXEC sp_PrGetPRDistributionsByLine @PrRequisitionLineId";
            var listPrHeader = await _purchaseRequestRepository.QueryAsync<GetPurchaseRequestForEditDto>(_sqlHeader, new
            {
                @PrRequisitionHeaderId = id
            });
            GetPurchaseRequestForEditDto purchaseRequestForEditDto = listPrHeader.FirstOrDefault();

            var listAttchments = from att in _attachRepo.GetAll().AsNoTracking()
                                 where att.HeaderId == id && att.AttachFileType == AppConsts.PR
                                 select new GetAllPurchaseRequestAttachmentsForViewDto()
                                 {
                                     Id = att.Id,
                                     FileName = att.OriginalFileName,
                                     ServerFileName = att.ServerFileName,
                                     RootPath = att.RootPath,
                                     UploadTime = att.CreationTime
                                 };
            if (listAttchments.ToList().Count > 0)
            {
                purchaseRequestForEditDto.Attachments = listAttchments.ToList();
            }

            var listPrLines = await _purchaseRequestRepository.QueryAsync<GetPurchaseRequestLineForEditDto>(_sqlLines, new
            {
                @PrRequisitionHeaderId = id
            });
            if (listPrLines.Count() > 0)
            {
                purchaseRequestForEditDto.getPurchaseRequestLineForEditDtos = listPrLines.ToList();
                if (purchaseRequestForEditDto.ChargeAccount == null)
                {
                    purchaseRequestForEditDto.ChargeAccount = listPrLines.ToList()[0].ChargeAccount;
                }
                purchaseRequestForEditDto.DeliverToLocationId = listPrLines.ToList()[0].DeliverToLocationId;
                purchaseRequestForEditDto.DestinationOrganizationId = listPrLines.ToList()[0].DestinationOrganizationId;
                foreach (GetPurchaseRequestLineForEditDto getPurchaseRequestLineForEditDto in purchaseRequestForEditDto.getPurchaseRequestLineForEditDtos)
                {
                    var listPrDistributions = await _purchaseRequestRepository.QueryAsync<GetPurchaseRequestDistributionsDto>(_sqlDistributions, new
                    {
                        @PrRequisitionLineId = getPurchaseRequestLineForEditDto.Id
                    });
                    if (listPrDistributions.Count() > 0)
                    {
                        if (listPrDistributions.Count() == 1)
                        {
                            getPurchaseRequestLineForEditDto.DistributionsId = listPrDistributions.ToList()[0].Id;
                            getPurchaseRequestLineForEditDto.GlDate = listPrDistributions.ToList()[0].GlDate;
                            getPurchaseRequestLineForEditDto.ChargeAccount = listPrDistributions.ToList()[0].ChargeAccount;
                            getPurchaseRequestLineForEditDto.BudgetAccount = listPrDistributions.ToList()[0].BudgetAccount;
                            getPurchaseRequestLineForEditDto.VarianceAccount = listPrDistributions.ToList()[0].VarianceAccount;
                            getPurchaseRequestLineForEditDto.AccrualAccount = listPrDistributions.ToList()[0].AccrualAccount;
                        }
                        else
                        {
                            getPurchaseRequestLineForEditDto.DistributionsId = listPrDistributions.ToList()[0].Id;
                            getPurchaseRequestLineForEditDto.GlDate = listPrDistributions.ToList()[0].GlDate;
                            getPurchaseRequestLineForEditDto.ChargeAccount = listPrDistributions.ToList()[0].ChargeAccount;
                            getPurchaseRequestLineForEditDto.BudgetAccount = listPrDistributions.ToList()[0].BudgetAccount;
                            getPurchaseRequestLineForEditDto.VarianceAccount = listPrDistributions.ToList()[0].VarianceAccount;
                            getPurchaseRequestLineForEditDto.AccrualAccount = listPrDistributions.ToList()[0].AccrualAccount;
                            getPurchaseRequestLineForEditDto.listDistributions = listPrDistributions.ToList();
                        }

                    }
                }
            }
            return purchaseRequestForEditDto;

        }

        public async Task<PagedResultDto<GetRequesterDto>> getListRequester(SearchRequesterDto searchRequesterDto)
        {
            var listRequester = from requester in _userRepository.GetAll().AsNoTracking()
                                join title in _titlesRepo.GetAll().AsNoTracking() 
                                on requester.TitlesId equals title.Id
                                where (string.IsNullOrWhiteSpace(searchRequesterDto.UserName) || requester.UserName.Contains(searchRequesterDto.UserName) || requester.Name.Contains(searchRequesterDto.UserName))
                                select new GetRequesterDto()
                                {
                                    Id = requester.Id,
                                    UserName = requester.UserName,
                                    Name = requester.Name,
                                    Email = requester.EmailAddress,
                                    Title = title.Name,
                                    Tel = requester.PhoneNumber
                                };
            var result = listRequester.Skip(searchRequesterDto.SkipCount).Take(searchRequesterDto.MaxResultCount);
            return new PagedResultDto<GetRequesterDto>(
                       listRequester.Count(),
                       result.ToList()
                      );
        }

        public async Task<List<GetRequesterDto>> getAllUsers()
        {
            var listUsers = from users in _userRepository.GetAll().AsNoTracking()
                            select new GetRequesterDto()
                            {
                                Id = users.Id,
                                UserName = users.UserName,
                                Name = users.Name,
                                Email = users.EmailAddress
                            };
            return listUsers.ToList();
        }

        [AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Delete)]
        public async Task deletePurchaseRequest(int id)
        {
            PrRequisitionHeaders prRequisitionHeaders = await _prRequisitionHeadersRepository.FirstOrDefaultAsync(p => p.Id == id);
            List<PrRequisitionLines> prRequisitionLines = await _prPrRequisitionLinesRepository.GetAll().Where(p => p.PrRequisitionHeaderId == id).ToListAsync();
            if (prRequisitionHeaders == null)
            {
                throw new UserFriendlyException(400, L("NoRecordToDelete!"));
            }
            else if (!prRequisitionHeaders.AuthorizationStatus.Equals(AppConsts.STATUS_NEW))
            {
                throw new UserFriendlyException(400, L("CurrentStatusCannotDelete"));
            }
             else if (prRequisitionHeaders != null && prRequisitionHeaders.CreatorUserId != AbpSession.UserId)
            {
                throw new UserFriendlyException(400, L("YouDoNotEditOrDelete"));
            }
            else
            {
                _prRequisitionHeadersRepository.DeleteAsync(prRequisitionHeaders);
                if (prRequisitionLines != null && prRequisitionLines.Count() > 0)
                {
                    foreach (PrRequisitionLines prRequisitionLinesDelete in prRequisitionLines)
                    {
                        _prPrRequisitionLinesRepository.DeleteAsync(prRequisitionLinesDelete);
                        _requisitionDistributionsRepository.DeleteAsync(p => p.PrRequisitionLineId == prRequisitionLinesDelete.Id);
                    }

                }
            }
        }

        public async Task<bool> checkAccountDistributions(string account)
        {
            if (string.IsNullOrWhiteSpace(account))
            {
                return false;
            }
            else
            {
                //string[] arrAccount = account.Split('.');
                if (account != null)
                {
                    MstGlCodeCombination checkAccount = await _mstGlCodeCombinationRepository.FirstOrDefaultAsync(p => p.ConcatenatedSegments.Equals(account));
                    if (checkAccount != null)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            }

        }

        [AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Add, AppPermissions.PurchaseRequest_CreatePurchaseRequest_Add)]
        public async Task<List<GetListPrNumberDto>> createPrFromUr(List<GetAllUserRequestForPrDto> getAllUserRequestForPrDtos)
        {
            List<GetListPrNumberDto> getListPrNumberDtos = new List<GetListPrNumberDto>();
            var groupToRequests = getAllUserRequestForPrDtos.GroupBy(e => new { e.InventoryGroupId, e.VendorId, e.CurrencyId, e.DocumentDate, e.RequesterId }).Select(e => e).ToList();
            if (groupToRequests.Count() > 0)
            {
                foreach(var getAllUserRequestForPr in groupToRequests)
                {
                    List<GetAllUserRequestForPrDto> listLines = getAllUserRequestForPr.Where(e => e.InventoryGroupId == getAllUserRequestForPr.Key.InventoryGroupId && e.VendorId == getAllUserRequestForPr.Key.VendorId && e.CurrencyId == getAllUserRequestForPr.Key.CurrencyId).ToList();
                    InputPurchaseRequestHeaderDto inputPurchaseRequestHeaderDto = new InputPurchaseRequestHeaderDto();
                    inputPurchaseRequestHeaderDto.InventoryGroupId = getAllUserRequestForPr.Key.InventoryGroupId;
                    inputPurchaseRequestHeaderDto.PrepareId = AbpSession.UserId;
                    inputPurchaseRequestHeaderDto.ChargeAccount = listLines[0].BudgetCode;
                    inputPurchaseRequestHeaderDto.PurchasePurposeId = listLines[0].PurchasePurposeId;
                    inputPurchaseRequestHeaderDto.OriginalCurrencyCode = AppConsts.CURRENCY_CODE_VND;
                    inputPurchaseRequestHeaderDto.RateDate = DateTime.Now;
                    inputPurchaseRequestHeaderDto.inputPurchaseRequestLineDtos = await setupLinesForCreatePrFromUr(getAllUserRequestForPrDtos);
                    inputPurchaseRequestHeaderDto.TotalPrice = inputPurchaseRequestHeaderDto.inputPurchaseRequestLineDtos != null ? inputPurchaseRequestHeaderDto.inputPurchaseRequestLineDtos.Sum(e => ((decimal)e.Quantity * e.UnitPrice)) : 0;
                    long id = await createPurchaseRequest(inputPurchaseRequestHeaderDto);
                    PrRequisitionHeaders prRequisitionHeaders = _prRequisitionHeadersRepository.FirstOrDefault(p => p.Id == id);
                    getListPrNumberDtos.Add(new GetListPrNumberDto()
                    {
                        Id = id,
                        PrNumber = prRequisitionHeaders.RequisitionNo
                    });
                }
            }

            return getListPrNumberDtos;
        }

        private async Task<List<InputPurchaseRequestLineDto>> setupLinesForCreatePrFromUr(List<GetAllUserRequestForPrDto> getAllUserRequestForPrDtos)
        {
            List<InputPurchaseRequestLineDto> inputPurchaseRequestLineDtos = new List<InputPurchaseRequestLineDto>();
            foreach(GetAllUserRequestForPrDto getAllUserRequestForPrDto in getAllUserRequestForPrDtos)
            {
                List<GetPurchaseRequestDistributionsDto> listDistributions = new List<GetPurchaseRequestDistributionsDto>();
                listDistributions.Add(new GetPurchaseRequestDistributionsDto()
                {
                    Id = 0,
                    ChargeAccount = getAllUserRequestForPrDto.BudgetCode,
                    GlDate = DateTime.Now,
                    Quantity = (int?)getAllUserRequestForPrDto.Quantity
                });
                MstInventoryGroup mstInventoryGroup = _mstInventoryGroupRepository.FirstOrDefault(p => p.Id == getAllUserRequestForPrDto.InventoryGroupId);
                if (mstInventoryGroup == null)
                {
                    throw new UserFriendlyException(400, L("InventoryGrouEmpty"));
                }
                InputPurchaseRequestLineDto inputPurchaseRequestLineDto = new InputPurchaseRequestLineDto();
                inputPurchaseRequestLineDto = ObjectMapper.Map<InputPurchaseRequestLineDto>(getAllUserRequestForPrDto);
                inputPurchaseRequestLineDto.Id = 0;
                inputPurchaseRequestLineDto.listDistributions = listDistributions;
                inputPurchaseRequestLineDto.ToPersonId = getAllUserRequestForPrDto.RequesterId;
                inputPurchaseRequestLineDto.UnitMeasLookupCode = getAllUserRequestForPrDto.Uom;
                inputPurchaseRequestLineDto.LineTypeId = getAllUserRequestForPrDto.LineTypeId ?? 1;
                inputPurchaseRequestLineDto.UrLineId = getAllUserRequestForPrDto.Id;
                inputPurchaseRequestLineDto.ForeignPrice = getAllUserRequestForPrDto.UnitPrice;
                inputPurchaseRequestLineDto.UnitPrice = getAllUserRequestForPrDto.ExchangeUnitPrice;
                inputPurchaseRequestLineDto.DestinationOrganizationId = 81;
                inputPurchaseRequestLineDto.DestinationTypeCode = mstInventoryGroup.IsInventory == true ? "INVENTORY" : "EXPENSE";
                inputPurchaseRequestLineDtos.Add(inputPurchaseRequestLineDto);
            }
            return inputPurchaseRequestLineDtos;
        }

        [AbpAuthorize(AppPermissions.PurchaseOrders_AutoCreatePurchaseOrders_Search)]
        public async Task<PagedResultDto<GetPurchaseRequestForCreatePODto>> getAllPurchaseRequestForCreatePO(InputSearchAutoCreatePo inputSearchAutoCreatePo)
        {
            string _sql = "EXEC sp_PrSearchPrForAutoCreatePO @RequisitionNo, @PreparerId, @BuyerId, @SupplierId, @SupplierSiteId, @InventoryGroupId, @FromDate, @ToDate, @MaxResultCount, @SkipCount";
            var listPr = await _purchaseRequestRepository.QueryAsync<GetPurchaseRequestForCreatePODto>(_sql, new
            {
                @RequisitionNo = inputSearchAutoCreatePo.RequisitionNo,
                @PreparerId = inputSearchAutoCreatePo.PreparerId,
                @BuyerId = inputSearchAutoCreatePo.BuyerId,
                @SupplierId = inputSearchAutoCreatePo.SupplierId,
                @InventoryGroupId = inputSearchAutoCreatePo.InventoryGroupId,
                @SupplierSiteId = inputSearchAutoCreatePo.SupplierSiteId,
                @FromDate = inputSearchAutoCreatePo.FromDate,
                @ToDate = inputSearchAutoCreatePo.ToDate,
                @MaxResultCount = inputSearchAutoCreatePo.MaxResultCount,
                @SkipCount = inputSearchAutoCreatePo.SkipCount,
            });

            int totalCount = 0;
            if (listPr != null && listPr.Count() > 0)
            {
                totalCount = (int)listPr.ToList()[0].TotalCount;
            }
            return new PagedResultDto<GetPurchaseRequestForCreatePODto>(
                       totalCount,
                       listPr.ToList()
                      );
        }

        public async Task<List<GetPrDistributionsForCreatePoDto>> getPrDistributionsForCreatePO(long prHeaderId)
        {
            string _sql = "EXEC sp_PrGetDistributionsAutoCreatePo @PrRequisitionLineId";

            var listDistributions = await _purchaseRequestRepository.QueryAsync<GetPrDistributionsForCreatePoDto>(_sql, new
            {
                @PrRequisitionLineId = prHeaderId
            });

            return listDistributions.ToList();
        }

        [AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Import)]
        public async Task<int> SaveDataFromImportExcel()
        {
            int countPr = 0;
            double conversionRateUsd = 1;
            User user = await _userRepository.FirstOrDefaultAsync(p => p.Id == AbpSession.UserId);
            if (user == null)
            {
                throw new UserFriendlyException(400, "CannotUser");
            }
            List<PrImportPrTemp> prImportPrTemps = await _importPrRepo.GetAll().AsNoTracking().ToListAsync();
            if (prImportPrTemps != null && prImportPrTemps.Count() > 0)
            {
                GetMstInventoryItemsDto getMstInventoryItemsDto = new GetMstInventoryItemsDto();

                string _sql = "select * from V_GetListItemsForImportPr where CreatorUserId = @CreatorUserId";

                var listInvItems = await _purchaseRequestRepository.QueryAsync<GetListItemsForImportPrDto>(_sql, new
                {
                    @CreatorUserId = AbpSession.UserId,
                });

                if (listInvItems.ToList().Count == 0)
                {
                    throw new UserFriendlyException(400, L("CannotItemsImport"));
                }
                var groupToRequests = listInvItems.GroupBy(e => new { e.InventoryGroupId, e.CurrencyId, e.Comments }).Select(e => e).ToList();
                GetListItemsForImportPrDto getListItemsForImportPr = listInvItems.ToList()[0];
                MstGlExchangeRate mstGlExchangeRateUsd = _mstGlExchangeRateRepository.GetAll().Where(p => p.FromCurrency.Equals(AppConsts.CURRENCY_CODE_VND) && p.ToCurrency.Equals(AppConsts.CURRENCY_CODE_USD) && p.ConversionDate.Value.Date == DateTime.Now.Date).FirstOrDefault();
                if(mstGlExchangeRateUsd != null)
                {
                    conversionRateUsd = (double)mstGlExchangeRateUsd.ConversionRate;
                }
                SearchGlCodeOutputDto searchGlCodeOutputDto = await _iCommonGeneralCacheAppService.getGlCombaination();

                foreach (var item in groupToRequests)
                {
                    double conversionRateVnd = 1;
                    string requistionNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.PurchasingRequest);
                    if (string.IsNullOrEmpty(requistionNo))
                    {
                        throw new UserFriendlyException(400, L("CannotGenRequistionNo"));
                    }
                    PrRequisitionHeaders prRequisitionHeaders = new PrRequisitionHeaders();
                    MstCurrency mstCurrency = _mstCurrencyGroupRepository.FirstOrDefault(p => p.Id == item.Key.CurrencyId);
                    List<GetListItemsForImportPrDto> listLines = listInvItems.Where(p => p.InventoryGroupId == item.Key.InventoryGroupId && p.CurrencyId == item.Key.CurrencyId).ToList();
                    //prRequisitionHeaders = ObjectMapper.Map<PrRequisitionHeaders>(inputPurchaseRequestHeaderDto);
                    MstGlExchangeRate mstGlExchangeRateVnd = _mstGlExchangeRateRepository.GetAll().Where(p => p.FromCurrency.Equals(mstCurrency.CurrencyCode) && p.ToCurrency.Equals(AppConsts.CURRENCY_CODE_VND) && p.ConversionDate.Value.Date == DateTime.Now.Date).FirstOrDefault();

                    if (mstGlExchangeRateVnd != null)
                    {
                        conversionRateVnd = (double)mstGlExchangeRateVnd.ConversionRate;
                    }
                    prRequisitionHeaders.RequisitionNo = requistionNo;
                    prRequisitionHeaders.PicDepartmentId = (Guid)user.HrOrgStructureId;
                    prRequisitionHeaders.PreparerId = (long)AbpSession.UserId;
                    prRequisitionHeaders.AuthorizationStatus = AppConsts.STATUS_INCOMPLETE;
                    prRequisitionHeaders.TypeLookupCode = AppConsts.TYPE_LOOKUP_CODE;
                    prRequisitionHeaders.InventoryGroupId = item.Key.InventoryGroupId;
                    prRequisitionHeaders.CurrencyCode = AppConsts.CURRENCY_CODE_VND;
                    prRequisitionHeaders.Description = item.Key.Comments;
                    prRequisitionHeaders.RateDate = DateTime.Now;
                    prRequisitionHeaders.ChargeAccount = listLines[0].BudgetCode;
                    prRequisitionHeaders.TotalPrice = listLines != null ? listLines.Sum(e => ((decimal)e.Quanity * e.UnitPrice * (decimal)conversionRateVnd)) : 0;
                    prRequisitionHeaders.TotalPriceUsd = (prRequisitionHeaders.TotalPrice * (decimal)conversionRateUsd);
                    await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prRequisitionHeaders);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    var input = new CreateRequestApprovalInputDto();
                    input.ReqId = prRequisitionHeaders.Id;
                    input.ProcessTypeCode = "PR";
                    await _sentRequestInf.CreateRequestApprovalTree(input);

                    for (int i = 0; i < listLines.Count(); i++)
                    {
                        GetListItemsForImportPrDto getListItemsForImportPrDto = listLines[i];
                        PrRequisitionLines prRequisitionLines = new PrRequisitionLines();
                        prRequisitionLines = ObjectMapper.Map<PrRequisitionLines>(getListItemsForImportPrDto);
                        prRequisitionLines.Id = 0;
                        prRequisitionLines.LineTypeId = 1;
                        prRequisitionLines.UnitPrice = getListItemsForImportPrDto.UnitPrice * (decimal)conversionRateVnd;
                        prRequisitionLines.ForeignPrice = getListItemsForImportPrDto.UnitPrice;
                        prRequisitionLines.ToPersonId = AbpSession.UserId;
                        prRequisitionLines.ItemId = getListItemsForImportPrDto.ItemId;
                        prRequisitionLines.PrRequisitionHeaderId = prRequisitionHeaders.Id;
                        prRequisitionLines.NeedByDate = DateTime.Parse(getListItemsForImportPrDto.NeedBy);
                        prRequisitionLines.Quantity = getListItemsForImportPrDto.Quanity;
                        prRequisitionLines.DestinationTypeCode = getListItemsForImportPrDto.DestinationTypeCode;
                        prRequisitionLines.MatchingBasis = AppConsts.MATCHING_BASIS;
                        prRequisitionLines.SourceTypeCode = AppConsts.SOURCE_TYPE;
                        prRequisitionLines.PurchaseBasis = AppConsts.LINE_TYPE_GOODS;
                        prRequisitionLines.OrderTypeLookupCode = AppConsts.ORDER_TYPE_LOOKUP_CODE_QUANTITY;
                        prRequisitionLines.DeliverToLocationId = getListItemsForImportPrDto.DeliverToLocationId;
                        prRequisitionLines.LineNum = (i + 1);
                        prRequisitionLines.Attribute9 = getListItemsForImportPrDto.MonthN;
                        prRequisitionLines.Attribute12 = getListItemsForImportPrDto.MonthN1;
                        prRequisitionLines.Attribute14 = getListItemsForImportPrDto.MonthN2;
                        prRequisitionLines.Attribute15 = getListItemsForImportPrDto.MonthN3;
                        prRequisitionLines.UnitMeasLookupCode = getListItemsForImportPrDto.UnitMeasLookupCode;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prRequisitionLines);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        PrRequisitionDistributions prRequisitionDistributions = new PrRequisitionDistributions();
                        prRequisitionDistributions.PrRequisitionLineId = prRequisitionLines.Id;
                        prRequisitionDistributions.CodeCombinationId = getListItemsForImportPrDto.CodeCombinationId;
                        prRequisitionDistributions.GlEncumberedDate = DateTime.Now;
                        prRequisitionDistributions.DistributionNum = 1;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prRequisitionDistributions);
                    }
                    countPr++;
                }
            }

            //await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddRangeAsync();
            return countPr;
        }

        [AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Export)]
        public async Task<FileDto> ExportTemplate()
        {
            try
            {
                string fileName = "CPS_Template_Import_PR.xlsx";

                // Set License
                var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
                SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

                // Path to File Template
                string template = "wwwroot/Excel_Template";
                string path = "";
                path = Path.Combine(Directory.GetCurrentDirectory(), template, fileName);

                var workBook = ExcelFile.Load(path);
                var workSheet = workBook.Worksheets[0];

                MemoryStream stream = new MemoryStream();
                var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
                workBook.Save(tempFile);

                stream = new MemoryStream(File.ReadAllBytes(tempFile));
                _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
                File.Delete(tempFile);
                stream.Position = 0;

                return await Task.FromResult(file);
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(00, L(ex.ToString()));
            }
        }

        [AbpAuthorize(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Export)]
        public async Task<FileDto> exportPr(SearchPurchaseRequestDto searchPurchaseRequestDto)
        {
            string fileName = "";

            fileName = "Purchase_request_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".xlsx";

            IEnumerable<GetAllPrForExportDto> rawData;
            List<GetAllPrForExportDto> datas = new List<GetAllPrForExportDto>();

            rawData = await _purchaseRequestRepository.QueryAsync<GetAllPrForExportDto>("EXEC sp_PrGetDataForExport @RequisitionNo, @BuyerId, @FromDate, @ToDate, @InventoryGroupId, @Status, @UserId", new
            {
                searchPurchaseRequestDto.RequisitionNo,
                searchPurchaseRequestDto.BuyerId,
                searchPurchaseRequestDto.InventoryGroupId,
                searchPurchaseRequestDto.Status,
                searchPurchaseRequestDto.FromDate,
                searchPurchaseRequestDto.ToDate,
                AbpSession.UserId
            });

            datas = rawData.ToList();

            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_Export_PR.xlsx");

            var workBook = ExcelFile.Load(path);
            var workSheet = workBook.Worksheets[0];


            int startRow = 1;
            int endRow = datas.Count;

            if (endRow > 0)
            {
                workSheet.Cells.GetSubrange($"A1:N{endRow + 1}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                for (int i = 0; i < endRow; i++)
                {
                    /* STT */
                    workSheet.Cells[startRow + i, 0].Value = i + 1;

                    /* Requisition No. */
                    workSheet.Cells[startRow + i, 1].Value = datas[i].RequisitionNo ?? "";

                    /* Requisition Name */
                    workSheet.Cells[startRow + i, 2].Value = datas[i].PartNo ?? "";

                    /* Product Group Name */
                    workSheet.Cells[startRow + i, 3].Value = datas[i].PartName ?? "";

                    /* Requester Name */
                    workSheet.Cells[startRow + i, 4].Value = datas[i].ProductGroupName ?? "";

                    /* Request Date */
                    workSheet.Cells[startRow + i, 5].Value = datas[i].UnitMeasLookupCode ?? null;

                    /* Department */
                    workSheet.Cells[startRow + i, 6].Value = datas[i].Quantity ?? 0;

                    /* Total Price */
                    workSheet.Cells[startRow + i, 7].Value = datas[i].UnitPrice ?? 0;

                    /* Currency */
                    workSheet.Cells[startRow + i, 8].Value = datas[i].NeedByDate ?? null;

                    /* Status */
                    workSheet.Cells[startRow + i, 9].Value = datas[i].RateDate ?? null;

                    /* Budget Code */
                    workSheet.Cells[startRow + i, 10].Value = datas[i].Amount ?? 0;

                    /* Vendor Name */
                    workSheet.Cells[startRow + i, 11].Value = datas[i].RequesterName ?? "";

                    workSheet.Cells[startRow + i, 12].Value = datas[i].SuggestedVendorName ?? "";

                    /* Note */
                    workSheet.Cells[startRow + i, 13].Value = datas[i].ChargeAccount ?? "";
                }
            }

            MemoryStream stream = new MemoryStream();
            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            workBook.Save(tempFile);

            stream = new MemoryStream(File.ReadAllBytes(tempFile));
            _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
            File.Delete(tempFile);
            stream.Position = 0;

            return await Task.FromResult(file);
        }

        public async Task updateInventoryGroup(List<GetPurchaseRequestForCreatePODto> getPurchaseRequestForCreatePODtos, long inventoryGroupId)
        {
            var groupToRequests = getPurchaseRequestForCreatePODtos.GroupBy(e => new { e.PrRequisitionHeaderId }).Select(e => e).ToList();
            if (groupToRequests.Count() > 0)
            {
                foreach (var item in groupToRequests)
                {
                    await _prRequisitionHeadersRepository.GetAll().Where(e => e.Id == item.Key.PrRequisitionHeaderId).UpdateFromQueryAsync(e => new PrRequisitionHeaders { InventoryGroupId = inventoryGroupId });
                }
            } else
            {
                throw new UserFriendlyException(400, L("CannotItemToUpdate"));
            }
        }
    }
}
