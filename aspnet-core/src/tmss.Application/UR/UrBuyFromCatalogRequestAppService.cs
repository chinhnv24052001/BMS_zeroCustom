using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Common.CommonGeneralCache.Dto;
using tmss.Common.GeneratePurchasingNumber;
using tmss.EntityFrameworkCore;
using tmss.GR.Enum;
using tmss.Master;
using tmss.RequestApproval;
using tmss.RequestApproval.Dto;
using tmss.UR.BuyFromCatalogRequest;
using tmss.UR.BuyFromCatalogRequest.Dto;

namespace tmss.UR
{
    [AbpAuthorize(AppPermissions.UserRequest_BuyRequestFromCatalog)]
    public class UrBuyFromCatalogRequestAppService : ApplicationService, IUrBuyFromCatalogRequestAppService
    {
        private readonly IRepository<ShoppingCart, long> _shopCartRepo;
        private readonly IRepository<ShoppingCartDetail, long> _shopCartDRepo;
        private readonly IDapperRepository<MstInventoryItems, long> _dapper;
        private readonly ICommonGeneratePurchasingNumberAppService _seqGenerator;
        private readonly IRequestApprovalTreeAppService _sentRequestInf;
        private readonly IWebHostEnvironment _env;
        private readonly IRepository<MstCurrency, long> _curRepo;

        public UrBuyFromCatalogRequestAppService(
            IRepository<ShoppingCart, long> shopCartRepo,
            IRepository<ShoppingCartDetail, long> shopCartDRepo,
            IDapperRepository<MstInventoryItems, long> dapper,
            ICommonGeneratePurchasingNumberAppService seqGenerator,
            IRequestApprovalTreeAppService sentRequestInf,
            IWebHostEnvironment env,
            IRepository<MstCurrency, long> curRepo
            )
        {
            _shopCartRepo = shopCartRepo;
            _shopCartDRepo = shopCartDRepo;
            _dapper = dapper;
            _seqGenerator = seqGenerator;
            _sentRequestInf = sentRequestInf;
            _env = env;
            _curRepo = curRepo;
        }

        public async Task<PagedResultDto<GetAllCatalogProductForViewDto>> GetAllCatalogProducts(GetAllCatalogProductInput input)
        {
            IEnumerable<GetAllCatalogProductForViewDto> products = await _dapper.QueryAsync<GetAllCatalogProductForViewDto>("EXEC sp_PcsQueryCatalogProducts @ProductName, @SupplierName, @InventoryGroupId, @MaxResultCount, @SkipCount",
                                                                    new { input.ProductName, input.SupplierName, input.InventoryGroupId, input.MaxResultCount, input.SkipCount });

            var result = products.AsQueryable();

            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;

            return new PagedResultDto<GetAllCatalogProductForViewDto>(
                totalCount,
                result.ToList()
                );
        }

        public async Task<string> GetFullDirectory()
        {
            var folderName = Path.Combine("wwwroot", "AttachFile", "CatalogPriceImages");
            return Path.Combine(_env.ContentRootPath, folderName);
        }

        [AbpAuthorize(AppPermissions.UserRequest_BuyRequestFromCatalog_Create)]
        public async Task<int> CreateBuyRequest(List<CreateBuyRequestFromCatalogDto> items)
        {
            var dbContext = CurrentUnitOfWork.GetDbContext<tmssDbContext>();

            ShoppingCart shoppingCart = new ShoppingCart
            {
                Status = true,
            };

            await dbContext.AddAsync(shoppingCart);
            await dbContext.SaveChangesAsync();

            long shoppingId = shoppingCart.Id;

            if (items.Any(e => e.Qty < 0)) throw new UserFriendlyException(400, "Quantity can not less than 0!");
            foreach (var item in items)
            {
                ShoppingCartDetail shoppingCartD = new ShoppingCartDetail
                {
                    Qty = item.Qty,
                    ShoppingCartId = shoppingId,
                    InventoryItemId = item.InventoryItemId,
                    ProductName = item.ProductName,
                    InventoryGroupId = item.InventoryGroupId,
                    PicDepartmentId = item.PicDepartmentId,
                    CurrencyId = item.CurrencyId,
                    SupplierId = item.SupplierId,
                    UnitPrice = item.UnitPrice,
                    TaxPrice = item.TaxPrice,
                    Uom = item.Uom,
                    DeliveryDate = item.DeliveryDate,
                    BudgetCodeId = item.BudgetCodeId,
                    DocumentDate = item.DocumentDate ?? DateTime.Now,
                    CurencyCode = item.CurrencyCode,
                    HeaderBudgetCodeId = item.HeaderBudgetCodeId,
                    UserRequestName = item.UserRequestName
                };
                await dbContext.AddRangeAsync(shoppingCartD);
                await dbContext.SaveChangesAsync();
            }

            var groupToRequests = _shopCartDRepo.GetAll().Where(e => e.ShoppingCartId == shoppingId).AsEnumerable().GroupBy(e => new { e.InventoryGroupId, e.CurrencyId, e.CurencyCode, e.SupplierId, e.PicDepartmentId, e.DocumentDate, e.HeaderBudgetCodeId, e.UserRequestName }).Select(e => e).ToList();

            int urCount = 0;
            var vndCurrency = await _curRepo.FirstOrDefaultAsync(e => e.CurrencyCode == "VND");

            foreach (var request in groupToRequests)
            {
                decimal exchangeVND = 1;
                decimal exchangeUSD = 1;

                var exChangeRateVND = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = request.Key.CurencyCode, ToCurrency = "VND", ConversionDate = request.Key.DocumentDate });
                var exChangeRateUSD = await _dapper.QueryAsync<CommonGetGlExchangeRateDto>("EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate", new { FromCurrency = "VND", ToCurrency = "USD", ConversionDate = request.Key.DocumentDate });

                if (exChangeRateVND.ToList().Count > 0) exchangeVND = (decimal)exChangeRateVND.Select(e => e.ConversionRate).FirstOrDefault();
                if (exChangeRateUSD.ToList().Count > 0) exchangeUSD = (decimal)exChangeRateUSD.Select(e => e.ConversionRate).FirstOrDefault();
                UserRequest userRequest = new UserRequest
                {
                    UserRequestNumber = await _seqGenerator.GenerateRequestNumber(GenSeqType.UserRequest),
                    ShoppingCartId = shoppingId,
                    PicDepartmentId = request.Key.PicDepartmentId,
                    InventoryGroupId = request.Key.InventoryGroupId,
                    CurrencyId = vndCurrency.Id,
                    OriginalCurrencyId = request.Key.CurrencyId,
                    SupplierId = request.Key.SupplierId,
                    TotalPrice = request.Sum(e => e.UnitPrice * e.Qty * exchangeVND),
                    OriginalTotalPrice = request.Sum(e => e.UnitPrice * e.Qty),
                    TotalPriceUsd = request.Sum(e => e.UnitPrice * e.Qty * exchangeVND) * exchangeUSD,
                    ApprovalStatus = AppConsts.STATUS_NEW,
                    DocumentDate = request.Key.DocumentDate,
                    BudgetCodeId = request.Key.HeaderBudgetCodeId,
                    UserRequestName = request.Key.UserRequestName
                };

                await dbContext.AddAsync(userRequest);
                await dbContext.SaveChangesAsync();

                long requestId = userRequest.Id;

                var input = new CreateRequestApprovalInputDto();
                input.ReqId = requestId;
                input.ProcessTypeCode = "UR";
                await _sentRequestInf.CreateRequestApprovalTree(input);

                int lineNum = 1;
                foreach (var reqD in request)
                {
                    UserRequestDetail userRequestD = new UserRequestDetail
                    {
                        UserRequestId = requestId,
                        ShoppingCartDetailId = reqD.Id,
                        InventoryItemId = reqD.InventoryItemId,
                        ProductName = reqD.ProductName,
                        InventoryGroupId = reqD.InventoryGroupId,
                        CurrencyId = reqD.CurrencyId,
                        SupplierId = reqD.SupplierId,
                        Quantity = reqD.Qty,
                        UnitPrice = reqD.UnitPrice,
                        ExchangeUnitPrice = reqD.UnitPrice * exchangeVND,
                        TaxPrice = reqD.TaxPrice,
                        UnitMeasLookupCode = reqD.Uom,
                        DeliveryDate = reqD.DeliveryDate,
                        LineTypeId = 1,
                        BudgetCodeId = reqD.BudgetCodeId,
                        LineNum = lineNum
                    };
                    await dbContext.AddRangeAsync(userRequestD);
                    lineNum += 1;
                }
                urCount += 1;
            }

            return urCount;
        }
    }
}
