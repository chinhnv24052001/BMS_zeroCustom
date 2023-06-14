using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.GlCode.Dto
{
    public class SearchGlCodeOutputDto
    {
        public long Id { get; set; }
        /// <summary>
        /// Mã ngân sách
        /// </summary>
        public string ConcatenatedSegments { get; set; }
        /// <summary>
        /// Tên ngân sách
        /// </summary>
        public string BudgetName { get; set; }
    }
}
