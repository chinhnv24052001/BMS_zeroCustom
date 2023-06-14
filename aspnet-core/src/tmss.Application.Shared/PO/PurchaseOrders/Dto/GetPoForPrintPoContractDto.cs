using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetPoForPrintPoContractDto
    {
        public long Id { get; set; }
        public string PoNumber { get; set; }
        public DateTime? SignDate { get; set; }
        public string PersonSign { get ; set; }
        public string TitlePersonSign { get ; set; }
        public string SupplierName { get; set; }
        public string SupplierAddrress { get; set; }
        public string SupplierPhone { get; set; }
        public string SupplierTaxCode { get; set; }
        public string SupplierContact { get; set; }
        public string SupplierTitle { get; set; }
        public string SupplierBankAccount { get; set; }
        public string SupplierBankName { get; set; }
        public string Description { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? TaxPrice { get; set; }
        public decimal? TaxTotalPrice { get; set; }

    }
}
