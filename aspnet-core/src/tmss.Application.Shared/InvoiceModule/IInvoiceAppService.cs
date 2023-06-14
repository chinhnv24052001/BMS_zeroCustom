using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.InvoiceModule.Dto;

namespace tmss.InvoiceModule
{
    public interface IInvoiceAppService : IApplicationService
    {       
        Task<PagedResultDto<SearchInvoiceOutputDto>> getInvoiceSearch(SearchInvoiceInputDto input);
        Task<List<SearchInvoiceOutputDetailDto>> getInvoiceSearchDetail(long invoiceId,string status);
        Task<List<GetPoVendorDto>> getPoVendorById(long vendorId,string removeId);
        Task<List<VendorComboboxDto>> getAllVendor();
        Task<List<CurrencyComboboxDto>> getAllCurrency(); Task<string> SaveInvoice(SearchInvoiceOutputDto input);
        Task<InvImportMultipleDto> ImportMultipleInvoice(byte[] files);
        Task<byte[]> ListPOExportExcel(List<GetPoVendorDto> v_list_export_excel);
        Task<List<GetPoVendorDto>> ImportData(byte[] files);
        //Task ReadXmlManual(byte[] fileBytes);
    }
}
