using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class InputContractBackdateDto
    {
        public long Id { get; set; }
        public int? ExpiryBackdate { get; set; }
        public string NoteOfBackdate { get; set; }
    }
}
