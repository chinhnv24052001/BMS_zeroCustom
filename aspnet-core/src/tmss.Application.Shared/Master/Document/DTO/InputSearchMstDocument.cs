
using tmss.Dto;

namespace tmss.Master.Dto
{
    public class InputSearchMstDocument: PagedAndSortedInputDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
    }
}
