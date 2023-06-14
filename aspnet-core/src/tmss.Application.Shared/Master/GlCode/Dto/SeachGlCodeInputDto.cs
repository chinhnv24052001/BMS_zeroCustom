using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.GlCode.Dto
{
    public class SeachGlCodeInputDto : PagedAndSortedInputDto
    {
        public string Keyword { get; set; }
    }
}
