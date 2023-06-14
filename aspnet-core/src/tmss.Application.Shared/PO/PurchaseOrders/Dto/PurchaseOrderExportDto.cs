using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class PurchaseOrderExportDto
    {
        public string OrderDate { get; set; }
        public string OrderNo { get; set; }
        public string Vendor { get; set; }
        public string Tel { get; set; }
        public string Fax { get; set; }
        public string Attention { get; set; }
        public string SupplierBankAcount { get; set; }
        public string Checker { get; set; }
        public string AcName { get; set; }
        public string AcNo { get; set; }
        public string Shipment { get; set; }
        public string DeliveryDate { get; set; }
        public string DeliveryPlace { get; set; }
        public string DeliveryShip { get; set; }
        public string PriceBasis { get; set; }
        public string OrderAmount { get; set; }
        public string PaidBy { get; set; }
        public string PaymentTerm { get; set; }
        public string Other { get; set; }
        public string Warranty { get; set; }
        public string OrderContact { get; set; }
        public string CtFaxNo { get; set; }
        public string CtTel { get; set; }
        public string CtEmail { get; set; }
        public string ShipInfo { get; set; }
        public string BillingTo { get; set; }
        public string UserSign { get; set; }
        public string DepartmentSign { get; set; }
        public string Mst { get; set; }
        //public List<GetProductForExportDeventoryDto> ListProductForExport { get; set; }
        public List<GetProductForExportDto> ListProductForExport { get; set; }

    }
}
