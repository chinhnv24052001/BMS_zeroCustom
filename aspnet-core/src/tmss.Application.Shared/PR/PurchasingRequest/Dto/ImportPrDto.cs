using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class ImportPrDto
    {
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductGroupName { get; set; }
        public string Uom { get; set; }
        public string OrganizationCode { get; set; }
        public string Comments { get; set; }
        public string Location { get; set; }
        public string BudgetCode { get; set; }
        public string UnitPrice { get; set; }
        public string Delivery1 { get; set; }
        public string Delivery2 { get; set; }
        public string Delivery3 { get; set; }
        public string Delivery4 { get; set; }
        public string Delivery5 { get; set; }
        public string Delivery6 { get; set; }
        public string Delivery7 { get; set; }
        public string Delivery8 { get; set; }
        public string Delivery9 { get; set; }
        public string Delivery10 { get; set; }
        public string Delivery11 { get; set; }
        public string Delivery12 { get; set; }
        public string Delivery13 { get; set; }
        public string Delivery14 { get; set; }
        public string Delivery15 { get; set; }
        public string Delivery16 { get; set; }
        public string Delivery17 { get; set; }
        public string Delivery18 { get; set; }
        public string Delivery19 { get; set; }
        public string Delivery20 { get; set; }
        public string Delivery21 { get; set; }
        public string Delivery22 { get; set; }
        public string Delivery23 { get; set; }
        public string Delivery24 { get; set; }
        public string Delivery25 { get; set; }
        public string Delivery26 { get; set; }
        public string Delivery27 { get; set; }
        public string Delivery28 { get; set; }
        public string Delivery29 { get; set; }
        public string Delivery30 { get; set; }
        public string Delivery31 { get; set; }
        public string MonthN { get; set; }
        public string MonthN1 { get; set; }
        public string MonthN2 { get; set; }
        public string MonthN3 { get; set; }
        public string VendorName { get; set; }
        public string VendorSite { get; set; }
        public string Exception { get; set; }
        public string Remark { get; set; }
        public bool CanBeImported()
        {
            return string.IsNullOrEmpty(Exception);
        }
    }
}
