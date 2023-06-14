using tmss.Dto;

namespace tmss.Master.Assess.Dto
{
    public class AssessSearchInput : PagedAndSortedInputDto
    {
        public string SearchValue { get; set; }
    }
}