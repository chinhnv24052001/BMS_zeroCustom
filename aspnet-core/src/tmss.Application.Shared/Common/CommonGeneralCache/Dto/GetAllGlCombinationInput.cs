using tmss.Dto;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class GetAllGlCombinationInput : PagedAndSortedInputDto
    {
        public string BudgetCode { get; set; }
    }
}
