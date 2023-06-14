using Castle.MicroKernel.SubSystems.Conversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Prepayment.Dto
{
    public class CheckDto
    {
        public bool IsValid { get; set; }
    }
}
