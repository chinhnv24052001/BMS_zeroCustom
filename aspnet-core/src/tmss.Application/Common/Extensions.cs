using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Common
{
    public static class Extensions
    {
        public static string ToFriendlyErrorMsg(this string value)
        {
            if (string.IsNullOrEmpty(value))
                return "";
            if (value.IndexOf("unique") > 0)
            {
                return "Data is duplicated!";
            }
            else if (value.IndexOf("DELETE statement") > 0)
            {
                return "This data is in use. Can not delete!";
            }
            return value;
        }
    }
}
