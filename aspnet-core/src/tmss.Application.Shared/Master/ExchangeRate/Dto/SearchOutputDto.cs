using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ExchangeRate.Dto
{
    public class SearchOutputDto
    {
        public long Id { get; set; }
        /// <summary>
        /// Ngoại tệ
        /// </summary>
        public string FromCurrency { get; set; }
        /// <summary>
        /// Đơn vị quy đổi
        /// </summary>
        public string ToCurrency { get; set; }
        /// <summary>
        /// Tỉ giá
        /// </summary>
        public double? ConversionRate { get; set; }
        /// <summary>
        /// Hiệu lực từ ngày
        /// </summary>
        public DateTime? ConversionDate { get; set; }
    }
}
