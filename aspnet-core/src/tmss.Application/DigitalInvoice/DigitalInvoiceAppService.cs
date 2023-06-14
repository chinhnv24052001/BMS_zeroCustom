using Abp.Application.Services.Dto;
using Abp.Authorization.Users;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.Common.GeneratePurchasingNumber;
using tmss.DigitalInvoice;
using tmss.DigitalInvoice.Dto;
using tmss.EntityFrameworkCore;
using tmss.GR.Enum;
using tmss.Master;
using tmss.Master.PurchasePurpose;
using tmss.Master.PurchasePurpose.Dto;
using tmss.PaymentModule.Invoices;
using tmss.PaymentModule.Payment;
using tmss.PO;
using tmss.PR.PurchasingRequest;
using tmss.PR.PurchasingRequest.Dto;
using tmss.Price.Dto;

namespace tmss.DigitalInvoice
{
    public class DigitalInvoiceAppService : tmssAppServiceBase, IDigitalInvoiceAppService
    {
        private readonly IDapperRepository<InvTncApInterface, long> _repository;
        private readonly IRepository<InvTncApInterface, long> _repInterfaceHeader;
        private readonly IRepository<InvoiceHeaders, long> _repoInvoiceHeader;
        private readonly IRepository<InvoiceLines, long> _repoInvoiceLine;

        public DigitalInvoiceAppService(
            IDapperRepository<InvTncApInterface, long> repository,
            IRepository<InvTncApInterface, long> repInterfaceHeader,
            IRepository<InvoiceHeaders, long> repoInvoiceHeader, 
            IRepository<InvoiceLines, long> repoInvoiceLine)
        {
            _repository = repository;
            _repInterfaceHeader = repInterfaceHeader;
            _repoInvoiceHeader = repoInvoiceHeader;
            _repoInvoiceLine = repoInvoiceLine;
        }

        public async Task<PagedResultDto<DigitalInvoiceInfoDto>> GetAllDigitalInvoiceInfo(DigitalInvoiceSearchInput input)
        {
            string _sql = "EXEC sp_InvGetSearchEInvoice @InvoiceNum, @SerialNo, @SupplierNum, @Status, @MaxResultCount, @SkipCount";
            var result = await _repository.QueryAsync<DigitalInvoiceInfoDto>(_sql, new
            {
                @InvoiceNum = input.InvoiceNum,
                @SerialNo = input.SerialNo,
                @SupplierNum = input.SupplierNum,
                @Status = input.Status,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            });

            int totalCount = 0;
            if (result != null && result.Count() > 0)
            {
                totalCount = result.Count();
            }
            return new PagedResultDto<DigitalInvoiceInfoDto>(
                       totalCount,
                       result.ToList()
                      );
        }

        public async Task<DigitalInvoiceInfoDto> UpdatePoNo(long headerId, string poNo) {
            string _sql = "EXEC sp_InvUpdatePoNo @InterfaceHeaderId, @PoNo";

            var result = await _repository.QueryAsync<DigitalInvoiceInfoDto>(_sql, new
            {
                @InterfaceHeaderId = headerId,
                @PoNo = poNo
            });

            return result.FirstOrDefault();
        }

        public async Task<List<InvoiceAkabotFileDto>> GetAttachFile(long headerId)
        {
            string _sql = "EXEC sp_InvAkabotFiles @InvoiceHeaderId";

            var result = await _repository.QueryAsync<InvoiceAkabotFileDto>(_sql, new
            {
                @InvoiceHeaderId = headerId,
            });

            return result.ToList();
        }

        public async Task<List<DigitalInvoiceDetailInfoDto>> GetAllDigitalInvoiceDetailInfo(long headerId)
        {
            string _sql = "EXEC sp_InvGetEInvoiceLines @InterfaceHeaderId";
            var result = await _repository.QueryAsync<DigitalInvoiceDetailInfoDto>(_sql, new
            {
                @InterfaceHeaderId = headerId,
            });

            return result.ToList();
        }

        public async Task<List<DigitalInvoiceMatchResultsDto>> GetDigitalInvoiceMatchResults(long headerId)
        {
            string _sql = "EXEC sp_InvGetEInvoiceMatchResults @InterfaceHeaderId";
            var result = await _repository.QueryAsync<DigitalInvoiceMatchResultsDto>(_sql, new
            {
                @InterfaceHeaderId = headerId,
            });

            return result.ToList();
        }

        public async Task MatchInvoice(long headerId)
        {
            string _sql = "EXEC sp_InvAutoMapInvoice @pHeaderId";
            var result = await _repository.ExecuteAsync(_sql, new
            {
                @pHeaderId = headerId
            });
        }

        public async Task UnMatchInvoice(long headerId)
        {
            string _sql = "EXEC sp_InvUnMapInvoice @pHeaderId";
            var result = await _repository.ExecuteAsync(_sql, new
            {
                @pHeaderId = headerId
            });
        }

        public async Task confirmInvoice(List<DigitalInvoiceMatchResultsDto> confirmList)
        {
            for (int i = 0; i < confirmList.Count(); i++)
            {
                var item = confirmList[i];

                //_repInterfaceHeader.GetAll().FirstOrDefault(e => e.Id == confirmList[i].InterfaceHeaderId);
                string invoiceNum = item.InvoiceNum;
                long? vendorId = item.VendorId;

                if(!vendorId.HasValue) {

                }

                var currInv =  _repoInvoiceHeader.GetAll().AsNoTracking().Where(e => e.InvoiceNum == invoiceNum && e.VendorId == vendorId).FirstOrDefault();

                if (currInv != null) //update
                {

                }
                else { //insert 
                    currInv = new InvoiceHeaders() { 
                    };

                    await _repoInvoiceHeader.InsertAsync(currInv);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }

                var newLine = new InvoiceLines()
                {

                };
                // await _repoInvoiceLine.InsertAsync();
            }
        }

    }
}
