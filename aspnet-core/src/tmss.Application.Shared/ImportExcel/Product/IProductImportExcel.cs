using Abp.Dependency;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.ImportExcel.Product.Dto;

namespace tmss.ImportExcel.Product
{
    public interface IProductImportExcelAppService : ITransientDependency
    {
        Task<List<ProductImportDto>> GetListProductFromExcel(byte[] fileBytes, string fileName);
    }
}