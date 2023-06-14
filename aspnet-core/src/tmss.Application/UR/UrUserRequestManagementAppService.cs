using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.Linq.Extensions;
using Abp.Localization;
using Abp.Localization.Sources;
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
using tmss.Common.CommonGeneralCache.Dto;
using tmss.Common.GeneratePurchasingNumber;
using tmss.Dto;
using tmss.EntityFrameworkCore;
using tmss.ExcelDataReader.Dto;
using tmss.GR.Enum;
using tmss.Master;
using tmss.Price;
using tmss.SendMail;
using tmss.Storage;
using tmss.UR.UserRequestManagement;
using tmss.UR.UserRequestManagement.Dto;
/******************************************************************************
REVISIONS:
Ver        Date        Author           Description
---------  ----------  ---------------  ------------------------------------
1.0                    hoatv            1. Initial
******************************************************************************/

namespace tmss.UR
{
    //[AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest)]
    public class UrUserRequestManagementAppService : ApplicationService, IUrUserRequestManagementAppService
    {
        private readonly IDapperRepository<UserRequest, long> _dapper;
        private readonly IRepository<MstInventoryItems, long> _invRepo;
        private readonly IRepository<UserRequest, long> _urRepo;
        private readonly IRepository<User, long> _userRepo;
        private readonly IRepository<MstHrOrgStructure, Guid> _departRepo;
        private readonly IRepository<UserRequestDetail, long> _urDRepo;
        private readonly IRepository<MstCurrency, long> _curRepo;
        private readonly IRepository<MstSuppliers, long> _supRepo;
        private readonly IRepository<MstInventoryGroup, long> _invGRepo;
        private readonly ICommonGeneratePurchasingNumberAppService _generateUrNumber;
        private readonly IRepository<MstInventoryItemPrices, long> _priceRepo;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private readonly IRepository<MstInventoryItemPrices, long> _invPriceRepo;
        private readonly IRepository<MstGlCodeCombination, long> _budgetRepo;
        private readonly IRepository<MstAttachFiles, long> _attachRepo;
        private readonly IRepository<MstUnitOfMeasure, long> _uomRepo;
        private readonly ISendEmail _sendEmail;
        private readonly ILocalizationSource _localize;

        public UrUserRequestManagementAppService(
            IDapperRepository<UserRequest, long> dapper,
            IRepository<MstInventoryItems, long> invRepo,
            IRepository<UserRequest, long> urRepo,
            IRepository<User, long> userRepo,
            IRepository<MstHrOrgStructure, Guid> departRepo,
            IRepository<UserRequestDetail, long> urDRepo,
            IRepository<MstCurrency, long> curRepo,
            IRepository<MstSuppliers, long> supRepo,
            IRepository<MstInventoryGroup, long> invGRepo,
            ICommonGeneratePurchasingNumberAppService generateUrNumber,
            IRepository<MstInventoryItemPrices, long> priceRepo,
            ITempFileCacheManager tempFileCacheManager,
            ILocalizationManager localizationManager,
            IRepository<MstInventoryItemPrices, long> invPriceRepo,
            IRepository<MstGlCodeCombination, long> budgetRepo,
            IRepository<MstAttachFiles, long> attachRepo,
            IRepository<MstUnitOfMeasure, long> uomRepo,
            ISendEmail sendEmail
            )
        {
            _dapper = dapper;
            _invRepo = invRepo;
            _urRepo = urRepo;
            _userRepo = userRepo;
            _departRepo = departRepo;
            _urDRepo = urDRepo;
            _curRepo = curRepo;
            _supRepo = supRepo;
            _invGRepo = invGRepo;
            _generateUrNumber = generateUrNumber;
            _priceRepo = priceRepo;
            _tempFileCacheManager = tempFileCacheManager;
            _invPriceRepo = invPriceRepo;
            _budgetRepo = budgetRepo;
            _attachRepo = attachRepo;
            _uomRepo = uomRepo;
            _sendEmail = sendEmail;
            _localize = localizationManager.GetSource(tmssConsts.LocalizationSourceName);
        }

        #region -- Lấy danh sách yêu cầu
        public async Task<PagedResultDto<GetAllUserRequestForViewDto>> GetAllUserRequests(GetAllUserRequestInput input)
        {
            IEnumerable<GetAllUserRequestForViewDto> userRequests = await _dapper.QueryAsync<GetAllUserRequestForViewDto>("EXEC sp_PcsQueryUserRequest @URNumber, @InventoryGroupId, @Status, @FromDate, @ToDate, @UserId, @PicUserId, @MaxResultCount, @SkipCount",
                new { input.URNumber, input.InventoryGroupId, input.Status, input.FromDate, input.ToDate, AbpSession.UserId, input.PicUserId, input.MaxResultCount, input.SkipCount });

            var result = userRequests.AsQueryable();

            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;

            return new PagedResultDto<GetAllUserRequestForViewDto>(
                totalCount,
                result.ToList()
                );
        }
        #endregion

        #region -- Lấy danh sách sản phẩm cho tạo/sửa yêu cầu
        public async Task<PagedResultDto<GetAllProductsForViewDto>> GetAllProducts(GetAllProductInput input)
        {
            IEnumerable<GetAllProductsForViewDto> products = await _dapper.QueryAsync<GetAllProductsForViewDto>("EXEC sp_PcsQueryProductsForManualUR @ProductCode, @InventoryGroupId, @CurrencyId, @MaxResultCount, @SkipCount",
                new
                {
                    input.ProductCode,
                    input.InventoryGroupId,
                    input.CurrencyId,
                    input.MaxResultCount,
                    input.SkipCount
                });

            var result = products.AsQueryable();

            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;

            return new PagedResultDto<GetAllProductsForViewDto>(
                    totalCount,
                    result.ToList()
                );
        }
        #endregion

        #region -- Lấy thông chi tiết yêu cầu
        public async Task<GetUserRequestDetailForView> GetUrDetail(long id)
        {
            GetUserRequestDetailForView result = new GetUserRequestDetailForView();

            IEnumerable<GetUserRequestDetailForView> header = await _dapper.QueryAsync<GetUserRequestDetailForView>("EXEC sp_PcsQueryUserRequestDetail_Header @ReqId", new { ReqId = id });
            IEnumerable<GetAllProductsForViewDto> products = await _dapper.QueryAsync<GetAllProductsForViewDto>("EXEC sp_PcsQueryUserRequestDetail_Products @ReqId", new { ReqId = id });
            IEnumerable<GetAllUserRequestAttachmentsForViewDto> attachments = await _dapper.QueryAsync<GetAllUserRequestAttachmentsForViewDto>("EXEC sp_PcsQueryUserRequestDetail_Attachments @ReqId", new { ReqId = id });

            result = header.Select(e => new GetUserRequestDetailForView
            {
                Id = e.Id,
                UserRequestNumber = e.UserRequestNumber,
                UserRequestName = e.UserRequestName,
                PicDepartmentId = e.PicDepartmentId,
                RequestUser = e.RequestUser,
                CreatorUserId = e.CreatorUserId,
                RequestDate = e.RequestDate,
                DepartmentName = e.DepartmentName,
                CurrencyId = e.CurrencyId,
                OriginalCurrencyId = e.OriginalCurrencyId,
                CurrencyName = e.CurrencyName,
                SupplierId = e.SupplierId,
                SupplierName = e.SupplierName,
                InventoryGroupId = e.InventoryGroupId,
                InventoryGroupName = e.InventoryGroupName,
                ApprovalStatus = e.ApprovalStatus,
                CheckBudgetStatus = e.CheckBudgetStatus,
                TotalPrice = e.TotalPrice,
                OriginalTotalPrice = e.OriginalTotalPrice,
                PurchasePurposeId = e.PurchasePurposeId,
                ExpenseDepartmentId = e.ExpenseDepartmentId,
                DocumentTypeId = e.DocumentTypeId,
                BudgetCodeId = e.BudgetCodeId,
                BudgetCode = e.BudgetCode,
                Note = e.Note,
                DocumentDate = e.DocumentDate,
                Products = products.ToList(),
                Attachments = attachments.ToList(),
                RequestNote = e.RequestNote,
                ReplyNote = e.ReplyNote,
            }).FirstOrDefault();

            return result;
        }
        #endregion

        #region -- Xóa yêu cầu
        [AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest_Delete)]
        public async Task Delete(long id)
        {
            var checkExits = await _urRepo.FirstOrDefaultAsync(e => e.Id == id);
            if (checkExits == null) throw new UserFriendlyException(400, L("URIsNotExisted"));
            else
            {
                await _urRepo.DeleteAsync(id);
            }
        }
        #endregion

        #region -- Tạo/Sửa yêu cầu thủ công
        [AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest_CreateOrEdit)]
        public async Task<long> CreateOrEditUserRequest(CreateOrEditUserRequestInputDto input)
        {
            var dbContext = CurrentUnitOfWork.GetDbContext<tmssDbContext>();

            if (input.Id == 0)
            {
                decimal exchangeUSD = 1;
                decimal exchangeVND = 1;

                var exChangeRateUSD = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = "VND", ToCurrency = "USD", ConversionDate = input.DocumentDate ?? DateTime.Now });
                var exChangeRateVND = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = input.OriginalCurrencyCode, ToCurrency = "VND", ConversionDate = input.DocumentDate ?? DateTime.Now });

                if (exChangeRateUSD.ToList().Count > 0) exchangeUSD = (decimal)exChangeRateUSD.Select(e => e.ConversionRate).FirstOrDefault();
                if (exChangeRateVND.ToList().Count > 0) exchangeVND = (decimal)exChangeRateVND.Select(e => e.ConversionRate).FirstOrDefault();

                UserRequest userRequest = new UserRequest
                {
                    UserRequestNumber = await _generateUrNumber.GenerateRequestNumber(GenSeqType.UserRequest),
                    UserRequestName = input.UserRequestName ?? "",
                    PicDepartmentId = input.PicDepartmentId,
                    InventoryGroupId = input.InventoryGroupId,
                    CurrencyId = input.CurrencyId,
                    OriginalCurrencyId = input.OriginalCurrencyId,
                    SupplierId = input.SupplierId,
                    PurchasePurposeId = input.PurchasePurposeId,
                    ExpenseDepartmentId = input.ExpenseDepartmentId,
                    DocumentId = input.DocumentId,
                    PurchaseOrganization = input.PurchaseOrganization,
                    TotalPrice = input.TotalPrice,
                    TotalPriceUsd = input.TotalPrice * exchangeUSD,
                    OriginalTotalPrice = input.OriginalTotalPrice,
                    ApprovalStatus = AppConsts.STATUS_NEW,
                    BudgetCodeId = input.BudgetCodeId,
                    Note = input.Note,
                    DocumentDate = input.DocumentDate ?? DateTime.Now
                };

                await dbContext.AddAsync(userRequest);
                await dbContext.SaveChangesAsync();

                long userRequestId = userRequest.Id;

                int lineNum = 1;
                foreach (var item in input.Products)
                {
                    UserRequestDetail userRequestDetail = new UserRequestDetail
                    {
                        UserRequestId = userRequestId,
                        InventoryGroupId = input.InventoryGroupId,
                        InventoryItemId = item.InventoryItemId,
                        CurrencyId = input.OriginalCurrencyId,
                        SupplierId = item.SupplierId,
                        UnitPrice = item.UnitPrice,
                        ExchangeUnitPrice = item.UnitPrice * exchangeVND,
                        Quantity = item.Quantity,
                        DeliveryDate = item.DeliveryDate,
                        UnitMeasLookupCode = item.Uom,
                        ProductName = item.ProductName,
                        BudgetCodeId = item.BudgetCodeId ?? input.BudgetCodeId,
                        LineTypeId = 1,
                        MonthN = item.MonthN,
                        MonthN1 = item.MonthN1,
                        MonthN2 = item.MonthN2,
                        MonthN3 = item.MonthN3,
                        LineNum = lineNum
                    };
                    await dbContext.AddAsync(userRequestDetail);
                    lineNum += 1;
                }
                return userRequestId;
            }
            else
            {
                var userRequest = await _urRepo.FirstOrDefaultAsync(e => e.Id == input.Id);
                if (userRequest == null) throw new UserFriendlyException(400, L("URIsNotExisted"));
                else
                {
                    ObjectMapper.Map(input, userRequest);

                    decimal exchangeUSD = 1;
                    decimal exchangeVND = 1;

                    var exChangeRateUSD = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = "VND", ToCurrency = "USD", ConversionDate = input.DocumentDate ?? DateTime.Now });
                    var exChangeRateVND = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = input.OriginalCurrencyCode, ToCurrency = "VND", ConversionDate = input.DocumentDate ?? DateTime.Now });

                    if (exChangeRateUSD.ToList().Count > 0) exchangeUSD = (decimal)exChangeRateUSD.Select(e => e.ConversionRate).FirstOrDefault();
                    if (exChangeRateVND.ToList().Count > 0) exchangeVND = (decimal)exChangeRateVND.Select(e => e.ConversionRate).FirstOrDefault();

                    userRequest.TotalPriceUsd = userRequest.TotalPrice * exchangeUSD;

                    var userRequestDetails = await _urDRepo.GetAll().Where(e => e.UserRequestId == userRequest.Id).ToListAsync();

                    var deleteProducts = userRequestDetails.Select(e => e.Id).Where(e => !input.Products.Select(p => p.Id).Contains(e));

                    foreach (var delete in deleteProducts)
                    {
                        await _urDRepo.DeleteAsync(e => e.Id == delete);
                    }

                    int lineNum = userRequestDetails.Max(e => e.LineNum) + 1 ?? 1;
                    foreach (var item in input.Products)
                    {
                        if (item.BudgetCodeId == null) item.BudgetCodeId = input.BudgetCodeId;
                        if (userRequestDetails.Any(e => e.Id == item.Id))
                        {
                            ObjectMapper.Map(item, userRequestDetails.Where(e => e.Id == item.Id).FirstOrDefault());
                        }
                        else
                        {
                            UserRequestDetail newUserRequestD = new UserRequestDetail
                            {
                                UserRequestId = userRequest.Id,
                                InventoryGroupId = input.InventoryGroupId,
                                InventoryItemId = item.InventoryItemId,
                                CurrencyId = item.CurrencyId,
                                SupplierId = item.SupplierId,
                                UnitPrice = item.UnitPrice,
                                ExchangeUnitPrice = item.UnitPrice * exchangeVND,
                                Quantity = item.Quantity,
                                DeliveryDate = item.DeliveryDate,
                                UnitMeasLookupCode = item.Uom,
                                ProductName = item.ProductName,
                                BudgetCodeId = item.BudgetCodeId ?? input.BudgetCodeId,
                                LineTypeId = 1,
                                MonthN = item.MonthN,
                                MonthN1 = item.MonthN1,
                                MonthN2 = item.MonthN2,
                                MonthN3 = item.MonthN3,
                                LineNum = lineNum
                            };

                            await dbContext.AddAsync(newUserRequestD);
                            lineNum += 1;
                        }
                    }
                }
                return userRequest.Id;
            }
        }
        #endregion

        #region -- Lấy thông tin người tạo yêu cầu
        public async Task<GetRequesterInfoForViewDto> GetRequesterInfo(long userId)
        {
            IEnumerable<GetRequesterInfoForViewDto> requester = await _dapper.QueryAsync<GetRequesterInfoForViewDto>("EXEC sp_PcsQueryRequesterInfo @UserId", new { userId });

            return requester.FirstOrDefault();
        }
        #endregion

        #region -- Validate Import Data
        [AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest_Import)]
        public async Task<UserRequestExcelDataDto> CheckValidateData(UserRequestExcelDataDto input)
        {
            decimal checkDecimal;

            if (!string.IsNullOrWhiteSpace(input.ProductCodeColor))
            {
                var seperateIndex = input.ProductCodeColor.IndexOf(".");
                input.ProductCode = seperateIndex != -1 ? input.ProductCodeColor.Substring(0, seperateIndex) : input.ProductCodeColor;
                input.ColorCode = seperateIndex != -1 ? input.ProductCodeColor.Substring(seperateIndex + 1) : "";

                var checkProduct = await _invRepo.FirstOrDefaultAsync(e => e.PartNo == input.ProductCode && e.Color == input.ColorCode && e.OrganizationId == 84);
                if (checkProduct != null)
                {
                    input.ProductId = checkProduct.Id;
                    input.InventoryGroupId = checkProduct.InventoryGroupId;
                    input.CurrencyId = checkProduct.CurrencyId;
                    input.SupplierId = checkProduct.SupplierId;
                    input.Uom = checkProduct.PrimaryUnitOfMeasure;
                    var itemPrice = await _invPriceRepo.FirstOrDefaultAsync(e => e.InventoryItemId == checkProduct.Id);

                    if (checkProduct.InventoryGroupId.HasValue)
                    {
                        var checkInventoryGroup = await _invGRepo.FirstOrDefaultAsync(e => e.Id == checkProduct.InventoryGroupId);
                        if (checkInventoryGroup != null)
                        {
                            input.InventoryGroupId = checkInventoryGroup.Id;
                            input.ProductGroupName = checkInventoryGroup.ProductGroupName;
                            input.PicDepartmentId = checkInventoryGroup.PicDepartmentId;
                        }
                    }

                    if (itemPrice != null) input.UnitPrice = itemPrice.UnitPrice;
                    if (string.IsNullOrWhiteSpace(input.ProductName)) input.ProductName = checkProduct.PartName;

                    if (checkProduct.CurrencyId.HasValue)
                    {
                        var itemCurrency = await _curRepo.FirstOrDefaultAsync(e => e.Id == checkProduct.CurrencyId);
                        if (itemCurrency != null)
                        {
                            input.CurrencyId = itemCurrency.Id;
                            input.CurrencyCode = itemCurrency.CurrencyCode;
                        }
                    }

                    if (string.IsNullOrWhiteSpace(input.VendorName) && checkProduct.SupplierId.HasValue)
                    {
                        var itemSup = await _supRepo.FirstOrDefaultAsync(e => e.Id == checkProduct.SupplierId);
                        if (itemSup != null)
                        {
                            input.SupplierId = itemSup.Id;
                            input.VendorCode = itemSup.SupplierNumber;
                            input.VendorName = itemSup.SupplierName;
                        }
                    }
                }
                else
                {
                    input.Exception += _localize.GetString("ProductIsNotExist");
                }
            }

            if (string.IsNullOrWhiteSpace(input.ProductCodeColor) && !string.IsNullOrWhiteSpace(input.ProductName))
            {
                var vndCurrency = await _curRepo.FirstOrDefaultAsync(e => e.CurrencyCode == "VND");
                input.CurrencyId = vndCurrency.Id;
                input.CurrencyCode = "VND";

                if (!string.IsNullOrWhiteSpace(input.Uom))
                {
                    var uom = await _uomRepo.FirstOrDefaultAsync(e => e.UnitOfMeasure == input.Uom);
                    if (uom != null) input.UomId = uom.Id;
                    else
                    {
                        uom = await _uomRepo.FirstOrDefaultAsync(e => e.UnitOfMeasure == "UNITS");
                        input.Uom = "UNITS";
                        input.UomId = uom.Id;
                    }
                }
                else
                {
                    var uom = await _uomRepo.FirstOrDefaultAsync(e => e.UnitOfMeasure == "UNITS");
                    input.Uom = "UNITS";
                    input.UomId = uom.Id;
                }
            }

            if (string.IsNullOrWhiteSpace(input.ProductCodeColor) && string.IsNullOrWhiteSpace(input.ProductName) && input.Deliveries.Sum(e => Decimal.Parse(e.Quantity)) > 0) input.Exception += _localize.GetString("ProductCodeOrProductNameIsRequired");

            //if (input.UnitPrice <= 0) input.Exception += _localize.GetString("PriceIsIncorrect");

            var checkDeliveryQty = input.Deliveries.Where(e => !string.IsNullOrWhiteSpace(e.Quantity));

            decimal checkQuantity = 0;

            foreach (var delivery in checkDeliveryQty)
            {
                if (!string.IsNullOrWhiteSpace(delivery.Quantity) && !Decimal.TryParse(delivery.Quantity, out checkDecimal))
                {
                    input.Exception += _localize.GetString("QuantityIsIncorrect");
                    break;
                }
                if (!string.IsNullOrWhiteSpace(delivery.Quantity) && Decimal.TryParse(delivery.Quantity, out checkDecimal)) checkQuantity = checkQuantity + Decimal.Parse(delivery.Quantity);
                if (!string.IsNullOrWhiteSpace(delivery.DeliveryDate) && DateTime.Parse(delivery.DeliveryDate).Date <= DateTime.Now.Date && Decimal.Parse(delivery.Quantity) > 0) input.Exception += _localize.GetString("DeliveryDateMustBeGreaterThanNow");
            }

            if (checkQuantity == 0) input.Exception += _localize.GetString("TotalQuantityIsZero");

            if (!string.IsNullOrWhiteSpace(input.VendorName))
            {
                var checkVendor = await _supRepo.FirstOrDefaultAsync(e => e.SupplierName.ToLower() == input.VendorName.ToLower());
                //if (checkVendor == null) input.Exception += _localize.GetString("VendorCodeIsIncorrect");
                if (checkVendor == null) input.SupplierId = checkVendor.Id;
            }

            input.SumQty = input.Deliveries.Where(e => e.Quantity != null).Sum(e => Decimal.Parse(e.Quantity));

            return input;
        }
        #endregion

        #region -- Export Template
        [AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest_Export)]
        public async Task<FileDto> ExportUserRequestTempalte()
        {
            string fileName = "CPS_Template_ImportUserRequest.xlsx";

            // Set License
            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = "";
            path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_ImportUserRequest.xlsx");

            var workBook = ExcelFile.Load(path);

            MemoryStream stream = new MemoryStream();
            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            workBook.Save(tempFile);

            stream = new MemoryStream(File.ReadAllBytes(tempFile));
            _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
            File.Delete(tempFile);
            stream.Position = 0;

            return await Task.FromResult(file);
        }
        #endregion

        #region -- Get UR to Create PR
        public async Task<PagedResultDto<GetAllUserRequestForPrDto>> GetAllUserRequestForPr(GetAllUserRequestForPrInputDto input)
        {
            IEnumerable<GetAllUserRequestForPrDto> userRequests = await _dapper.QueryAsync<GetAllUserRequestForPrDto>("EXEC sp_PcsQueryUserRequestForPr @UserRequestNumber, @PreparerId, @BuyerId, @SupplierId, @SupplierSiteId, @DocumentTypeId, @UserId, @FromDate, @ToDate, @MaxResultCount, @SkipCount",
                new { input.UserRequestNumber, input.PreparerId, input.BuyerId, input.SupplierId, input.SupplierSiteId, input.DocumentTypeId, AbpSession.UserId, input.FromDate, input.ToDate, input.MaxResultCount, input.SkipCount });

            var result = userRequests.AsQueryable();

            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;

            return new PagedResultDto<GetAllUserRequestForPrDto>(
                totalCount,
                result.ToList()
                );
        }
        #endregion

        #region -- Tạo UR từ Excel
        [AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest_Import)]
        public async Task<int> CreateUserRequestFromExcel(List<CreateUserRequestFromExcelInput> input)
        {
            var dbContext = CurrentUnitOfWork.GetDbContext<tmssDbContext>();
            int urCount = 0;

            var groupToRequests = input.GroupBy(e => new { e.InventoryGroupId, e.CurrencyId, e.CurrencyCode, e.SupplierId, e.PicDepartmentId }).Select(e => e).ToList();
            var vndCurrency = _curRepo.FirstOrDefault(e => e.CurrencyCode == "VND");
            foreach (var item in groupToRequests)
            {
                decimal exchangeUSD = 1;
                decimal exchangeVND = 1;

                var exChangeRateUSD = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = "VND", ToCurrency = "USD", ConversionDate = DateTime.Now });
                var exChangeRateVND = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = item.Key.CurrencyCode, ToCurrency = "VND", ConversionDate = DateTime.Now });

                if (exChangeRateUSD.ToList().Count > 0) exchangeUSD = (decimal)exChangeRateUSD.Select(e => e.ConversionRate).FirstOrDefault();
                if (exChangeRateVND.ToList().Count > 0) exchangeVND = (decimal)exChangeRateVND.Select(e => e.ConversionRate).FirstOrDefault();

                UserRequest userRequest = new UserRequest
                {
                    UserRequestNumber = await _generateUrNumber.GenerateRequestNumber(GenSeqType.UserRequest),
                    PicDepartmentId = item.Key.PicDepartmentId,
                    InventoryGroupId = item.Key.InventoryGroupId,
                    CurrencyId = vndCurrency.Id,
                    OriginalCurrencyId = item.Key.CurrencyId,
                    SupplierId = item.Key.SupplierId,
                    TotalPrice = item.Sum(e => e.TotalPrice) * exchangeVND,
                    OriginalTotalPrice = item.Sum(e => e.TotalPrice),
                    TotalPriceUsd = exchangeVND != 1 ? item.Sum(e => e.TotalPrice) * exchangeVND * exchangeUSD : item.Sum(e => e.TotalPrice) * exchangeUSD,
                    ApprovalStatus = AppConsts.STATUS_NEW,
                    DocumentDate = DateTime.Now
                };

                await dbContext.AddAsync(userRequest);
                await dbContext.SaveChangesAsync();

                long userRequestId = userRequest.Id;

                var urDetails = input.Where(e => e.InventoryGroupId == item.Key.InventoryGroupId && e.SupplierId == item.Key.SupplierId && e.CurrencyId == item.Key.CurrencyId).Select(e => e).ToList();

                foreach (var urDetail in urDetails)
                {
                    int lineNum = 1;
                    foreach (var delivery in urDetail.Deliveries.Where(e => Decimal.Parse(e.Quantity) > 0 && !string.IsNullOrWhiteSpace(e.DeliveryDate)))
                    {
                        UserRequestDetail userRequestDetail = new UserRequestDetail
                        {
                            UserRequestId = userRequestId,
                            InventoryGroupId = urDetail.InventoryGroupId,
                            InventoryItemId = urDetail.ProductId,
                            CurrencyId = urDetail.CurrencyId,
                            SupplierId = urDetail.SupplierId,
                            UnitPrice = urDetail.UnitPrice,
                            ExchangeUnitPrice = urDetail.UnitPrice * exchangeVND,
                            Quantity = Decimal.Parse(delivery.Quantity),
                            DeliveryDate = DateTime.Parse(delivery.DeliveryDate),
                            ProductName = urDetail.ProductName,
                            UnitMeasLookupCode = urDetail.Uom,
                            LineTypeId = 1,
                            MonthN = urDetail.MonthN != null ? Decimal.Parse(urDetail.MonthN) : 0,
                            MonthN1 = urDetail.MonthN1 != null ? Decimal.Parse(urDetail.MonthN1) : 0,
                            MonthN2 = urDetail.MonthN2 != null ? Decimal.Parse(urDetail.MonthN2) : 0,
                            MonthN3 = urDetail.MonthN3 != null ? Decimal.Parse(urDetail.MonthN3) : 0,
                            LineNum = lineNum
                        };
                        await dbContext.AddAsync(userRequestDetail);
                        lineNum += 1;
                    }
                }

                urCount++;
            }

            return urCount;
        }
        #endregion

        #region -- Chi tiết cây duyệt
        public async Task<List<GetAllApprovalInfoForViewDto>> GetAllApprovalInfo(long reqId, string processType)
        {
            IEnumerable<GetAllApprovalInfoForViewDto> approvalInfos = await _dapper.QueryAsync<GetAllApprovalInfoForViewDto>("EXEC sp_PcsQueryUserRequestApprovalTree @ReqId, @ProcessType",
                new {  reqId ,  processType });

            return approvalInfos.ToList();
        }
        #endregion

        #region -- Xuất Excel: User Request
        [AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest_Export)]
        public async Task<FileDto> ExportUserRequestToExcel(ExportUserRequestToExcelInput input)
        {
            string fileName = "";

            fileName = "PCS_Requisition_List_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".xlsx";

            IEnumerable<GetAllUserRequestInfoToExportDto> rawData;
            List<GetAllUserRequestInfoToExportDto> datas = new List<GetAllUserRequestInfoToExportDto>();
            List<string> userRequestGrouped = new List<string>();

            if (!input.IsIncludeDetail)
            {
                rawData = await _dapper.QueryAsync<GetAllUserRequestInfoToExportDto>("EXEC sp_PcsQueryUserRequestToExport_Header @UserId, @InventoryGroupId, @Status, @FromDate, @ToDate", new
                {
                    input.UserId,
                    input.InventoryGroupId,
                    input.Status,
                    input.FromDate,
                    input.ToDate
                });

                datas = rawData.ToList();
            }

            else
            {
                rawData = await _dapper.QueryAsync<GetAllUserRequestInfoToExportDto>("EXEC sp_PcsQueryUserRequestToExport_All @UserId, @InventoryGroupId, @Status, @FromDate, @ToDate", new
                {
                    input.UserId,
                    input.InventoryGroupId,
                    input.Status,
                    input.FromDate,
                    input.ToDate
                });

                datas = rawData.ToList();

                userRequestGrouped = rawData.GroupBy(e => new { e.UserRequestNumber }).Select(e => e.Key.UserRequestNumber).ToList();
            }

            // Set License
            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = "";
            if (!input.IsIncludeDetail) path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_ExportUserRequest_Header.xlsx");
            else path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_ExportUserRequest_All.xlsx");

            var workBook = ExcelFile.Load(path);
            var workSheet = workBook.Worksheets[0];

            int startRow = 5;
            int endRow = datas.Count;

            /* Stages */
            workSheet.Cells[1, 3].Value = (input.FromDate.HasValue ? $"{input.FromDate.Value.ToString("dd/MM/yyyy")} - " : "") + (input.ToDate.HasValue ? $"{input.ToDate.Value.ToString("dd/MM/yyyy")}" : "");

            #region -- Bindding Data
            if (endRow > 0)
            {
                #region -- Not Include Details
                if (!input.IsIncludeDetail)
                {
                    workSheet.Cells.GetSubrange($"A4:M{endRow + 5}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                    for (int i = 0; i < endRow; i++)
                    {
                        /* STT */
                        workSheet.Cells[startRow + i, 0].Value = i + 1;

                        /* Requisition No. */
                        workSheet.Cells[startRow + i, 1].Value = datas[i].UserRequestNumber ?? "";

                        /* Requisition Name */
                        workSheet.Cells[startRow + i, 2].Value = datas[i].UserRequestName ?? "";

                        /* Product Group Name */
                        workSheet.Cells[startRow + i, 3].Value = datas[i].ProductGroupName ?? "";

                        /* Requester Name */
                        workSheet.Cells[startRow + i, 4].Value = datas[i].RequestUser ?? "";

                        /* Request Date */
                        workSheet.Cells[startRow + i, 5].Value = datas[i].RequestDate ?? null;

                        /* Department */
                        workSheet.Cells[startRow + i, 6].Value = datas[i].DepartmentName ?? "";

                        /* Total Price */
                        workSheet.Cells[startRow + i, 7].Value = datas[i].TotalPrice ?? 0;

                        /* Currency */
                        workSheet.Cells[startRow + i, 8].Value = datas[i].CurrencyCode ?? "";

                        /* Status */
                        workSheet.Cells[startRow + i, 9].Value = datas[i].ApprovalStatus ?? "";

                        /* Budget Code */
                        workSheet.Cells[startRow + i, 10].Value = datas[i].BudgetCode ?? "";

                        /* Vendor Name */
                        workSheet.Cells[startRow + i, 11].Value = datas[i].SupplierName ?? "";

                        /* Note */
                        workSheet.Cells[startRow + i, 12].Value = datas[i].Note ?? "";
                    }
                }
                #endregion

                #region -- Include Details
                else
                {
                    workSheet.Cells.GetSubrange($"A4:T{endRow + 5}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                    for (int i = 0; i < endRow; i++)
                    {
                        /* STT */
                        workSheet.Cells[startRow + i, 0].Value = i + 1;

                        /* Requisition No. */
                        workSheet.Cells[startRow + i, 1].Value = datas[i].UserRequestNumber ?? "";

                        /* Requisition Name */
                        workSheet.Cells[startRow + i, 2].Value = datas[i].UserRequestName ?? "";

                        /* Product Group Name */
                        workSheet.Cells[startRow + i, 3].Value = datas[i].ProductGroupName ?? "";

                        /* Requester Name */
                        workSheet.Cells[startRow + i, 4].Value = datas[i].RequestUser ?? "";

                        /* Request Date */
                        workSheet.Cells[startRow + i, 5].Value = datas[i].RequestDate ?? null;

                        /* Department */
                        workSheet.Cells[startRow + i, 6].Value = datas[i].DepartmentName ?? "";

                        /* Total Price */
                        workSheet.Cells[startRow + i, 7].Value = datas[i].TotalPrice ?? 0;

                        /* Currency */
                        workSheet.Cells[startRow + i, 8].Value = datas[i].CurrencyCode ?? "";

                        /* Status */
                        workSheet.Cells[startRow + i, 9].Value = datas[i].ApprovalStatus ?? "";

                        /* Budget Code */
                        workSheet.Cells[startRow + i, 10].Value = datas[i].BudgetCode ?? "";

                        /* Vendor Name */
                        workSheet.Cells[startRow + i, 11].Value = datas[i].SupplierName ?? "";

                        /* Note */
                        workSheet.Cells[startRow + i, 12].Value = datas[i].Note ?? "";

                        /* Product Code */
                        workSheet.Cells[startRow + i, 13].Value = datas[i].ProductCode ?? "";

                        /* Product Name */
                        workSheet.Cells[startRow + i, 14].Value = datas[i].ProductName ?? "";

                        /* Uom */
                        workSheet.Cells[startRow + i, 15].Value = datas[i].Uom ?? "";

                        /* Quantity */
                        workSheet.Cells[startRow + i, 16].Value = datas[i].Quantity;

                        /* Price */
                        workSheet.Cells[startRow + i, 17].Value = datas[i].UnitPrice ?? 0;

                        /* Delivery Date */
                        workSheet.Cells[startRow + i, 18].Value = datas[i].DeliveryDate ?? null;

                        /* Budget Code */
                        workSheet.Cells[startRow + i, 19].Value = datas[i].BudgetCode ?? "";
                    }
                }
                #endregion
            }
            #endregion

            MemoryStream stream = new MemoryStream();
            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            workBook.Save(tempFile);

            stream = new MemoryStream(File.ReadAllBytes(tempFile));
            _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
            File.Delete(tempFile);
            stream.Position = 0;

            return await Task.FromResult(file);
        }
        #endregion

        #region -- Lấy thông tin nhà cung cấp
        public async Task<List<CommonAllSupplier>> GetAllSuppliers(string supplierFilter)
        {
            IEnumerable<CommonAllSupplier> suppliers = await _dapper.QueryAsync<CommonAllSupplier>("EXEC sp_PcsQuerySuppliers @SupplierFilter", new { SupplierFilter = supplierFilter });

            return suppliers.ToList();
        }
        #endregion

        #region -- Lấy thông tin tham chiếu
        public async Task<List<GetAllReferenceInfoForViewDto>> GetAllReferenceInfo(GetAllReferenceInfoInput input)
        {
            IEnumerable<GetAllReferenceInfoForViewDto> references = await _dapper.QueryAsync<GetAllReferenceInfoForViewDto>("EXEC sp_PcsQueryUserRequestReferenceInfo @ReqId, @ReferenceType", new { input.ReqId, input.ReferenceType });

            return references.ToList();
        }
        #endregion

        #region -- Lấy thông tin user cho combobox search
        public async Task<List<GetAllUserForComboboxDto>> GetAllUserForCombobox()
        {
            IEnumerable<GetAllUserForComboboxDto> result = await _dapper.QueryAsync<GetAllUserForComboboxDto>("EXEC sp_PcsQueryAllUserForCombobox");
            return result.ToList();
        }
        #endregion
    }
}
