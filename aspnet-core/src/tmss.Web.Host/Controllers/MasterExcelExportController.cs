using Abp.AspNetZeroCore.Net;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.BMS.Master.BmsPeriod;
using tmss.BMS.Master.BmsPeriod.Dto;
using tmss.InvoiceModule;
using tmss.InvoiceModule.Dto;
using tmss.Master;
using tmss.Master.Dto;
using tmss.Master.ExchangeRate;
using tmss.Master.ExchangeRate.Dto;
using tmss.Master.InventoryCodeConfig;
using tmss.Master.InventoryCodeConfig.Dto;
using tmss.Master.InventoryGroup;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.InventoryItems;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.Master.Project.DTO;
using tmss.Master.UnitOfMeasure;
using tmss.Master.UnitOfMeasure.Dto;

namespace tmss.Web.Controllers
{
    [ApiExplorerSettings(IgnoreApi = true)]
    [Route("api/[controller]")]
    public class MasterExcelExportController : tmssControllerBase
    {
        private readonly IMstProjectAppService _I_Mst_Project;
        private readonly IMstQuotaExpenseAppService _I_Mst_QoutaExpense;
        private readonly IMstProductGroupAppService _I_Mst_ProductGroup;
        private readonly IMstDocumentAppService _I_Mst_Document;
        private readonly IMstInventoryItemsAppService _I_Mst_InventoryItems;
        private readonly IMstInventoryGroupAppService _I_Mst_InventoryGroup;
        private readonly IMstGlExchangeRateAppService _I_Mst_GlExchangeRate;
        private readonly IMstUnitOfMeasureAppService _I_Mst_UnitOfMeasure;
        private readonly IMstInventoryCodeConfigAppService _I_Mst_InventoryCodeConfig;
        private readonly IInvoiceAppService _I_Invoice;
        private readonly IBmsMstPeriodAppService _I_BmsMstPeriodAppService;
        private readonly IBmsPeriodVersionAppService _I_BmsPeriodVersionAppService;


        public MasterExcelExportController(
            IMstProjectAppService I_Mst_Project,
            IMstQuotaExpenseAppService I_Mst_QoutaExpense,
            IMstProductGroupAppService I_Mst_ProductGroup,
            IMstDocumentAppService I_Mst_Document,
            IMstInventoryItemsAppService I_Mst_InventoryItems,
            IMstInventoryGroupAppService I_Mst_InventoryGroup,
            IMstUnitOfMeasureAppService UnitOfMeasure,
            IMstGlExchangeRateAppService I_Mst_GlExchangeRate,
            IMstInventoryCodeConfigAppService I_Mst_InventoryCodeConfig,
            IInvoiceAppService I_Invoice,
            IBmsMstPeriodAppService I_BmsMstPeriodAppService,
            IBmsPeriodVersionAppService I_BmsPeriodVersionAppService
            )
        {
            _I_Mst_Project = I_Mst_Project;
            _I_Mst_QoutaExpense = I_Mst_QoutaExpense;
            _I_Mst_ProductGroup = I_Mst_ProductGroup;
            _I_Mst_Document = I_Mst_Document;
            _I_Mst_InventoryItems = I_Mst_InventoryItems;
            _I_Mst_InventoryGroup = I_Mst_InventoryGroup;
            _I_Mst_UnitOfMeasure = UnitOfMeasure;
            _I_Mst_GlExchangeRate = I_Mst_GlExchangeRate;
            _I_Mst_InventoryCodeConfig = I_Mst_InventoryCodeConfig;
            _I_Invoice = I_Invoice;
            _I_BmsMstPeriodAppService = I_BmsMstPeriodAppService;
            _I_BmsPeriodVersionAppService = I_BmsPeriodVersionAppService;
        }

        [HttpPost("[action]")]
        public async Task<ActionResult>GetMstProjectExportExcel([FromBody] InputExportProjectDto input)
        {
            return File(await _I_Mst_Project.MstProjectExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstProject.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstQuotaExpenseExportExcel([FromBody] InputExportQuotaExpenseDto input)
        {
            return File(await _I_Mst_QoutaExpense.MstQuotaExpenseExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstQuotaExpense.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstProductGroupExportExcel([FromBody] InputProductGroupDto input)
        {
            return File(await _I_Mst_ProductGroup.MstProductGroupExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstProductGroup.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstDocumentExportExcel([FromBody] InputDocumentDto input)
        {
            return File(await _I_Mst_Document.MstDocumentExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstDocument.xlsx");
        }


        [HttpPost("[action]")]
        public async Task<ActionResult> MstInventoryItemsExportExcel([FromBody] InputInventoryItemsSearchInputDto input)
        {
            return File(await _I_Mst_InventoryItems.MstInventoryItemsExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstInventoryItems.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstInventoryGroupExportExcel([FromBody] InputMstInventoryGroupExportDto input)
        {
            return File(await _I_Mst_InventoryGroup.MstInventoryGroupExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstInventoryGroup.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstGlExchangeRateExportExcel([FromBody] InputMstGlExchangeRateExportDto input)
        {
            return File(await _I_Mst_GlExchangeRate.MstGlExchangeRateExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstInventoryGroup.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstOUMExportExcel([FromBody] InputUOMExportDto input)
        {
            return File(await _I_Mst_UnitOfMeasure.MstOUMExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstInventoryGroup.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstInventoryCodeConfigExportExcel([FromBody] InputSearchInventoryCodeConfigDto input)
        {
            return File(await _I_Mst_InventoryCodeConfig.MstInventoryCodeConfigExportExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "MstInventoryGroup.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> ListPOExportExcel([FromBody] List<GetPoVendorDto> v_list_export_excel)
        {
            return File(await _I_Invoice.ListPOExportExcel(v_list_export_excel), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "ListPOItems.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstPeriodExportExcel([FromBody] SearchPeriodDto input)
        {
            return File(await _I_BmsMstPeriodAppService.GetPeriodToExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "BmsPeriod.xlsx");
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> MstPeriodVersionExportExcel([FromBody] SearchPeriodVersionDto input)
        {
            return File(await _I_BmsPeriodVersionAppService.GetPeriodVersionToExcel(input), MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet, "BmsPeriodVerion.xlsx");
        }
    }
}
