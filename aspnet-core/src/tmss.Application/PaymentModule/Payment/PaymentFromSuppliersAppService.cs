using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.DigitalInvoice.Dto;
using tmss.PaymentModule.Prepayment;
using tmss.PaymentModule.Payment.Dto;
using tmss.PaymentModule.Prepayment.Dto;
using System.Collections;
using System.Linq.Dynamic.Core;
using Abp.EntityFrameworkCore.Uow;
using tmss.EntityFrameworkCore;
using Abp.Authorization.Roles;
using tmss.PaymentModule.Invoices;
using PayPalCheckoutSdk.Orders;
using tmss.Common.Dto;
using tmss.Authorization.Users;
using tmss.GR.Enum;
using tmss.Common.GeneratePurchasingNumber;
using tmss.Master;
using System.IO;
using tmss.Authorization.Users.Profile;
using tmss.GR.Dto.ReceiptNote;
using Abp.UI;
using tmss.Authorization;
using Abp.Authorization;

namespace tmss.PaymentModule.Payment
{
    public class PaymentFromSuppliersAppService : tmssAppServiceBase, IPaymentFromSuppliers
    {
        private readonly IRepository<PaymentFromSuppliers, long> _paymentHeadersRepository;
        private readonly IDapperRepository<PaymentFromSuppliers, long> _dapperRepository;
        private readonly IRepository<InvoiceHeaders, long> _invoiceHeaderRepo;
        private readonly IRepository<User, long> _userRepository;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGenerateNum;
        private readonly IRepository<MstSuppliers, long> _suppliersRepo;
        private readonly IRepository<PaymentFromSupplierAttachments, long> _attachment;
        private readonly IProfileAppService _profileAppService;

        public PaymentFromSuppliersAppService(IRepository<PaymentFromSuppliers, long> paymentHeadersRepository,
            IDapperRepository<PaymentFromSuppliers, long> spRepository,
            IRepository<InvoiceHeaders, long> invoiceHeaderRepo,
            IRepository<User, long> userRepository,
            ICommonGeneratePurchasingNumberAppService commonGenerateNum,
            IRepository<MstSuppliers, long> suppliersRepo,
            IRepository<PaymentFromSupplierAttachments, long> attachment,
            IProfileAppService profileAppService
            )
        {
            _paymentHeadersRepository = paymentHeadersRepository;
            _dapperRepository = spRepository;
            _invoiceHeaderRepo = invoiceHeaderRepo;
            _userRepository = userRepository;
            _commonGenerateNum = commonGenerateNum;
            _suppliersRepo = suppliersRepo;
            _attachment = attachment;
            _profileAppService = profileAppService;
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Search)]
        public async Task<PagedResultDto<PaymentFromSuppliersDto>> getAllPayment(FilterPaymentFromSupliersDto input)
        {
            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            string _sql = "EXEC sp_PaymentFromSuppliers_search @PaymentNo, @RequestDateFrom, @RequestDateTo, @VendorId, @Status, @InvoiceNumber, @PoNo, @MaxResultCount, @SkipCount";
            var result = await _dapperRepository.QueryAsync<PaymentFromSuppliersDto>(_sql, new
            {
                @PaymentNo = input.PaymentNo,
                @RequestDateFrom = input.RequestDateFrom,
                @RequestDateTo = input.RequestDateTo,
                @VendorId = input.VendorId,
                @Status = input.Status,
                @InvoiceNumber = input.InvoiceNumber,
                @PoNo = input.PoNo,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            });

            int totalCount = 0;
            if (result != null && result.Count() > 0)
            {
                totalCount = result.Count();
            }
            return new PagedResultDto<PaymentFromSuppliersDto>(
                       totalCount,
                       result.ToList()
                      );
        }
        public async Task<PagedResultDto<GetInvoiceHeadersDto>> getAllInvoices(FilterInvoiceHeadersDto input)
        {
            string _sql = "EXEC sp_PaymentFromSuppliersGetAllInvoices @InvoiceNum, @VendorId, @VendorSiteId, @MaxResultCount, @SkipCount";
            var result = ( await _dapperRepository.QueryAsync<GetInvoiceHeadersDto>(_sql, new
            {
                @InvoiceNum = input.InvoiceNum,
                @VendorId = input.VendorId,
                @VendorSiteId = input.VendorSiteId,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();

            int totalCount = 0;
            if (result != null && result.Count() > 0)
            {
                totalCount = result[0].TotalCount;
            }

            return new PagedResultDto<GetInvoiceHeadersDto>(
                    totalCount,
                    result
                    );
           
            //return result.ToList();
        }

        public async Task<PagedResultDto<GetPoHeadersDto>> getPOsForPaymentRequestFromNCC(SearchPosForReceiptNotesDto input)
        {
            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            {
                input.VendorId = supplierId;
            }

            string _sql = @"EXEC sp_PaymentFromSuppliersGetAllPOs 
                            @PoNo
                          ,@VendorId
                          ,@VendorSiteId
                          ,@MaxResultCount
	                      ,@SkipCount";

            input.VendorId = input.VendorId ?? -1;
            input.VendorSiteId = input.VendorSiteId ?? -1;

            var filtered = (await _dapperRepository.QueryAsync<GetPoHeadersDto>(_sql, new
            {
                @PoNo = input.PoNo,
                @VendorId = input.VendorId ?? -1,
                @VendorSiteId = input.VendorSiteId ?? -1,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();

            int totalCount = 0;
            if (filtered != null && filtered.Count() > 0)
            {
                totalCount = (int)filtered[0].TotalCount;
            }
            return new PagedResultDto<GetPoHeadersDto>(
                       totalCount,
                       filtered
                      );
        }

        public async Task<string> IsDataValid(InputPaymentFromSuppliersDto newPayment)
        {
            string _sql = @"Exec [dbo].[sp_PaymentFromSuppliersCheckPoTotalPrice] 
                           @Id
                          ,@poHeaderId
                          ,@pTotalAmount
                         ";

            var filtered = await _dapperRepository.QueryAsync<CheckDto>(_sql, new
            {
                @Id = newPayment.Id,
                poHeaderId = newPayment.PoHeaderId ?? -1,
                pTotalAmount = newPayment.TotalAmount
            });

            var check = filtered.ToList().FirstOrDefault();

            if (check.IsValid)
            {
                return string.Empty;
            }
            else
            {
                return "Advance quá số lượng còn lại của PO";
            }
        }

        // create for payment

        public async Task CreateOrEditPayment(InputPaymentFromSuppliersDto paymentHeadersDto)
        {
            string errMsg = await IsDataValid(paymentHeadersDto);
            if (!string.IsNullOrEmpty(errMsg))
            {
                throw new UserFriendlyException(400, errMsg);
            }
            
            if (paymentHeadersDto.Id > 0)
            {
                await updatePayment(paymentHeadersDto);
            }
            else
            {
                await createPayment(paymentHeadersDto);
            }
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Add)]
        public async Task createPayment(InputPaymentFromSuppliersDto input)
        {
            string paymentNo = await _commonGenerateNum.GenerateRequestNumber(GenSeqType.PaymentFromSupplier);
            var payment = ObjectMapper.Map<PaymentFromSuppliers>(input);
            payment.PaymentNo = "SP" + paymentNo;
            payment.CreatorUserId = AbpSession.UserId;
            var result = await _paymentHeadersRepository.InsertAsync(payment);
            await CurrentUnitOfWork.SaveChangesAsync();

            List<InvoiceHeaders> invoiceToUpdate = new List<InvoiceHeaders>();

            if (input.InvoiceId > 0) //add manually
            {
                var obj = ObjectMapper.Map<InvoiceHeaders>(await _invoiceHeaderRepo.FirstOrDefaultAsync(e => e.Id.Equals(input.InvoiceId)));
                //obj.IsPaid = true;
                invoiceToUpdate.Add(obj);
            }

            //add attachments
            foreach (PaymentFromSupplierAttachmentsDto inputShipmentLineDto in input.Attachments)
            {
                PaymentFromSupplierAttachments attachFileLine = new PaymentFromSupplierAttachments();
                attachFileLine = ObjectMapper.Map<PaymentFromSupplierAttachments>(inputShipmentLineDto);
                attachFileLine.PaymentHeaderId = payment.Id;

                await _attachment.InsertAsync(attachFileLine);
            }

            CurrentUnitOfWork.GetDbContext<tmssDbContext>().UpdateRange(invoiceToUpdate.ToList());
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<List<PaymentFromSupplierAttachmentsDto>> getAllAttachmentsByHeaderID(long? headerid)
        {
            var listPaymentLine = from a in _attachment.GetAll().AsNoTracking()
                                  where a.PaymentHeaderId == headerid
                                  select new PaymentFromSupplierAttachmentsDto()
                                  {
                                      Id = a.Id,
                                      PaymentHeaderId = a.PaymentHeaderId,
                                      ServerFileName = a.ServerFileName,
                                      ServerLink = a.ServerLink,
                                      ContentType = a.ContentType,
                                  };
            var result = listPaymentLine;
            return result.ToList();
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Edit)]
        public async Task updatePayment(InputPaymentFromSuppliersDto input)
        {
            var newRcvShipmentHeader = _paymentHeadersRepository.GetAll().AsNoTracking().FirstOrDefault(e => e.Id == input.Id);
            var payment = ObjectMapper.Map(input, newRcvShipmentHeader);

            //var payment = ObjectMapper.Map<PaymentFromSuppliers>(input);
            var result = await _paymentHeadersRepository.UpdateAsync(payment);
            await CurrentUnitOfWork.SaveChangesAsync();

            //add & update attachments
            var currAttachment = _attachment.GetAll().AsNoTracking().Where(e => e.PaymentHeaderId == input.Id);
            var newAttachments = input.Attachments.Select(e => e.ServerFileName).ToList();

            var deletedAttachments = currAttachment.Where(e => !newAttachments.Contains(e.ServerFileName)).ToList();
            foreach (var inputShipmentLineDto in input.Attachments)
            {
                if (inputShipmentLineDto.Id <= 0)
                {
                    PaymentFromSupplierAttachments attachFileLine = new PaymentFromSupplierAttachments();
                    attachFileLine = ObjectMapper.Map<PaymentFromSupplierAttachments>(inputShipmentLineDto);
                    attachFileLine.PaymentHeaderId = input.Id;

                    await _attachment.InsertAsync(attachFileLine);
                }
            }
            var folderName = "wwwroot";
            var pathToSave = Directory.GetCurrentDirectory() + "/" + folderName;

            foreach (PaymentFromSupplierAttachments temp in deletedAttachments)
            {
                var fullPath = pathToSave + "/" + temp.ServerLink;
                if (File.Exists(fullPath)) File.Delete(fullPath);
                await _attachment.HardDeleteAsync(temp);
            }
            //end add & update attachments
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task Delete(long id)
        {
            var payment = ObjectMapper.Map<PaymentFromSuppliers>(_paymentHeadersRepository.FirstOrDefault(id));
            await _paymentHeadersRepository.HardDeleteAsync(payment);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Cancel)]
        public async Task CancelPayment(long id)
        {
            var payment = ObjectMapper.Map<PaymentFromSuppliers>(_paymentHeadersRepository.FirstOrDefault(id));
            payment.Status = 2; 
            await _paymentHeadersRepository.UpdateAsync(payment);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_SendToTMV)]
        public async Task SendPaymentToTMV(long id)
        {
            var payment = await _paymentHeadersRepository.FirstOrDefaultAsync(id);
            payment.Status = 1;
            await _paymentHeadersRepository.UpdateAsync(payment);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<GetPaymentReportDto> getPaymentReportById(long? id)
        {
            var listPayment = from a in _paymentHeadersRepository.GetAll().AsNoTracking()
                              join s in _suppliersRepo.GetAll().AsNoTracking() on a.VendorId equals s.Id
                              join us in _userRepository.GetAll().AsNoTracking() on a.CreatorUserId equals us.Id into e
                              from us in e.DefaultIfEmpty()
                              where a.Id == id
                              select new GetPaymentReportDto()
                              {
                                  Id = a.Id,
                                  PaymentNo = a.PaymentNo,
                                  RequestDate = a.RequestDate,
                                  RequestDuedate = a.RequestDuedate,
                                  Description = a.Description,
                                  EmployeeId = a.EmployeeId,
                                  VendorId = a.VendorId,
                                  VendorSiteId = a.VendorSiteId,
                                  CurrencyCode = a.CurrencyCode,
                                  TotalAmount = a.TotalAmount,
                                  SupplierName = s.SupplierName,
                                  EmployeeName = us.FullName,
                                  EmployeeCode = us.EmployeeCode,
                                  EmployeeDept = "",
                                  BankAccountName  = a.BankAccountName,
                                  BankAccountNumber  = a.BankAccountNumber,
                                  BankName  = a.BankName + "-" + a.BankBranchName,
                                };
            GetPaymentReportDto reportObj = await listPayment.FirstOrDefaultAsync();

            //var listPaymentLine = from a in _paymentLinesRepository.GetAll().AsNoTracking()
            //                      where a.PaymentHeaderId == id
            //                      select new InputPaymentLinesDto()
            //                      {
            //                          Id = a.Id,
            //                          InvoiceId = a.InvoiceId,
            //                          InvoiceAmount = a.InvoiceAmount,
            //                          InvoiceDate = a.InvoiceDate,
            //                          PaymentHeaderId = a.PaymentHeaderId,
            //                          PaymentAmount = a.PaymentAmount,
            //                          InvoiceNumber = a.InvoiceNumber,
            //                          IsAdjustmentInvoice = a.IsAdjustmentInvoice,
            //                          PrepaymentAmount = a.PrepaymentAmount,
            //                          PoNo = a.PoNo
            //                      };

            //if (listPaymentLine.Count() > 0)
            //{
            //    reportObj.PaymentLines = await listPaymentLine.ToListAsync();
            //}
            return reportObj;
        }
    }
}
