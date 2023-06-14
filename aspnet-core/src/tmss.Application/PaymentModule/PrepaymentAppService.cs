using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.PaymentModule.Invoices;
using tmss.PaymentModule.Payment;
using tmss.PaymentModule.Payment.Dto;
using tmss.PaymentModule.Prepayment;
using tmss.PaymentModule.Prepayment.Dto;
using tmss.PO;

namespace tmss.Master
{
    public class PrepaymentAppService : tmssAppServiceBase, IPrepaymentAppService
    {

        private readonly IRepository<PaymentPrepayment, long> _repository;
        private readonly IRepository<PaymentHeaders, long> _paymentHeader;
        private readonly IRepository<MstSuppliers, long> _supplier;
        private readonly IRepository<PoHeaders, long> _poHeader;
        private readonly IRepository<PoLines, long> _poLine;
        private readonly IRepository<PaymentPrepaymentInvoice, long> _prepaymentInvoice;
        private readonly IRepository<InvoiceHeaders, long> _invoice;
        private readonly IDapperRepository<PaymentPrepayment, long> _dapperRepo;

        public PrepaymentAppService(
            IRepository<PaymentPrepayment, long> repository,
            IRepository<PaymentHeaders, long> paymentHeader,
            IRepository<MstSuppliers, long> supplier,
            IRepository<PoHeaders, long> poHeader,
            IRepository<PoLines, long> poLine,
            IRepository<PaymentPrepaymentInvoice, long> prepaymentInvoice,
            IRepository<InvoiceHeaders, long> invoice,
            IDapperRepository<PaymentPrepayment, long> dapperRepo
            )
        {
            _repository = repository;
            _paymentHeader = paymentHeader;
            _supplier = supplier;
            _poHeader = poHeader;
            _poLine = poLine;
            _prepaymentInvoice = prepaymentInvoice;
            _invoice = invoice;
            _dapperRepo = dapperRepo;
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_Prepayment_Search)]
        public async Task<PagedResultDto<PaymentPrepaymentDto>> getAllPrepayment(SearchPrepaymentsDto input)
        {
            var filtered = from r in _repository.GetAll().AsNoTracking()
                           join pay in _paymentHeader.GetAll().AsNoTracking() on r.PaymentHeaderId equals pay.Id into a 
                           from pay in a.DefaultIfEmpty() 
                           join v in _supplier.GetAll().AsNoTracking() on r.VendorId equals v.Id
                           join inv in _invoice.GetAll().AsNoTracking() on r.InvoiceId equals inv.Id into c
                           from inv in c.DefaultIfEmpty()
                           where (string.IsNullOrEmpty(input.PoNo) || r.PoNo.Equals(input.PoNo))
                           && (input.VendorId == -1 || r.VendorId.Equals(input.VendorId))
                           orderby r.AdvancedDate descending 
                           select new PaymentPrepaymentDto()
                                 {
                                     Id = r.Id,
                                     PoHeaderId = r.PoHeaderId,
                                     PoNo = r.PoNo,
                                     VendorId = r.VendorId,
                                     VendorSiteId = r.VendorSiteId,
                                     Amount = r.Amount,
                                     AdvancedDate = r.AdvancedDate,
                                     IsPaymentAdded = r.IsPaymentAdded,
                                     IsAppliedInvoice = r.IsAppliedInvoice,
                                     PaymentId = r.PaymentId,
                                     PaymentNo = pay.PaymentNo,
                                     PaymentRequestDate = pay.RequestDate,
                                     SupplierName = v.SupplierName,
                                     InvoiceNum =  inv.InvoiceNum,
                                     InvoiceDate = inv.InvoiceDate
                           };

            return new PagedResultDto<PaymentPrepaymentDto>(
                       filtered.Count(),
                       filtered.ToList()
                      );
        }

        public async Task<PagedResultDto<GetPoHeadersDto>> getAllPOs(SearchPrepaymentsDto input)
        {
            //var filtered = from r in _poHeader.GetAll().AsNoTracking()
            //               join v in _supplier.GetAll().AsNoTracking() on r.VendorId equals v.Id
            //               where (string.IsNullOrEmpty(input.PoNo) || r.Segment1.Equals(input.PoNo))
            //                    && (input.VendorId == -1 || r.VendorId.Equals(input.VendorId))
            //                    && r.AuthorizationStatus == "APPROVED"
            //               select new GetPoHeadersDto()
            //               {
            //                  // Id = r.Id,
            //                   PoNo = r.Segment1,
            //                   VendorName = v.SupplierName,
            //                   ApprovedDate = r.ApprovedDate,
            //                   VendorId = v.Id,
            //                   PoHeaderId = r.Id
            //               };

            string _sql = @"Exec [dbo].[sp_PaymentPrepaymentGetPOs] 
                           @PoNo
                          ,@VendorId
                          ,@MaxResultCount
                          ,@SkipCount
                         ";

            var filtered = await _dapperRepo.QueryAsync<GetPoHeadersDto>(_sql, new
            {
                PoNo = input.PoNo,
                VendorId = input.VendorId ?? -1,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount
            });

            return new PagedResultDto<GetPoHeadersDto>(
                       filtered.Count(),
                       filtered.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_Prepayment_Delete)]
        public async Task Delete(long id)
        {
            PaymentPrepayment mstUnitOfMeasure = await _repository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstUnitOfMeasure != null)
            {
                await _repository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, AppConsts.ValRecordsDelete);
            }
        }

        public async Task<PaymentPrepaymentDto> LoadById(long id)
        {
            var listUnitOfMeasure = from r in _repository.GetAll().AsNoTracking()
                                    where r.Id == id
                                    select new PaymentPrepaymentDto()
                                    {
                                        Id = r.Id,
                                        PoNo = r.PoNo,
                                        VendorId = r.VendorId,
                                        VendorSiteId = r.VendorSiteId,
                                        Amount = r.Amount,
                                        AdvancedDate = r.AdvancedDate,
                                        IsPaymentAdded = r.IsPaymentAdded,
                                        PaymentId = r.PaymentId,
                                        PoHeaderId = r.PoHeaderId,
                                        IsAppliedInvoice = r.IsAppliedInvoice
                                    };
            return listUnitOfMeasure.FirstOrDefault();
        }

        public async Task Save(PaymentPrepaymentDto paymentObj)
        {
            string errMsg = await IsDataValid(paymentObj);
            if (!string.IsNullOrEmpty(errMsg))
            {

                throw new UserFriendlyException(400, errMsg);
            }
            else
            {
                if (paymentObj.Id > 0)
                {
                    await Update(paymentObj);
                }
                else
                {
                    await Create(paymentObj);
                }
            }
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_Prepayment_Add)]
        private async Task Create(PaymentPrepaymentDto obj)
        {
            PaymentPrepayment newRow = new PaymentPrepayment();
            newRow = ObjectMapper.Map<PaymentPrepayment>(obj);
             await _repository.InsertAsync(newRow);
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_Prepayment_Edit)]
        private async Task Update(PaymentPrepaymentDto obj)
        {
            PaymentPrepayment curObj = await _repository.GetAll().AsNoTracking().FirstOrDefaultAsync(p => p.Id == obj.Id);
            curObj = ObjectMapper.Map<PaymentPrepayment>(obj);
            await _repository.UpdateAsync(curObj);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
        public async Task<string> IsDataValid(PaymentPrepaymentDto newPayment)
        {
            string _sql = @"Exec [dbo].[sp_PaymentCheckPrepayment] 
                           @Id
                          ,@poHeaderId
                          ,@pAmount
                         ";

            var filtered = await _dapperRepo.QueryAsync<CheckDto>(_sql, new
            {
                @Id = newPayment.Id,
                poHeaderId = newPayment.PoHeaderId ?? -1,
                pAmount = newPayment.Amount
            });

            var check = filtered.ToList().FirstOrDefault();

            if (check.IsValid)
            {
                return string.Empty;
            }
            else {
                return "Advance quá số lượng còn lại của PO";
            }
        }

        
    }
}
