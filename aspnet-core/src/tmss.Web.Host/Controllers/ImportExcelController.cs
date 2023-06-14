using Abp.AspNetCore.Mvc.Authorization;
using tmss.Authorization;
using tmss.Storage;
using Abp.BackgroundJobs;
using tmss.ImportExcel;
using tmss.ImportExcel.Product;
using tmss.PO.PurchaseOrders;
using tmss.ImportExcel.PurchasePurpose;
using tmss.ImportExcel.Bms.Segment;

namespace tmss.Web.Controllers
{
    public class ImportExcelController : ImportExcelControllerBase
    {
        public ImportExcelController(IProductImportExcelAppService _productImportExcel, IImportPurchaseOrdersAppService _importPurchaseOrdersAppService,
             IPurchasePurposeImportExcelAppService _ipurchasePurposeImportExcelAppService, ISegmentExcelAppService _segmentAppService)
            : base(_productImportExcel, _importPurchaseOrdersAppService, _ipurchasePurposeImportExcelAppService, _segmentAppService)
        {
        }
    }
}