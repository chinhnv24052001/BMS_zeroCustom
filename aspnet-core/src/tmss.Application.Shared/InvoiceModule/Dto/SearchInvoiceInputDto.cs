
using System;
using tmss.Dto;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace tmss.InvoiceModule.Dto
{
    public class SearchInvoiceInputDto : PagedAndSortedInputDto    
    {
        /// <summary>
        /// Số hóa đơn
        /// </summary>
        public string InvoiceNum { get; set; }
        
        /// <summary>
        /// Ký hiệu hóa đơn
        /// </summary>
        public string InvoiceSymbol { get; set; }
        public string VendorNumber { get; set; }
        public int VendorId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        [StringLength(15)]
        public string Status { get; set; }
        public string Source { get; set; }
        public string PoNumber { get; set; }
        [StringLength(255)]
        public string VatRegistrationInvoice { get; set; }
        public DateTime? CreateInvoiceDate { get; set; }
        public long? PicUserId { get; set; }
    }
}
