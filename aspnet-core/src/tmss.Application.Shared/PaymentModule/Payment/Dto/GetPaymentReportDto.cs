using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.Payment.Dto
{
    public class GetPaymentReportDto
    {
        public long Id { get; set; }
        public string PaymentNo { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime RequestDuedate { get; set; }
        public string FormatRequestDate { get; set; }
        public string FormatRequestDuedate { get; set; }
        public string Description { get; set; }
        public long? EmployeeId { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long CreatorUserId { get; set; }
        public string CurrencyCode { get; set; }
        public decimal? TotalAmount { get; set; }
        public int TotalCount { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeDept { get; set; }
        public string SupplierName { get; set; }
        public string BankAccountName { get; set; }
        public string BankAccountNumber { get; set; }
        public string BankName { get; set; }
        public string VendorSiteCode { get; set; }
        public string CreatorName { get; set; }
        public string CreatorTitle { get; set; }
        public string Checker1 { get; set; }
        public string Checker2 { get; set; }
        public string Checker3 { get; set; }
        public string Checker4 { get; set; }
        public string Title1 { get; set; }
        public string Title2 { get; set; }
        public string Title3 { get; set; }
        public string Title4 { get; set; }
        public List<InputPaymentLinesDto> PaymentLines { get; set; }
    }
}
