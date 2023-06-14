
using tmss.Dto;

namespace tmss.Master.Dto
{
    public class InputSearchMstProject: PagedAndSortedInputDto
    {
        public string ProjectCode { get; set; }
        public string ProjectName { get; set; }
    }
}
