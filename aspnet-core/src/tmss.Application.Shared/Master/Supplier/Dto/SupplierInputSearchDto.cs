using tmss.Dto;

namespace tmss.Master.Supplier.Dto
{
    public class SupplierInputSearchDto : PagedAndSortedInputDto
    {
        public string SupplierName { get; set; }
        public string VatRegistrationNum { get; set; }
        public string VatRegistrationInvoice { get; set; }
        public string SupplierNumber { get; set; }
    }
}

