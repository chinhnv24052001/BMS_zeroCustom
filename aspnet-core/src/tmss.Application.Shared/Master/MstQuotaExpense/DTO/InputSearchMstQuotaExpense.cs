
using tmss.Dto;

namespace tmss.Master.Dto
{
    public class InputSearchMstQuotaExpense : PagedAndSortedInputDto
    {
        public string QuotaCode { get; set; }
        public int QuoType { get; set; }
    }
}
