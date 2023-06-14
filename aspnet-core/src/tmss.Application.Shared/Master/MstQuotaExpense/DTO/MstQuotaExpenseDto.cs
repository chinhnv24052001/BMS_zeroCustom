using System;

namespace tmss.Master.Dto
{
    public class MstQuotaExpenseDto
    {
        public long Id { get; set; }
        public string QuotaCode { get; set; }
        public string QuotaName { get; set; }
        public int? QuotaType { get; set; }
        public string OrgId { get; set; }
        public int? TitleId { get; set; }
        public decimal? QuotaPrice { get; set; }
        public long CurrencyCode { get; set; }
        public string CurrencyName { get; set; }
        public DateTime? StartDate{ get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? CreationDate { get; set; }
        public string Status { get; set; }
        public string QuoTypeStr { get; set; }
        public string TitleName { get; set; }
        public string OrgName { get; set; }
    }
}
