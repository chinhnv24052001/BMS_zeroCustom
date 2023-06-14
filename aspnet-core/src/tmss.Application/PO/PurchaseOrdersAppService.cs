using Abp;
using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.ObjectMapping;
using Abp.UI;
using AutoMapper;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using Microsoft.Office.Interop.Excel;
using MimeKit;
using PayPalCheckoutSdk.Orders;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Users;
using tmss.Common;
using tmss.Common.CommonGeneralCache;
using tmss.Common.GeneratePurchasingNumber;
using tmss.Dto;
using tmss.EntityFrameworkCore;
using tmss.GR.Enum;
using tmss.Master;
using tmss.Master.Currency;
using tmss.Master.GlCode.Dto;
using tmss.Master.InventoryGroup;
using tmss.PO.PurchaseOrders;
using tmss.PO.PurchaseOrders.Dto;
using tmss.PR;
using tmss.PR.PurchasingRequest;
using tmss.PR.PurchasingRequest.Dto;
using tmss.Price;
using tmss.Price.Dto;
using tmss.RequestApproval;
using tmss.RequestApproval.Dto;
using tmss.Storage;
using tmss.UR.UserRequestManagement.Dto;
using static tmss.Configuration.AppSettings.UiManagement;

namespace tmss.PO
{
    public class PurchaseOrdersAppService : tmssAppServiceBase, IPurchaseOrdersAppService
    {

        private readonly IRepository<PoHeaders, long> _poHeadersRepository;
        private readonly IRepository<PoLines, long> _poLinesRepository;
        private readonly IRepository<PoLineShipments, long> _poLineShipmentsRepository;
        private readonly IRepository<PoDistributions, long> _poDistributionsRepository;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGeneratePurchasingNumberAppService;
        private readonly IRepository<MstLineType, long> _mstLineTypeRepository;
        private readonly IRepository<MstGlCodeCombination, long> _mstGlCodeCombinationRepository;
        private readonly IDapperRepository<PoHeaders, long> _spRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private readonly IRepository<MstAttachFiles, long> _attachRepo;
        private readonly IPurchaseRequestAppService _iPurchaseRequestAppService;
        private readonly ICommonGeneralCacheAppService _iCommonGeneralCacheAppService;
        private readonly IRepository<MstGlExchangeRate, long> _mstGlExchangeRateRepository;
        private readonly IRepository<MstInventoryGroup, long> _mstInventoryGroupRepository;
        private readonly IRepository<MstSuppliers, long> _mstSuppliersRepository;
        private readonly IRepository<MstCurrency, long> _mstCurrency;
        private readonly IRequestApprovalTreeAppService _sentRequestInf;
        public PurchaseOrdersAppService(
            IRepository<MstLineType, long> mstLineTypeRepository,
            IRepository<PoLines, long> poLinesRepository,
            IRepository<User, long> userRepository,
            IRepository<PoLineShipments, long> poLineShipmentsRepository,
            ICommonGeneratePurchasingNumberAppService commonGeneratePurchasingNumberAppService,
            IRepository<PoDistributions, long> poDistributionsRepository,
            IRepository<PoHeaders, long> poHeadersRepository,
            IRepository<MstGlCodeCombination, long> mstGlCodeCombinationRepository,
            IDapperRepository<PoHeaders, long> spRepository,
            ITempFileCacheManager tempFileCacheManager,
            IRepository<MstAttachFiles, long> attachRepo,
            IRepository<MstCurrency, long> mstCurrency,
            IPurchaseRequestAppService iPurchaseRequestAppService,
            ICommonGeneralCacheAppService iCommonGeneralCacheAppService,
            IRepository<MstGlExchangeRate, long> mstGlExchangeRateRepository,
            IRepository<MstInventoryGroup, long> mstInventoryGroupRepository,
            IRepository<MstSuppliers, long> mstSuppliersRepository,
            IRequestApprovalTreeAppService sentRequestInf

        )
        {
            _mstLineTypeRepository = mstLineTypeRepository;
            _poLinesRepository = poLinesRepository;
            _poLineShipmentsRepository = poLineShipmentsRepository;
            _poDistributionsRepository = poDistributionsRepository;
            _commonGeneratePurchasingNumberAppService = commonGeneratePurchasingNumberAppService;
            _poHeadersRepository = poHeadersRepository;
            _mstGlCodeCombinationRepository = mstGlCodeCombinationRepository;
            _spRepository = spRepository;
            _userRepository = userRepository;
            _tempFileCacheManager = tempFileCacheManager;
            _attachRepo = attachRepo;
            _iPurchaseRequestAppService = iPurchaseRequestAppService;
            _iCommonGeneralCacheAppService = iCommonGeneralCacheAppService;
            _mstCurrency = mstCurrency;
            _mstGlExchangeRateRepository = mstGlExchangeRateRepository;
            _mstInventoryGroupRepository = mstInventoryGroupRepository;
            _sentRequestInf = sentRequestInf;
            _mstSuppliersRepository = mstSuppliersRepository;
        }

        //[AbpAuthorize(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Add)]
        public async Task<long> createPurchaseOrders(InputPurchaseOrdersHeadersDto inputPurchaseOrdersHeadersDto)
        {
            string poNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.PurchasingOrder);
            if (poNo == null)
            {
                throw new UserFriendlyException(400, L("CannotGenPoNo"));
            }
            else
            {
                User user = await _userRepository.FirstOrDefaultAsync(p => p.Id == AbpSession.UserId);
                if (user == null)
                {
                    throw new UserFriendlyException(400, "CannotUser");
                }
                else
                {

                    MstGlExchangeRate mstGlExchangeRate = _mstGlExchangeRateRepository.GetAll().Where(p => p.FromCurrency.Equals(AppConsts.CURRENCY_CODE_VND) && p.ToCurrency.Equals(AppConsts.CURRENCY_CODE_USD) && p.ConversionDate.Value.Date == inputPurchaseOrdersHeadersDto.RateDate.Value.Date).FirstOrDefault();
                    if (inputPurchaseOrdersHeadersDto.Id <= 0)
                    {
                        PoHeaders poHeaders = new PoHeaders();
                        poHeaders = ObjectMapper.Map<PoHeaders>(inputPurchaseOrdersHeadersDto);
                        poHeaders.Segment1 = poNo;
                        poHeaders.PicDepartmentId = (Guid)user.HrOrgStructureId;
                        poHeaders.AgentId = inputPurchaseOrdersHeadersDto.BuyerId ?? AbpSession.UserId;
                        poHeaders.AuthorizationStatus = AppConsts.STATUS_INCOMPLETE;
                        poHeaders.OrgId = AppConsts.DEFAULT_ORG_ID;
                        poHeaders.Attribute10 = inputPurchaseOrdersHeadersDto.Attribute10?.ToString("dd-MMM-yy");
                        poHeaders.Comments = inputPurchaseOrdersHeadersDto.Description;
                        poHeaders.CurrencyRate = (mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 0;
                        poHeaders.TotalPriceUsd = (inputPurchaseOrdersHeadersDto.TotalPrice ?? 0) * ((mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 1);
                        //poHeaders.TypeLookupCode = AppConsts.TYPE_LOOKUP_CODE_PO;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(poHeaders);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        if (!AppConsts.TYPE_LOOKUP_CODE_CONTRACT.Equals(poHeaders.TypeLookupCode))
                        {
                            await InsertOrUpdatePoLines(inputPurchaseOrdersHeadersDto, poHeaders.Id, inputPurchaseOrdersHeadersDto.ChargeAccount);
                        }

                        var input = new CreateRequestApprovalInputDto();
                        input.ReqId = poHeaders.Id;
                        input.ProcessTypeCode = "PO";
                        await _sentRequestInf.CreateRequestApprovalTree(input);

                        return poHeaders.Id;
                    }
                    else
                    {
                        PoHeaders poHeaders = await _poHeadersRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseOrdersHeadersDto.Id);

                        if (poHeaders != null && poHeaders.CreatorUserId != AbpSession.UserId)
                        {
                            throw new UserFriendlyException(400, L("YouDoNotEditOrDelete"));
                        }

                        string status = poHeaders.AuthorizationStatus;
                        ObjectMapper.Map(inputPurchaseOrdersHeadersDto, poHeaders);
                        //poHeaders = ObjectMapper.Map<PoHeaders>(inputPurchaseOrdersHeadersDto);
                        //poHeaders.Segment1 = poNo;
                        //poHeaders. = (long)AbpSession.UserId;
                        poHeaders.AuthorizationStatus = status;
                        poHeaders.Comments = inputPurchaseOrdersHeadersDto.Description;
                        poHeaders.Attribute10 = inputPurchaseOrdersHeadersDto.Attribute10?.ToString("dd-MMM-yy");
                        poHeaders.CurrencyRate = (mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 0;
                        poHeaders.TotalPriceUsd = (inputPurchaseOrdersHeadersDto.TotalPrice ?? 0) * ((mstGlExchangeRate != null) ? (decimal?)mstGlExchangeRate.ConversionRate : 1);
                        if (!AppConsts.TYPE_LOOKUP_CODE_CONTRACT.Equals(poHeaders.TypeLookupCode))
                        {
                            await InsertOrUpdatePoLines(inputPurchaseOrdersHeadersDto, poHeaders.Id, inputPurchaseOrdersHeadersDto.ChargeAccount);
                        }
                        return poHeaders.Id;
                    }
                }
            }
        }

        private async Task InsertOrUpdatePoRequisitionDistributions(InputPurchaseOrdersShipmentsDto inputPurchaseOrdersShipmentsDto, long headerId, long lineId, long shipmentId, string chargeAccountHeader)
        {
            if (inputPurchaseOrdersShipmentsDto.listDistributions != null && inputPurchaseOrdersShipmentsDto.listDistributions.Count() > 0)
            {
                foreach (InputPurchaseOrdersDistributionsDto distributionDto in inputPurchaseOrdersShipmentsDto.listDistributions)
                {
                    string[] arrChargeAccount = (distributionDto.PoChargeAccount != null ? distributionDto.PoChargeAccount : "").Split('.');
                    string[] arrDesAccount = (distributionDto.DestinationChargeAccount != null ? distributionDto.DestinationChargeAccount : "").Split('.');
                    MstGlCodeCombination chargeAccount = await _mstGlCodeCombinationRepository.FirstOrDefaultAsync(p => p.ConcatenatedSegments.Equals(string.IsNullOrEmpty(distributionDto.PoChargeAccount) ? chargeAccountHeader : distributionDto.PoChargeAccount));
                    if (distributionDto.Id > 0)
                    {
                        PoDistributions poDistributions = await _poDistributionsRepository.FirstOrDefaultAsync(p => p.Id == distributionDto.Id);
                        //poDistributions = ObjectMapper.Map<PoDistributions>(distributionDto);
                        ObjectMapper.Map(distributionDto, poDistributions);
                        //poDistributions.DistributionNum = 0;
                        poDistributions.CodeCombinationId = chargeAccount.Id;
                        poDistributions.PoHeaderId = headerId;
                        poDistributions.PoLineId = lineId;
                        poDistributions.PoLineShipmentId = shipmentId;
                        poDistributions.SetOfBooksId = 21;
                        poDistributions.OrgId = AppConsts.DEFAULT_ORG_ID;
                        poDistributions.DistributionType = AppConsts.TYPE_LOOKUP_CODE_PO;
                        poDistributions.GlEncumberedDate = distributionDto.GlDate;
                        poDistributions.DestinationContext = distributionDto.DestinationTypeCode;
                        poDistributions.PrRequisitionDistributionId = distributionDto.PrRequisitionDistributionId;
                    }
                    else
                    {

                        PoDistributions poDistributions = new PoDistributions();
                        poDistributions = ObjectMapper.Map<PoDistributions>(distributionDto);
                        //poDistributions.DistributionNum = 0;
                        poDistributions.CodeCombinationId = chargeAccount.Id;
                        poDistributions.PoHeaderId = headerId;
                        poDistributions.PoLineId = lineId;
                        poDistributions.PoLineShipmentId = shipmentId;
                        poDistributions.SetOfBooksId = 21;
                        poDistributions.OrgId = AppConsts.DEFAULT_ORG_ID;
                        poDistributions.DistributionType = AppConsts.TYPE_LOOKUP_CODE_PO;
                        poDistributions.DestinationContext = distributionDto.DestinationTypeCode;
                        poDistributions.GlEncumberedDate = distributionDto.GlDate;
                        poDistributions.PrRequisitionDistributionId = distributionDto.PrRequisitionDistributionId;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(poDistributions);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }

                }
            }
            else
            {
                throw new UserFriendlyException(400, L("ListDistribuitionsEmpty"));
            }
        }

        private async Task InsertOrUpdatePoLines(InputPurchaseOrdersHeadersDto inputPurchaseOrdersHeadersDto, long headerId, string chargeAccountHeader)
        {
            if (inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos != null && inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos.Count > 0)
            {
                List<PoLines> listPoLines = _poLinesRepository.GetAll().Where(p => p.PoHeaderId == headerId).ToList();
                List<long> listIdLinesCannotDelete = new List<long>();
                foreach (InputPurchaseOrderLinesDto inputPurchaseOrderLinesDto in inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos)
                {
                    MstLineType mstLineType = await _mstLineTypeRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseOrderLinesDto.LineTypeId);
                    if (mstLineType == null)
                    {
                        throw new UserFriendlyException(400, L("NoLineType"));
                    }
                    if (inputPurchaseOrderLinesDto.Id <= 0)
                    {
                        PoLines poLines = new PoLines();
                        poLines = ObjectMapper.Map<PoLines>(inputPurchaseOrderLinesDto);
                        poLines.PoHeaderId = headerId;
                        //poLines.LineNum = 0;
                        poLines.PriceTypeLookupCode = AppConsts.PRICE_TYPE_LOOKUP_CODE;
                        poLines.ItemDescription = inputPurchaseOrderLinesDto.PartName;
                        poLines.OrgId = AppConsts.DEFAULT_ORG_ID;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(poLines);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        await InsertOrUpdatePoShipments(inputPurchaseOrderLinesDto, headerId, poLines.Id, chargeAccountHeader);
                    }
                    else
                    {
                        PoLines poLines = await _poLinesRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseOrderLinesDto.Id);
                        //poLines = ObjectMapper.Map<PoLines>(inputPurchaseOrderLinesDto);
                        ObjectMapper.Map(inputPurchaseOrderLinesDto, poLines);
                        poLines.PoHeaderId = headerId;
                        //poLines.LineNum = 0;
                        poLines.ItemDescription = inputPurchaseOrderLinesDto.PartName;
                        poLines.PriceTypeLookupCode = AppConsts.PRICE_TYPE_LOOKUP_CODE;
                        poLines.OrgId = AppConsts.DEFAULT_ORG_ID;
                        await InsertOrUpdatePoShipments(inputPurchaseOrderLinesDto, headerId, poLines.Id, chargeAccountHeader);
                        listIdLinesCannotDelete.Add(inputPurchaseOrderLinesDto.Id);
                    }
                }

                if (listIdLinesCannotDelete.Count > 0)
                {
                    foreach (PoLines line in listPoLines)
                    {
                        if (!listIdLinesCannotDelete.Any(e => e == line.Id))
                        {
                            CurrentUnitOfWork.GetDbContext<tmssDbContext>().Remove(line);
                        }
                    }
                }
            }
            else
            {
                throw new UserFriendlyException(L("ListPoLinesEmpty"));
            }
        }

        private async Task InsertOrUpdatePoShipments(InputPurchaseOrderLinesDto inputPurchaseOrderLinesDto, long headerId, long lineId, string chargeAccountHeader)
        {
            List<InputPurchaseOrdersDistributionsDto> listDistributions = new List<InputPurchaseOrdersDistributionsDto>();
            if (inputPurchaseOrderLinesDto.listPOShipments != null && inputPurchaseOrderLinesDto.listPOShipments.Count() > 0)
            {
                foreach (InputPurchaseOrdersShipmentsDto inputPurchaseOrdersShipmentsDto in inputPurchaseOrderLinesDto.listPOShipments)
                {
                    if (inputPurchaseOrdersShipmentsDto.listDistributions == null || inputPurchaseOrdersShipmentsDto.listDistributions.Count() <= 0)
                    {
                        listDistributions.Add(new InputPurchaseOrdersDistributionsDto()
                        {
                            QuantityOrdered = (int?)inputPurchaseOrderLinesDto.Quantity,
                            GlDate = inputPurchaseOrderLinesDto.GlDate,
                            PoChargeAccount = inputPurchaseOrderLinesDto.PoChargeAccount,
                            DistributionNum = 1
                        });
                        inputPurchaseOrdersShipmentsDto.listDistributions = listDistributions;
                    }

                    if (inputPurchaseOrdersShipmentsDto.Id <= 0)
                    {
                        PoLineShipments lineShipments = new PoLineShipments();
                        lineShipments = ObjectMapper.Map<PoLineShipments>(inputPurchaseOrdersShipmentsDto);
                        lineShipments.PoHeaderId = headerId;
                        lineShipments.PoLineId = lineId;
                        lineShipments.ShipmentType = AppConsts.TYPE_LOOKUP_CODE_PO;
                        lineShipments.PromisedDate = inputPurchaseOrdersShipmentsDto.PromisedDate;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(lineShipments);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        await InsertOrUpdatePoRequisitionDistributions(inputPurchaseOrdersShipmentsDto, headerId, lineId, lineShipments.Id, chargeAccountHeader);
                    }
                    else
                    {
                        if (inputPurchaseOrdersShipmentsDto.listDistributions == null || inputPurchaseOrdersShipmentsDto.listDistributions.Count() <= 0)
                        {
                            listDistributions.Add(new InputPurchaseOrdersDistributionsDto()
                            {
                                QuantityOrdered = (int?)inputPurchaseOrderLinesDto.Quantity,
                                GlDate = inputPurchaseOrderLinesDto.GlDate,
                                PoChargeAccount = inputPurchaseOrderLinesDto.PoChargeAccount,
                                DistributionNum = 1
                            });
                            inputPurchaseOrdersShipmentsDto.listDistributions = listDistributions;
                        } else
                        {
                            inputPurchaseOrdersShipmentsDto.listDistributions[0].QuantityOrdered = (int?)inputPurchaseOrderLinesDto.Quantity;
                            inputPurchaseOrdersShipmentsDto.listDistributions[0].GlDate = inputPurchaseOrderLinesDto.GlDate;
                            inputPurchaseOrdersShipmentsDto.listDistributions[0].PoChargeAccount = inputPurchaseOrderLinesDto.PoChargeAccount;
                        }
                        PoLineShipments lineShipments = await _poLineShipmentsRepository.FirstOrDefaultAsync(p => p.Id == inputPurchaseOrdersShipmentsDto.Id);
                        //lineShipments = ObjectMapper.Map<PoLineShipments>(inputPurchaseOrdersShipmentsDto);
                        ObjectMapper.Map(inputPurchaseOrdersShipmentsDto, lineShipments);
                        lineShipments.PoHeaderId = headerId;
                        lineShipments.PoLineId = lineId;
                        lineShipments.ShipmentType = AppConsts.TYPE_LOOKUP_CODE_PO;
                        lineShipments.PromisedDate = inputPurchaseOrdersShipmentsDto.PromisedDate;
                        await InsertOrUpdatePoRequisitionDistributions(inputPurchaseOrdersShipmentsDto, headerId, lineId, lineShipments.Id, chargeAccountHeader);
                    }
                }
            }
            else
            {
                throw new UserFriendlyException(L("ListPoShipmentsEmpty"));
            }
        }

        [AbpAuthorize(AppPermissions.PurchaseOrders_AutoCreatePurchaseOrders_Add)]
        public async Task<List<GetListPoNumberDto>> createPOFromPR(List<GetPurchaseRequestForCreatePODto> getPurchaseRequestForCreatePODtos, string descriptions)
        {
            List<GetListPoNumberDto> getListPoNumberDtos = new List<GetListPoNumberDto>();
            var groupToRequests = getPurchaseRequestForCreatePODtos.GroupBy(e => new { e.InventoryGroupId, e.VendorId, e.CurrencyId, e.RateDate, e.ToPersonId }).Select(e => e).ToList();
            if (groupToRequests.Count() > 0)
            {
                foreach (var getPurchaseRequestForCreatePODto in groupToRequests)
                {

                    string _sqlContracts = "Exec sp_PoGetContractTemplateForCreatePo @InventoryGroupId";

                    var listContracts = await _spRepository.QueryAsync<PrcContractTemplateDto>(_sqlContracts, new
                    {
                        @InventoryGroupId = getPurchaseRequestForCreatePODto.Key.InventoryGroupId,
                    });

                    PrcContractTemplateDto prcContractTemplateDto = new PrcContractTemplateDto();
                    if (listContracts != null && listContracts.ToList().Count > 0)
                    {
                        prcContractTemplateDto = listContracts.ToList()[0];
                    }

                    MstCurrency mstCurrency = _mstCurrency.FirstOrDefault(p => p.Id == getPurchaseRequestForCreatePODto.Key.CurrencyId);
                    MstInventoryGroup mstInventoryGroup = _mstInventoryGroupRepository.FirstOrDefault(p => p.Id == getPurchaseRequestForCreatePODto.Key.InventoryGroupId);
                    MstSuppliers mstSuppliers = _mstSuppliersRepository.FirstOrDefault(p => p.Id == getPurchaseRequestForCreatePODto.Key.VendorId);

                    InputPurchaseOrdersHeadersDto inputPurchaseOrdersHeadersDto = new InputPurchaseOrdersHeadersDto();
                    inputPurchaseOrdersHeadersDto.Id = 0;
                    inputPurchaseOrdersHeadersDto.Description = (mstInventoryGroup != null ? (mstInventoryGroup.ProductGroupName ?? "") : "") + (mstSuppliers != null ? (mstSuppliers.SupplierName ?? "") : "") + descriptions;
                    inputPurchaseOrdersHeadersDto.InventoryGroupId = getPurchaseRequestForCreatePODto.Key.InventoryGroupId;
                    inputPurchaseOrdersHeadersDto.BuyerId = AbpSession.UserId;
                    inputPurchaseOrdersHeadersDto.ShipToLocationId = AppConsts.DEFAULT_SHIP_LOCATION_ID;
                    inputPurchaseOrdersHeadersDto.BillToLocationId = AppConsts.DEFAULT_BILL_LOCATION_ID;
                    inputPurchaseOrdersHeadersDto.CurrencyCode = mstCurrency.CurrencyCode;
                    inputPurchaseOrdersHeadersDto.RateDate = DateTime.Now;
                    inputPurchaseOrdersHeadersDto.VendorId = getPurchaseRequestForCreatePODto.Key.VendorId;
                    inputPurchaseOrdersHeadersDto.TypeLookupCode = AppConsts.TYPE_LOOKUP_CODE_PO;
                    inputPurchaseOrdersHeadersDto.TermsId = prcContractTemplateDto.PaymentTermsId ?? AppConsts.TERMS_ID_DEFAULT;
                    inputPurchaseOrdersHeadersDto.Attribute14 = prcContractTemplateDto.PaidBy ?? AppConsts.TERMS_PAID_BY;
                    inputPurchaseOrdersHeadersDto.Attribute15 = prcContractTemplateDto.Orthers ?? AppConsts.TERMS_OTHER;
                    inputPurchaseOrdersHeadersDto.Attribute12 = prcContractTemplateDto.Shipment;
                    List<GetPurchaseRequestForCreatePODto> listLines = getPurchaseRequestForCreatePODtos.Where(e => e.InventoryGroupId == getPurchaseRequestForCreatePODto.Key.InventoryGroupId && e.VendorId == getPurchaseRequestForCreatePODto.Key.VendorId && e.CurrencyId == getPurchaseRequestForCreatePODto.Key.CurrencyId).ToList();
                    inputPurchaseOrdersHeadersDto.ChargeAccount = listLines[0].ChargeAccount;
                    inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos = await setupCreatePoFromPr(listLines);
                    inputPurchaseOrdersHeadersDto.TotalPrice = inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos != null ? inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos.Sum(e => ((decimal)e.Quantity * e.UnitPrice)) : 0;
                    long id = await createPurchaseOrders(inputPurchaseOrdersHeadersDto);
                    PoHeaders poHeaders = await _poHeadersRepository.FirstOrDefaultAsync(p => p.Id == id);
                    getListPoNumberDtos.Add(new GetListPoNumberDto()
                    {
                        Id = id,
                        PoNumber = poHeaders.Segment1
                    });
                }
                return getListPoNumberDtos;
            }
            else
            {
                throw new UserFriendlyException(L("CannotPrForCreatePo"));
            }
        }

        [AbpAuthorize( AppPermissions.PurchaseRequest_CreatePurchaseRequest_Add)]
        public async Task<List<GetListPoNumberDto>> createPoFromUr(List<GetAllUserRequestForPrDto> getAllUserRequestForPrDtos)
        {
            List<GetListPoNumberDto> getListPoNumberDtos = new List<GetListPoNumberDto>();
            var groupToRequests = getAllUserRequestForPrDtos.GroupBy(e => new { e.InventoryGroupId, e.VendorId, e.CurrencyId, e.DocumentDate, e.RequesterId }).Select(e => e).ToList();
            if (groupToRequests.Count() > 0)
            {
               foreach(var getAllUserRequestForPr in groupToRequests)
                {
                    //var groupToRequests = getAllUserRequestForPrDtos.GroupBy(e => new { e.InventoryGroupId, e.VendorId, e.CurrencyId, e.RateDate, e.ToPersonId }).Select(e => e).ToList();
                    InputPurchaseOrdersHeadersDto inputPurchaseOrdersHeadersDto = new InputPurchaseOrdersHeadersDto();
                    List<GetAllUserRequestForPrDto> listLines = getAllUserRequestForPr.Where(e => e.InventoryGroupId == getAllUserRequestForPr.Key.InventoryGroupId && e.VendorId == getAllUserRequestForPr.Key.VendorId && e.CurrencyId == getAllUserRequestForPr.Key.CurrencyId).ToList();
                    GetAllUserRequestForPrDto getAllUserRequestForPrDto = getAllUserRequestForPrDtos[0];
                    inputPurchaseOrdersHeadersDto.Id = 0;
                    inputPurchaseOrdersHeadersDto.InventoryGroupId = getAllUserRequestForPrDto.InventoryGroupId;
                    inputPurchaseOrdersHeadersDto.BuyerId = AbpSession.UserId;
                    inputPurchaseOrdersHeadersDto.ShipToLocationId = AppConsts.DEFAULT_SHIP_LOCATION_ID;
                    inputPurchaseOrdersHeadersDto.BillToLocationId = AppConsts.DEFAULT_BILL_LOCATION_ID;
                    inputPurchaseOrdersHeadersDto.CurrencyCode = AppConsts.CURRENCY_CODE_VND;
                    inputPurchaseOrdersHeadersDto.VendorId = getAllUserRequestForPr.Key.VendorId;
                    inputPurchaseOrdersHeadersDto.RateDate = DateTime.Now;
                    inputPurchaseOrdersHeadersDto.BuyerId = getAllUserRequestForPr.Key.RequesterId;
                    inputPurchaseOrdersHeadersDto.TermsId = AppConsts.TERMS_ID_DEFAULT;
                    inputPurchaseOrdersHeadersDto.Attribute14 = AppConsts.TERMS_PAID_BY;
                    inputPurchaseOrdersHeadersDto.Attribute15 = AppConsts.TERMS_OTHER;
                    //inputPurchaseOrdersHeadersDto.VendorSiteId = getAllUserRequestForPr.Key.VendorSiteId;
                    inputPurchaseOrdersHeadersDto.ChargeAccount = listLines[0].BudgetCode;
                    inputPurchaseOrdersHeadersDto.TypeLookupCode = AppConsts.TYPE_LOOKUP_CODE_PO;
                    inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos = await setupCreatePoFromUr(listLines);
                    inputPurchaseOrdersHeadersDto.TotalPrice = inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos != null ? inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos.Sum(e => ((decimal)e.Quantity * e.UnitPrice)) : 0;
                    long id = await createPurchaseOrders(inputPurchaseOrdersHeadersDto);
                    PoHeaders poHeaders = await _poHeadersRepository.FirstOrDefaultAsync(p => p.Id == id);
                    getListPoNumberDtos.Add(new GetListPoNumberDto()
                    {
                        Id = id,
                        PoNumber = poHeaders.Segment1
                    });
                }

                return getListPoNumberDtos;
            }
            else
            {
                throw new UserFriendlyException(L("CannotUrForCreatePo"));
            }
        }

        private async Task<List<InputPurchaseOrderLinesDto>> setupCreatePoFromUr(List<GetAllUserRequestForPrDto> getAllUserRequestForPrDtos)
        {
            List<InputPurchaseOrderLinesDto> inputPurchaseOrderLinesDtos = new List<InputPurchaseOrderLinesDto>();
            for (int i = 0; i < getAllUserRequestForPrDtos.Count(); i++)
            {
                GetAllUserRequestForPrDto getAllUserRequestForPrDto = getAllUserRequestForPrDtos[i];
                List<InputPurchaseOrdersDistributionsDto> inputPurchaseOrdersDistributionsDtos = new List<InputPurchaseOrdersDistributionsDto>();
                List<InputPurchaseOrdersShipmentsDto> inputPurchaseOrdersShipmentsDtos = new List<InputPurchaseOrdersShipmentsDto>();
                List<GetPrDistributionsForCreatePoDto> getPrDistributionsForCreatePoDtos = new List<GetPrDistributionsForCreatePoDto>();
                inputPurchaseOrdersDistributionsDtos.Add(new InputPurchaseOrdersDistributionsDto()
                {
                    QuantityOrdered = (int?)getAllUserRequestForPrDto.Quantity,
                    GlDate = DateTime.Now,
                    PoChargeAccount = getAllUserRequestForPrDto.BudgetCode,
                    DistributionNum = 1
                });

                InputPurchaseOrdersShipmentsDto inputPurchaseOrdersShipmentsDto = new InputPurchaseOrdersShipmentsDto();
                inputPurchaseOrdersShipmentsDto.ShipToOrganizationId = 81;
                inputPurchaseOrdersShipmentsDto.ShipToLocationId = 21;
                inputPurchaseOrdersShipmentsDto.UnitMeasLookupCode = getAllUserRequestForPrDto.Uom;
                inputPurchaseOrdersShipmentsDto.Quantity = (int?)getAllUserRequestForPrDto.Quantity;
                inputPurchaseOrdersShipmentsDto.NeedByDate = getAllUserRequestForPrDto.NeedByDate;
                inputPurchaseOrdersShipmentsDto.listDistributions = inputPurchaseOrdersDistributionsDtos;
                inputPurchaseOrdersShipmentsDto.ShipmentNum = 1;
                inputPurchaseOrdersShipmentsDto.Id = 0;
                inputPurchaseOrdersShipmentsDtos.Add(inputPurchaseOrdersShipmentsDto);

                InputPurchaseOrderLinesDto inputPurchaseOrderLinesDto = ObjectMapper.Map<InputPurchaseOrderLinesDto>(getAllUserRequestForPrDto);
                inputPurchaseOrderLinesDto.Id = 0;
                inputPurchaseOrderLinesDto.LineNum = (i + 1);
                inputPurchaseOrderLinesDto.UnitMeasLookupCode = getAllUserRequestForPrDto.Uom;
                inputPurchaseOrderLinesDto.listPOShipments = inputPurchaseOrdersShipmentsDtos;
                inputPurchaseOrderLinesDto.LineTypeId = getAllUserRequestForPrDto.LineTypeId ?? 1;
                inputPurchaseOrderLinesDto.UrLineId = getAllUserRequestForPrDto.Id;
                inputPurchaseOrderLinesDto.UnitPrice = getAllUserRequestForPrDto.ExchangeUnitPrice;
                inputPurchaseOrderLinesDto.ForeignPrice = getAllUserRequestForPrDto.UnitPrice;
                inputPurchaseOrderLinesDtos.Add(inputPurchaseOrderLinesDto);
            }

            return inputPurchaseOrderLinesDtos;

        }

        public async Task<List<GetListPoNumberDto>> addPrToPoExist(List<GetPurchaseRequestForCreatePODto> getPurchaseRequestForCreatePODtos, long poId)
        {
            PoHeaders poHeaders = _poHeadersRepository.FirstOrDefault(p => p.Id == poId);
            if (poHeaders == null)
            {
                throw new UserFriendlyException(L("CannotPoForAdd"));
            }
            else
            {
                InputPurchaseOrdersHeadersDto inputPurchaseOrdersHeadersDto = new InputPurchaseOrdersHeadersDto();
                inputPurchaseOrdersHeadersDto.inputPurchaseOrderLinesDtos = await setupCreatePoFromPr(getPurchaseRequestForCreatePODtos);
                await InsertOrUpdatePoLines(inputPurchaseOrdersHeadersDto, poHeaders.Id, inputPurchaseOrdersHeadersDto.ChargeAccount);
                List<GetListPoNumberDto> getListPoNumberDtos = new List<GetListPoNumberDto>();
                getListPoNumberDtos.Add(new GetListPoNumberDto()
                {
                    Id = poHeaders.Id,
                    PoNumber = poHeaders.Segment1
                });
                return getListPoNumberDtos;
            }
        }

        private async Task<List<InputPurchaseOrderLinesDto>> setupCreatePoFromPr(List<GetPurchaseRequestForCreatePODto> getPurchaseRequestForCreatePODtos)
        {
            List<InputPurchaseOrderLinesDto> inputPurchaseOrderLinesDtos = new List<InputPurchaseOrderLinesDto>();
            for (int i = 0; i < getPurchaseRequestForCreatePODtos.Count(); i++)
            {
                GetPurchaseRequestForCreatePODto getPurchaseRequestForCreatePODto = getPurchaseRequestForCreatePODtos[i];
                List<InputPurchaseOrdersDistributionsDto> inputPurchaseOrdersDistributionsDtos = new List<InputPurchaseOrdersDistributionsDto>();
                List<InputPurchaseOrdersShipmentsDto> inputPurchaseOrdersShipmentsDtos = new List<InputPurchaseOrdersShipmentsDto>();
                List<GetPrDistributionsForCreatePoDto> getPrDistributionsForCreatePoDtos = await _iPurchaseRequestAppService.getPrDistributionsForCreatePO((long)getPurchaseRequestForCreatePODto.Id);
                if (getPrDistributionsForCreatePoDtos.Count() > 0)
                {
                    foreach (GetPrDistributionsForCreatePoDto getPrDistributionsForCreatePoDto in getPrDistributionsForCreatePoDtos)
                    {
                        InputPurchaseOrdersDistributionsDto inputPurchaseOrdersDistributionsDto = new InputPurchaseOrdersDistributionsDto();
                        inputPurchaseOrdersDistributionsDto = ObjectMapper.Map<InputPurchaseOrdersDistributionsDto>(getPrDistributionsForCreatePoDto);
                        inputPurchaseOrdersDistributionsDto.DistributionNum = 1;
                        inputPurchaseOrdersDistributionsDto.PrRequisitionDistributionId = getPrDistributionsForCreatePoDto.PrDistributionsId;
                        inputPurchaseOrdersDistributionsDtos.Add(inputPurchaseOrdersDistributionsDto);
                    }
                }
                InputPurchaseOrdersShipmentsDto inputPurchaseOrdersShipmentsDto = new InputPurchaseOrdersShipmentsDto();
                inputPurchaseOrdersShipmentsDto.ShipToOrganizationId = getPurchaseRequestForCreatePODto.DestinationOrganizationId;
                inputPurchaseOrdersShipmentsDto.ShipToLocationId = getPurchaseRequestForCreatePODto.DeliverToLocationId;
                inputPurchaseOrdersShipmentsDto.UnitMeasLookupCode = getPurchaseRequestForCreatePODto.UnitMeasLookupCode;
                inputPurchaseOrdersShipmentsDto.Quantity = getPurchaseRequestForCreatePODto.Quantity;
                inputPurchaseOrdersShipmentsDto.NeedByDate = getPurchaseRequestForCreatePODto.NeedByDate;
                inputPurchaseOrdersShipmentsDto.ShipmentNum = 1;
                inputPurchaseOrdersShipmentsDto.listDistributions = inputPurchaseOrdersDistributionsDtos;
                inputPurchaseOrdersShipmentsDto.Id = 0;
                inputPurchaseOrdersShipmentsDtos.Add(inputPurchaseOrdersShipmentsDto);

                InputPurchaseOrderLinesDto inputPurchaseOrderLinesDto = ObjectMapper.Map<InputPurchaseOrderLinesDto>(getPurchaseRequestForCreatePODto);
                inputPurchaseOrderLinesDto.Id = 0;
                inputPurchaseOrderLinesDto.LineNum = (i + 1);
                inputPurchaseOrderLinesDto.listPOShipments = inputPurchaseOrdersShipmentsDtos;
                inputPurchaseOrderLinesDtos.Add(inputPurchaseOrderLinesDto);
            }
            return inputPurchaseOrderLinesDtos;
        }

        [AbpAuthorize(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Search, AppPermissions.PurchaseOrders_PurchaseOrdersHandle_Search)]
        public async Task<PagedResultDto<GetPurchaseOrdersDto>> getAllPurchaseOrders(InputSearchPoDto inputSearchPoDto)
        {
            string _sql = "EXEC sp_PoSearchPo @OrdersNo, @SupplierId, @BillToLocationId, @ShipToLocationId, @InventoryGroupId, @Status, @BuyerId, @UserId, @IsInternal, @FromDate, @ToDate, @MaxResultCount, @SkipCount";
            var listPr = await _spRepository.QueryAsync<GetPurchaseOrdersDto>(_sql, new
            {
                @OrdersNo = inputSearchPoDto.OrdersNo,
                @SupplierId = inputSearchPoDto.SupplierId,
                @BillToLocationId = inputSearchPoDto.BillToLocationId,
                @ShipToLocationId = inputSearchPoDto.ShipToLocationId,
                @InventoryGroupId = inputSearchPoDto.InventoryGroupId,
                @Status = inputSearchPoDto.Status,
                @BuyerId = inputSearchPoDto.BuyerId,
                @UserId = AbpSession.UserId,
                @IsInternal = inputSearchPoDto.IsInternal,
                @FromDate = inputSearchPoDto.FromDate,
                @ToDate = inputSearchPoDto.ToDate,
                @MaxResultCount = inputSearchPoDto.MaxResultCount,
                @SkipCount = inputSearchPoDto.SkipCount,
            });

            int totalCount = 0;
            if (listPr != null && listPr.Count() > 0)
            {
                totalCount = (int)listPr.ToList()[0].TotalCount;
            }
            return new PagedResultDto<GetPurchaseOrdersDto>(
                       totalCount,
                       listPr.ToList()
                      );
        }

        public async Task<GetPoHeadersForEditDto> getPoHeadersForEdit(long id)
        {

            string sqlHeader = "EXEC sp_PoGetPoHeadersForEdit @PoHeaderId";
            string sqlLines = "EXEC sp_PoGetPoLinesByHeader @PoHeaderId";
            string sqlLinesShipment = "EXEC sp_PoGetPoLineShipmentByLine @PoLineId";
            string sqlDistributions = "EXEC sp_PoGetPoDistribuionsByShipment @PoLineShipmentId";

            var poHeaders = await _spRepository.QueryAsync<GetPoHeadersForEditDto>(sqlHeader, new
            {
                @PoHeaderId = id
            });
            GetPoHeadersForEditDto getPoHeadersForEditDto = poHeaders.FirstOrDefault();

            var listAttchments = from att in _attachRepo.GetAll().AsNoTracking()
                                 where att.HeaderId == id && att.AttachFileType == AppConsts.PO
                                 select new GetAllPurchaseOrdersAttachmentsForViewDto()
                                 {
                                     Id = att.Id,
                                     FileName = att.OriginalFileName,
                                     ServerFileName = att.ServerFileName,
                                     RootPath = att.RootPath,
                                     UploadTime = att.CreationTime
                                 };
            if (listAttchments.ToList().Count > 0)
            {
                getPoHeadersForEditDto.Attachments = listAttchments.ToList();
            }

            var poLines = await _spRepository.QueryAsync<GetPoLinesForEditDtocs>(sqlLines, new
            {
                @PoHeaderId = id
            });

            if (poLines.Count() > 0)
            {
                getPoHeadersForEditDto.inputPurchaseOrderLinesDtos = poLines.ToList();
                foreach (GetPoLinesForEditDtocs getPoLinesForEditDtocs in poLines.ToList())
                {
                    var poShipments = await _spRepository.QueryAsync<GetPoShipmentsByLineForEditDto>(sqlLinesShipment, new
                    {
                        @PoLineId = getPoLinesForEditDtocs.Id
                    });
                    if (poShipments.Count() > 0)
                    {
                        getPoLinesForEditDtocs.NeedByDate = poShipments.ToList()[0].NeedByDate;
                        getPoLinesForEditDtocs.PromisedDate = poShipments.ToList()[0].PromisedDate;
                        getPoLinesForEditDtocs.listPOShipments = poShipments.ToList();
                        foreach (GetPoShipmentsByLineForEditDto getPoShipmentsByLineForEditDto in poShipments.ToList())
                        {
                            var poDistributions = await _spRepository.QueryAsync<GetPoDistributionsForEditDto>(sqlDistributions, new
                            {
                                @PoLineShipmentId = getPoShipmentsByLineForEditDto.Id
                            });
                            if (poDistributions.Count() > 0)
                            {
                                //getPoShipmentsByLineForEditDto.listDistributions = poDistributions.ToList();
                                //if (poDistributions.Count() == 1)
                                //{
                                //    getPoLinesForEditDtocs.GlDate = poDistributions.ToList()[0].GlDate;
                                //    getPoLinesForEditDtocs.PoChargeAccount = poDistributions.ToList()[0].PoChargeAccount;
                                //}
                                //else
                                //{
                                    getPoLinesForEditDtocs.GlDate = poDistributions.ToList()[0].GlDate;
                                    getPoLinesForEditDtocs.PoChargeAccount = poDistributions.ToList()[0].PoChargeAccount;
                                    getPoShipmentsByLineForEditDto.listDistributions = poDistributions.ToList();
                                //}
                            }

                        }
                    }
                }

                if (getPoHeadersForEditDto.ChargeAccount == null && getPoHeadersForEditDto.inputPurchaseOrderLinesDtos.Count() > 0)
                {
                    getPoHeadersForEditDto.ChargeAccount = getPoHeadersForEditDto.inputPurchaseOrderLinesDtos[0].PoChargeAccount;
                }
            }

            return getPoHeadersForEditDto;

        }

        [AbpAuthorize(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Import)]
        public async Task<int> saveDataFromImportData()
        {
            double conversionRateUsd = 1;
            double conversionRateVnd = 1;
            int countPo = 0;
            //MstGlExchangeRate mstGlExchangeRateVnd = _mstGlExchangeRateRepository.GetAll().Where(p => p.FromCurrency.Equals(mstCurrency.CurrencyCode) && p.ToCurrency.Equals(AppConsts.CURRENCY_CODE_VND) && p.ConversionDate.Value.Date == DateTime.Now.Date).FirstOrDefault();

            //if (mstGlExchangeRateVnd != null)
            //{
            //    conversionRateVnd = (double)mstGlExchangeRateVnd.ConversionRate;
            //}

            User user = await _userRepository.FirstOrDefaultAsync(p => p.Id == AbpSession.UserId);
            if (user == null)
            {
                throw new UserFriendlyException(400, "CannotUser");
            }
            else
            {
                string _sql = "select * from V_GetListItemsForImportPo where CreatorUserId = @CreatorUserId order by InventoryGroupId desc";

                var listInvItems = await _spRepository.QueryAsync<GetListItemsForImportPo>(_sql, new
                {
                    @CreatorUserId = AbpSession.UserId,
                });

                if (listInvItems.ToList().Count == 0)
                {
                    throw new UserFriendlyException(400, L("CannotItemsImport"));
                }

                var groupToRequests = listInvItems.GroupBy(e => new { e.InventoryGroupId, e.VendorId, e.CurrencyCode, e.LocationId, e.Comments, e.VendorSiteId }).Select(e => e).ToList();
                GetListItemsForImportPo getListItemsForImportPo = listInvItems.ToList()[0];
                foreach (var item in groupToRequests)
                {
                    string poNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.PurchasingOrder);
                    if (poNo == null)
                    {
                        throw new UserFriendlyException(400, L("CannotGenPoNo"));
                    }
                    List<GetListItemsForImportPo> listLines = listInvItems.Where(p => p.InventoryGroupId == item.Key.InventoryGroupId && p.VendorId == item.Key.VendorId && p.CurrencyCode == item.Key.CurrencyCode).ToList();
                    MstGlExchangeRate mstGlExchangeRateUsd = _mstGlExchangeRateRepository.GetAll().Where(p => p.FromCurrency.Equals(item.Key.CurrencyCode) && p.ToCurrency.Equals(AppConsts.CURRENCY_CODE_USD) && p.ConversionDate.Value.Date == DateTime.Now.Date).FirstOrDefault();
                    if (mstGlExchangeRateUsd != null)
                    {
                        conversionRateUsd = (double)mstGlExchangeRateUsd.ConversionRate;
                    }

                    string _sqlContracts = "Exec sp_PoGetContractTemplateForCreatePo @InventoryGroupId";

                    var listContracts = await _spRepository.QueryAsync<PrcContractTemplateDto>(_sqlContracts, new
                    {
                        @InventoryGroupId = item.Key.InventoryGroupId,
                    });

                    PrcContractTemplateDto prcContractTemplateDto = new PrcContractTemplateDto();
                    if (listContracts != null && listContracts.ToList().Count > 0)
                    {
                        prcContractTemplateDto = listContracts.ToList()[0];
                    }

                    MstInventoryGroup mstInventoryGroup = _mstInventoryGroupRepository.FirstOrDefault(p => p.Id == item.Key.InventoryGroupId);
                    MstSuppliers mstSuppliers = _mstSuppliersRepository.FirstOrDefault(p => p.Id == item.Key.VendorId);

                    SearchGlCodeOutputDto searchGlCodeOutputDto = await _iCommonGeneralCacheAppService.getGlCombaination();
                    PoHeaders poHeaders = new PoHeaders();
                    poHeaders.Segment1 = poNo;
                    poHeaders.PicDepartmentId = (Guid)user.HrOrgStructureId;
                    poHeaders.AgentId = (long)AbpSession.UserId;
                    poHeaders.AuthorizationStatus = AppConsts.STATUS_INCOMPLETE;
                    poHeaders.TypeLookupCode = AppConsts.TYPE_LOOKUP_CODE_PO;
                    poHeaders.BillToLocationId = item.Key.LocationId;
                    poHeaders.ShipToLocationId = item.Key.LocationId;
                    poHeaders.VendorId = item.Key.VendorId;
                    poHeaders.Comments = (mstInventoryGroup != null ? (mstInventoryGroup.ProductGroupName ?? "") : "") + (mstSuppliers != null ? (mstSuppliers.SupplierName ?? "") : "") + item.Key.Comments;
                    poHeaders.RateDate = DateTime.Now;
                    poHeaders.TermsId = prcContractTemplateDto.PaymentTermsId ?? AppConsts.TERMS_ID_DEFAULT;
                    poHeaders.Attribute14 = prcContractTemplateDto.PaidBy ?? AppConsts.TERMS_PAID_BY;
                    poHeaders.Attribute15 = prcContractTemplateDto.Orthers ?? AppConsts.TERMS_OTHER;
                    poHeaders.Attribute12 = prcContractTemplateDto.Shipment;
                    poHeaders.ChargeAccount = listLines[0].BudgetCode;
                    poHeaders.VendorSiteId = item.Key.VendorSiteId;
                    poHeaders.CurrencyCode = item.Key.CurrencyCode;
                    poHeaders.InventoryGroupId = item.Key.InventoryGroupId;
                    poHeaders.TotalPrice = listLines != null ? listLines.Sum(e => ((decimal)e.Quantity * e.UnitPrice)) : 0;
                    poHeaders.TotalPriceUsd = (poHeaders.TotalPrice * (decimal)conversionRateUsd);
                    await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(poHeaders);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    var input = new CreateRequestApprovalInputDto();
                    input.ReqId = poHeaders.Id;
                    input.ProcessTypeCode = "PO";
                    await _sentRequestInf.CreateRequestApprovalTree(input);

                    for (int i = 0; i < listLines.Count(); i++)
                    {
                        GetListItemsForImportPo getListItemsForImport = listLines[i];
                        PoLines poLines = new PoLines();
                        poLines.PoHeaderId = poHeaders.Id;
                        poLines.ItemDescription = getListItemsForImport.PartName;
                        poLines.LineTypeId = 1;
                        poLines.LineNum = (i + 1);
                        poLines.ItemId = getListItemsForImport.ItemId;
                        poLines.CategoryId = getListItemsForImport.CategoryId;
                        poLines.UnitMeasLookupCode = getListItemsForImport.PrimaryUnitOfMeasure;
                        poLines.UnitPrice = getListItemsForImport.UnitPrice;
                        poLines.ForeignPrice = getListItemsForImport.UnitPrice;
                        poLines.Quantity = getListItemsForImport.Quantity;
                        poLines.PriceTypeLookupCode = getListItemsForImport.PriceType.ToUpper();
                        poLines.OrgId = AppConsts.DEFAULT_ORG_ID;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(poLines);
                        await CurrentUnitOfWork.SaveChangesAsync();


                        PoLineShipments lineShipments = new PoLineShipments();
                        lineShipments.PoHeaderId = poHeaders.Id;
                        lineShipments.PoLineId = poLines.Id;
                        lineShipments.Quantity = getListItemsForImport.Quantity;
                        lineShipments.UnitMeasLookupCode = getListItemsForImport.PrimaryUnitOfMeasure;
                        lineShipments.ShipToLocationId = getListItemsForImport.LocationId;
                        lineShipments.ShipToOrganizationId = getListItemsForImport.OrganizationId;
                        lineShipments.NeedByDate = DateTime.Parse(getListItemsForImport.NeedByPaintSteel);
                        lineShipments.PromisedDate = DateTime.Parse(getListItemsForImport.NeedByPaintSteel);
                        lineShipments.ShipmentType = AppConsts.TYPE_LOOKUP_CODE_PO;
                        lineShipments.ShipmentNum = 1;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(lineShipments);
                        await CurrentUnitOfWork.SaveChangesAsync();

                        PoDistributions poDistributions = new PoDistributions();
                        poDistributions.PoHeaderId = poHeaders.Id;
                        poDistributions.PoLineId = poLines.Id;
                        poDistributions.PoLineShipmentId = lineShipments.Id;
                        poDistributions.QuantityOrdered = getListItemsForImport.Quantity;
                        poDistributions.GlEncumberedDate = DateTime.Parse(getListItemsForImport.GlDate);
                        poDistributions.OrgId = AppConsts.DEFAULT_ORG_ID;
                        poDistributions.SetOfBooksId = 21;
                        poDistributions.CodeCombinationId = getListItemsForImport.CodeCombinationId;
                        poDistributions.DistributionType = AppConsts.TYPE_LOOKUP_CODE_PO;
                        poDistributions.DeliverToLocationId = getListItemsForImport.LocationId;
                        poDistributions.DestinationContext = getListItemsForImport.DestinationType;
                        poDistributions.DestinationTypeCode = getListItemsForImport.DestinationType;
                        poDistributions.DistributionNum = 1;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(poDistributions);
                    }
                    countPo++;
                }
            }
            return countPo;
        }

        [AbpAuthorize(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Export)]
        public async Task<FileDto> ExportTemplate()
        {
            try
            {
                string fileName = "CPS_Template_Import_PO.xlsx";

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

        public async Task<PagedResultDto<GetContractForCreatePoDto>> getAllContractForCreatePo(InputSearchContractDto inputSearchContractDto)
        {
            string _sql = "EXEC sp_PoGetContractForCreatePo @ContractNo, @SupplierId, @FromDate, @ToDate, @MaxResultCount, @SkipCount";
            var listPr = await _spRepository.QueryAsync<GetContractForCreatePoDto>(_sql, new
            {
                @ContractNo = inputSearchContractDto.ContractNo,
                @SupplierId = inputSearchContractDto.SupplierId,
                @FromDate = inputSearchContractDto.FromDate,
                @ToDate = inputSearchContractDto.ToDate,
                @MaxResultCount = inputSearchContractDto.MaxResultCount,
                @SkipCount = inputSearchContractDto.SkipCount,
            });

            int totalCount = 0;
            if (listPr != null && listPr.Count() > 0)
            {
                totalCount = (int)listPr.ToList()[0].TotalCount;
            }
            return new PagedResultDto<GetContractForCreatePoDto>(
                       totalCount,
                       listPr.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.PurchaseOrders_PurchaseOrdersHandle_Approved, AppPermissions.PurchaseOrders_PurchaseOrdersHandle_Rejected)]
        public async Task supplierComfirm(List<long> listIdPo, long type, string note)
        {
            foreach (long id in listIdPo)
            {
                PoHeaders poHeaders = _poHeadersRepository.FirstOrDefault(x => x.Id == id);
                if (poHeaders != null)
                {
                    if (type == 1)
                    {
                        poHeaders.IsVendorConfirm = true;
                        poHeaders.NoteOfSupplier = note;
                    }
                    else
                    {
                        poHeaders.IsVendorConfirm = false;
                        poHeaders.NoteOfSupplier = note;
                    }
                }
                else
                {
                    throw new UserFriendlyException(400, L("CannotItemsPo"));
                }

            }
        }

        public async Task<List<GetListPoForAddPrToPoDto>> getListPoForAddPrToPos(string poNumber)
        {
            string _sql = "EXEC sp_PoGetListPoForAddPrToPoLine @PoNumber";
            var listPr = await _spRepository.QueryAsync<GetListPoForAddPrToPoDto>(_sql, new
            {
                PoNumber = poNumber
            });
            return listPr.ToList();
        }

        [AbpAuthorize(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Export)]
        public async Task<FileDto> exportPo(InputSearchPoDto inputSearchPoDto)
        {
            string fileName = "";

            fileName = "Purchase_orders_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".xlsx";

            IEnumerable<GetAllExportPoDto> rawData;
            List<GetAllExportPoDto> datas = new List<GetAllExportPoDto>();

            rawData = await _spRepository.QueryAsync<GetAllExportPoDto>("EXEC sp_PoExportPo @OrdersNo, @SupplierId, @InventoryGroupId, @Status, @UserId, @FromDate, @ToDate", new
            {
                @OrdersNo = inputSearchPoDto.OrdersNo,
                @SupplierId = inputSearchPoDto.SupplierId,
                @InventoryGroupId = inputSearchPoDto.InventoryGroupId,
                @Status = inputSearchPoDto.Status,
                @UserId = AbpSession.UserId,
                @FromDate = inputSearchPoDto.FromDate,
                @ToDate = inputSearchPoDto.ToDate,
            });

            datas = rawData.ToList();

            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_Export_PO.xlsx");

            var workBook = ExcelFile.Load(path);
            var workSheet = workBook.Worksheets[0];


            int startRow = 1;
            int endRow = datas.Count;

            if (endRow > 0)
            {
                workSheet.Cells.GetSubrange($"A1:K{endRow + 1}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                for (int i = 0; i < endRow; i++)
                {
                    /* STT */
                    workSheet.Cells[startRow + i, 0].Value = i + 1;

                    /* Requisition No. */
                    workSheet.Cells[startRow + i, 1].Value = datas[i].OrdersNo ?? "";

                    /* Requisition Name */
                    workSheet.Cells[startRow + i, 2].Value = datas[i].Description ?? "";

                    /* Product Group Name */
                    workSheet.Cells[startRow + i, 3].Value = datas[i].ProductGroupName ?? "";

                    /* Requester Name */
                    workSheet.Cells[startRow + i, 4].Value = datas[i].TypeLookupCode ?? "";

                    /* Request Date */
                    workSheet.Cells[startRow + i, 5].Value = datas[i].AuthorizationStatus ?? null;

                    /* Department */
                    workSheet.Cells[startRow + i, 6].Value = datas[i].OrderDate ?? null;

                    /* Total Price */
                    workSheet.Cells[startRow + i, 7].Value = datas[i].SupplierName ?? "";

                    /* Currency */
                    workSheet.Cells[startRow + i, 8].Value = datas[i].Currency ?? null;

                    /* Status */
                    workSheet.Cells[startRow + i, 9].Value = datas[i].Amount;

                    /* Budget Code */
                    workSheet.Cells[startRow + i, 10].Value = datas[i].BuyerName ?? "";
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

        public async Task deletePurchaseOrders(long id)
        {
            PoHeaders poHeaders = await _poHeadersRepository.FirstOrDefaultAsync(p => p.Id == id);
            List<PoLines> poLines = await _poLinesRepository.GetAll().Where(p => p.PoHeaderId == id).ToListAsync();
            if (poHeaders == null)
            {
                throw new UserFriendlyException(400, L("NoRecordsToDelete"));
            }
            else if(!poHeaders.AuthorizationStatus.Equals(AppConsts.STATUS_NEW))
            {
                throw new UserFriendlyException(400, L("CurrentStatusCannotDelete"));
            }
            else if (poHeaders != null && poHeaders.CreatorUserId != AbpSession.UserId)
            {
                throw new UserFriendlyException(400, L("YouDoNotEditOrDelete"));
            }
            else
            {
                if (poLines != null && poLines.Count() > 0)
                {
                    foreach (PoLines poLine in poLines)
                    {
                        await _poLinesRepository.DeleteAsync(poLine);
                        await _poLineShipmentsRepository.DeleteAsync(p => p.PoLineId == poLine.Id);
                        await _poDistributionsRepository.DeleteAsync(p => p.PoLineId == poLine.Id);
                    }

                }

               await _poHeadersRepository.DeleteAsync(poHeaders);
            }
        }
    }

}
