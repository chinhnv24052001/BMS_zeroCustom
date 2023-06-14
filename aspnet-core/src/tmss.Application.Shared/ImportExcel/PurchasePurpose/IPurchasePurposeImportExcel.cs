using Abp.Dependency;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.ImportExcel.Product.Dto;
using tmss.ImportExcel.PurchasePurpose.Dto;

namespace tmss.ImportExcel.PurchasePurpose
{
    public interface IPurchasePurposeImportExcelAppService : ITransientDependency
    {
        Task<List<PurchasePurposeImportDto>> GetListPurchasePurposeFromExcel(byte[] fileBytes, string fileName);
    }
}
