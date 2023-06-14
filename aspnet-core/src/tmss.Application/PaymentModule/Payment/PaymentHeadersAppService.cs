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
using tmss.Config;
using NPOI.SS.Formula.Functions;
using tmss.Config.Dto;
using Microsoft.AspNetCore.Mvc;
using tmss.Authorization;
using Abp.Authorization;
using tmss.RequestApproval;

namespace tmss.PaymentModule.Payment
{
    public class PaymentHeadersAppService : tmssAppServiceBase, IPaymentHeadersAppService
    {
        private readonly IRepository<PaymentHeaders, long> _paymentHeadersRepository;
        private readonly IRepository<PaymentLines, long> _paymentLinesRepository;
        private readonly IDapperRepository<PaymentHeaders, long> _dapperRepository;
        private readonly IRepository<PaymentPrepaymentInvoice, long> _prepaymentInvoiceRepo;
        private readonly IRepository<PaymentPrepayment, long> _prepaymentRepo;
        private readonly IRepository<InvoiceHeaders, long> _invoiceHeaderRepo;
        private readonly IRepository<User, long> _userRepository;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGenerateNum;
        private readonly IRepository<MstSuppliers, long> _suppliersRepo;
        private readonly IRepository<PaymentAttachments, long> _attachment;
        private readonly IRepository<PaymentPrepayment, long> _prepayment;
        private readonly IRepository<PaymentPrepaymentInvoice, long> _prepaymentInvoice;
        private readonly ICfgGenerateReportAppService _genReport;
        private readonly IRepository<CfgReportTemplate, long> _cfgRepo;
        private readonly IRepository<CfgReportTemplateTable, long> _cfgTableRepo;
        private readonly IRepository<RequestApprovalStep, long> _stepRepo;
        private readonly IRepository<RequestApprovalStepUser, long> _stepUserRepo;
        private readonly IRepository<MstPosition, long> _posRepo;
        private readonly IRepository<MstTitles, long> _titleRepo;
        private readonly IRepository<CfgReportTemplateTableColumn, long> _cfgTableColumnRepo;
        private readonly IRepository<MstSupplierBankAccount, long> _bankRepo;
        private readonly IRepository<InvoiceLines, long> _invoiceLine;
        private readonly IRepository<MstCurrency, long> _currencyRepo;

        public PaymentHeadersAppService(IRepository<PaymentHeaders, long> paymentHeadersRepository,
            IRepository<PaymentLines, long> paymentLinesRepository,
            IDapperRepository<PaymentHeaders, long> spRepository,
            IRepository<PaymentPrepaymentInvoice, long> prepaymentInvoiceRepo,
            IRepository<PaymentPrepayment, long> prepaymentRepository,
            IRepository<InvoiceHeaders, long> invoiceHeaderRepo,
            IRepository<User, long> userRepository,
            ICommonGeneratePurchasingNumberAppService commonGenerateNum,
            IRepository<MstSuppliers, long> suppliersRepo,
            IRepository<PaymentAttachments, long> attachment,
            IRepository<PaymentPrepayment, long> prepayment,
            IRepository<PaymentPrepaymentInvoice, long> prepaymentInvoice,
            ICfgGenerateReportAppService genReport,
            IRepository<CfgReportTemplate, long> cfgRepo,
            IRepository<CfgReportTemplateTable, long> cfgTableRepo,
            IRepository<RequestApprovalStep, long> stepRepo,
            IRepository<RequestApprovalStepUser, long> stepUserRepo,
            IRepository<MstPosition, long> posRepo,
            IRepository<MstTitles, long> titleRepo,
            IRepository<CfgReportTemplateTableColumn, long> cfgTableColumnRepo,
            IRepository<MstSupplierBankAccount, long> bankRepo,
            IRepository<InvoiceLines, long> invoiceLine,
            IRepository<MstCurrency, long> currencyRepo
            )
        {
            _paymentHeadersRepository = paymentHeadersRepository;
            _paymentLinesRepository = paymentLinesRepository;
            _dapperRepository = spRepository;   
            _prepaymentInvoiceRepo = prepaymentInvoiceRepo;
            _prepaymentRepo = prepaymentRepository;
            _invoiceHeaderRepo = invoiceHeaderRepo;
            _userRepository = userRepository;
            _commonGenerateNum = commonGenerateNum;
            _suppliersRepo = suppliersRepo;
            _attachment = attachment;
            _prepayment = prepayment;
            _prepaymentInvoice = prepaymentInvoice;
            _genReport = genReport;
            _cfgRepo = cfgRepo;
            _cfgTableRepo = cfgTableRepo;
            _stepRepo = stepRepo;
            _stepUserRepo = stepUserRepo;
            _posRepo = posRepo;
            _titleRepo = titleRepo;
            _cfgTableColumnRepo = cfgTableColumnRepo;
            _bankRepo = bankRepo;
            _invoiceLine = invoiceLine;
            _currencyRepo = currencyRepo;
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequest_Search)]
        public async Task<PagedResultDto<PaymentHeadersDto>> getAllPayment(FilterPaymentHeadersDto input)
        {
            string _sql = "EXEC sp_PaymentHeaders_search @PaymentNo,@InvoiceNo,@PoNo, @RequestDateFrom, @RequestDateTo, @VendorId, @EmployeeId, @Status, @AuthorizationStatus, @MaxResultCount, @SkipCount ";
            var result = (await _dapperRepository.QueryAsync<PaymentHeadersDto>(_sql, new
            {
                @PaymentNo = input.PaymentNo,
                @InvoiceNo = input.InvoiceNo,
                @PoNo = input.PoNo,
                @RequestDateFrom = input.RequestDateFrom,
                @RequestDateTo = input.RequestDateTo,
                @VendorId = input.VendorId,
                @EmployeeId = input.EmployeeId,
                @Status = input.Status,
                @AuthorizationStatus = input.AuthorizationStatus,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();

            int totalCount = 0;
            if (result != null && result.Count() > 0)
            {
                totalCount = result[0].TotalCount;
            }
            return new PagedResultDto<PaymentHeadersDto>(
                       totalCount,
                       result
                      );
        }

        //public async Task<PaymentHeadersDto> getPaymentHeaderById(long id)
        //{
        //    string _sql = "EXEC sp_PaymentHeaders_SearchById  ";
        //    var result = (await _dapperRepository.QueryAsync<PaymentHeadersDto>(_sql, new
        //    {
        //        @Id = id,
               
        //    })).FirstOrDefault();

        //    return result;
        //}
        public async Task<PagedResultDto<GetInvoiceHeadersDto>> getAllInvoices(FilterInvoiceHeadersDto input)
        {
            string _sql = "EXEC sp_PaymentGetAllInvoices @InvoiceNum, @VendorId, @VendorSiteId, @MaxResultCount , @SkipCount,@CurrencyCode";
            var filtered = (await _dapperRepository.QueryAsync<GetInvoiceHeadersDto>(_sql, new
            {
                @InvoiceNum = input.InvoiceNum,
                @VendorId = input.VendorId,
                @VendorSiteId = input.VendorSiteId,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount,
                @CurrencyCode = input.CurrencyCode,
            })).ToList();

            int totalCount = 0;
            if (filtered != null && filtered.Count() > 0)
            {
                totalCount = (int)filtered[0].TotalCount;
            }

            return new PagedResultDto<GetInvoiceHeadersDto>(
                        totalCount,
                        filtered
                        );
        }

        public async Task<PagedResultDto<GetPrepaymentDto>> getAllPrepaymentForInvoices(SearchPrepaymentsDto input)
        {
            string _sql = "EXEC sp_PaymentGetAllPrepayments @PoNo, @VendorId, @VendorSiteId, @InvoiceId";
            var result = await _dapperRepository.QueryAsync<GetPrepaymentDto>(_sql, new
            {
                @PoNo = input.PoNo,
                @VendorId = input.VendorId,
                @VendorSiteId = input.VendorSiteId,
                @InvoiceId = input.InvoiceId,

            });

            return new PagedResultDto<GetPrepaymentDto>(
                       result.Count(),
                       result.ToList()
                      );
        }

        public async Task<byte[]> getDataForPrint(long id)
        {
            var fieldData = await getPaymentReportById(id);

            

            fieldData.CreatorName = "";
            fieldData.Checker1 = "";
            fieldData.Checker2 = "";
            fieldData.Checker3 = "";
            fieldData.Checker4 = "";

            fieldData.CreatorTitle = "";
            fieldData.Title1 = "";
            fieldData.Title1 = "";
            fieldData.Title1 = "";
            fieldData.Title1 = "";

            fieldData.CreatorName = fieldData.EmployeeName ?? "";
            var creator = await _userRepository.FirstOrDefaultAsync(e => e.Id == (fieldData.CreatorUserId == 0 ? fieldData.EmployeeId : fieldData.CreatorUserId));
            if (creator != null)
            {
                if (creator.TitlesId != null)  fieldData.CreatorTitle = (await _titleRepo.FirstOrDefaultAsync((long)creator.TitlesId)).Code ?? "";
            }
            


            var steps = _stepRepo.GetAll().Where(e => e.ReqId == id && e.ProcessTypeCode == "PM" && e.ApprovalStatus != AppConsts.STATUS_SKIP && e.ApprovalStatus != AppConsts.STATUS_FORWARD).ToList();
            for (int i = 0; i < steps.Count()-1; i++)
            {
                if (i == 0)
                {
                    var stepUser = await _stepUserRepo.FirstOrDefaultAsync(e => e.RequestApprovalStepId == steps[i].Id);
                    if (stepUser != null)
                    {
                        var checker = await _userRepository.FirstOrDefaultAsync(e => e.Id == stepUser.ApprovalUserId);
                        if(checker != null){
                            fieldData.Title1 = (await _titleRepo.FirstOrDefaultAsync((long)checker.TitlesId)).Code ?? "";
                       
                        fieldData.Checker1 = checker.FullName ?? "";
                        }
                        
                    }
                    
                }
                else if (i == 1)
                {
                    var stepUser = await _stepUserRepo.FirstOrDefaultAsync(e => e.RequestApprovalStepId == steps[i].Id);
                    if (stepUser != null)
                    {
                        var checker = await _userRepository.FirstOrDefaultAsync(e => e.Id == stepUser.ApprovalUserId);
                        if (checker != null){
                            if (checker.TitlesId != null) fieldData.Title2 = (await _titleRepo.FirstOrDefaultAsync((long)checker.TitlesId)).Code ?? "";
                            fieldData.Checker2 = checker.FullName ?? "";
                        }

                    }
                }
                else if (i == 2)
                {
                    var stepUser = await _stepUserRepo.FirstOrDefaultAsync(e => e.RequestApprovalStepId == steps[i].Id);
                    if (stepUser != null)
                    {
                        var checker = await _userRepository.FirstOrDefaultAsync(e => e.Id == stepUser.ApprovalUserId);
                        if (checker != null){
                            if (checker.TitlesId != null)  fieldData.Title3 = (await _titleRepo.FirstOrDefaultAsync((long)checker.TitlesId )).Code ?? "";
                            fieldData.Checker3 = checker.FullName ?? "";
                        }

                    }
                }

            }
            if (steps.Count() > 0)
            {
                var lastStepUser = await _stepUserRepo.FirstOrDefaultAsync(e => e.RequestApprovalStepId == steps[steps.Count() - 1].Id);
                if (lastStepUser != null)
                {
                    var lastChecker = await _userRepository.FirstOrDefaultAsync(e => e.Id == lastStepUser.ApprovalUserId);
                    if (lastChecker != null)
                    {
                        if (lastChecker.TitlesId != null) fieldData.Title4 = (await _titleRepo.FirstOrDefaultAsync((long)lastChecker.TitlesId)).Code ?? "";
                        fieldData.Checker4 = lastChecker.FullName ?? "";
                    }

                }
            }
            
            //var lastStepUser = await _stepUserRepo.FirstOrDefaultAsync(e => e.RequestApprovalStepId == steps[steps.Count()-1].Id);
            //var lastChecker = await _userRepository.FirstOrDefaultAsync(e => e.Id == lastStepUser.ApprovalUserId);
            //fieldData.Title4 = _posRepo.FirstOrDefault(e => e.Id == lastChecker.PositionId).PositionCode;
            //fieldData.Checker4 = lastChecker.FullName;



            var fileByte =  await _genReport.CreateReport("PAYMENTREQUEST", fieldData);

            return fileByte;
        }


        public async Task ApplyPrepaymentForInvoices(List<GetPrepaymentDto> checkPayment, long invoiceId)
        {

            var currentCheckedList = _prepayment.GetAll().AsNoTracking().Where(e => e.InvoiceId == invoiceId).Select(e => e.Id).ToList();
            var newCheckedList = checkPayment.Where(e => e.Checked == true).Select(e => e.Id).ToList();

            var deleted = currentCheckedList.Where(e => !newCheckedList.Contains(e)).ToList();
            var added = newCheckedList.Except(currentCheckedList).ToList();

            List<PaymentPrepayment> preaymentToUpdate = new List<PaymentPrepayment>();
            List<PaymentPrepaymentInvoice> prepaymentInvoiceToAdd = new List<PaymentPrepaymentInvoice>();

            foreach (var item in deleted)
            {
                var prePayment = ObjectMapper.Map<PaymentPrepayment>(await _prepaymentRepo.FirstOrDefaultAsync(e => e.Id.Equals(item)));
                prePayment.IsAppliedInvoice = false;
                prePayment.InvoiceId = null;
                preaymentToUpdate.Add(prePayment);
            }

            foreach (var item in added)
            {
                var newObj = ObjectMapper.Map<PaymentPrepayment>(await _prepaymentRepo.FirstOrDefaultAsync(e => e.Id.Equals(item)));
                newObj.IsAppliedInvoice = true;
                newObj.InvoiceId = invoiceId; 
                preaymentToUpdate.Add(newObj);
            }

            CurrentUnitOfWork.GetDbContext<tmssDbContext>().UpdateRange(preaymentToUpdate.ToList());
            //foreach (PaymentPrepaymentInvoice temp in deleted) await _prepaymentInvoiceRepo.HardDeleteAsync(temp);
            await CurrentUnitOfWork.SaveChangesAsync();
        }


        // create for payment
        public async Task<long> CreateOrEditPayment(InputPaymentHeadersDto paymentHeadersDto)
        {
            if (paymentHeadersDto.Id > 0)
            {
                return await updatePayment(paymentHeadersDto);
            }
            else
            {
                return await createPayment(paymentHeadersDto);
            }
        }

        public async Task<List<GetEmployeesDto>> GetTMVUserList()
        {
            string _sql = "EXEC sp_PaymentGetAllEmployees";
            var result = await _dapperRepository.QueryAsync<GetEmployeesDto>(_sql, new
            {
            });

            return result.ToList();
        }


        // get payment by id
        public async Task<PaymentHeadersDto> getPaymentById(long? id)
        {
            var listPayment = from a in _paymentHeadersRepository.GetAll().AsNoTracking()
                              where a.Id == id
                              select new PaymentHeadersDto()
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
                                  AuthorizationStatus = a.AuthorizationStatus,
                                  Status = a.Status
                              };
            var result = listPayment;
            return result.FirstOrDefault();
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequest_Add)]
        public async Task<long> createPayment(InputPaymentHeadersDto input)
        {
            string paymentNo = await _commonGenerateNum.GenerateRequestNumber(GenSeqType.PaymentRequest);
            var payment = ObjectMapper.Map<PaymentHeaders>(input);
            payment.PaymentNo = "P" + paymentNo;
            var result = await _paymentHeadersRepository.InsertAsync(payment);
            long newId  = await _paymentHeadersRepository.InsertAndGetIdAsync(payment);
            await CurrentUnitOfWork.SaveChangesAsync();

            List<InvoiceHeaders> invoiceToUpdate = new List<InvoiceHeaders>();
            List<PaymentLines> paymentLinesToAdds = new List<PaymentLines>();
            //List<PaymentPrepayment> prePaymentToUpdate = new List<PaymentPrepayment>();
            //List<PaymentPrepayment> prePaymentToAdd = new List<PaymentPrepayment>();

            PaymentPrepayment newPrepayment = null;
            foreach (InputPaymentLinesDto itemLine in input.InputPaymentLinesDto)
            {
                newPrepayment = null;
                if (itemLine.InvoiceId > 0) //add manually
                {
                    var obj = ObjectMapper.Map<InvoiceHeaders>(await _invoiceHeaderRepo.FirstOrDefaultAsync(e => e.Id.Equals(itemLine.InvoiceId)));
                    obj.IsPaid = true;
                    invoiceToUpdate.Add(obj);

                    //update prepayment.IsPaymentAdded = true
                    await _prepayment.GetAll().Where(e => e.InvoiceId == itemLine.InvoiceId && !e.IsPaymentAdded).UpdateFromQueryAsync(e => new PaymentPrepayment { IsPaymentAdded = true, PaymentHeaderId = result.Id });
                }
                else
                {
                    //insert into prepayment 
                    PaymentPrepayment p = new PaymentPrepayment();
                    p.PoNo = itemLine.PoNo;
                    p.Amount = itemLine.PaymentAmount;
                    p.AdvancedDate = DateTime.Now;
                    p.IsPaymentAdded = true;
                    p.IsAppliedInvoice = false;
                    p.VendorId = input.VendorId;
                    p.VendorSiteId = input.VendorSiteId;
                    p.PaymentHeaderId = result.Id;
                    newPrepayment = await _prepayment.InsertAsync(p);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }

                var line = new PaymentLines()
                {
                    PaymentAmount = itemLine.PaymentAmount,
                    PaymentHeaderId = result.Id,
                    InvoiceId = itemLine.InvoiceId,
                    InvoiceDate = itemLine.InvoiceDate,
                    InvoiceNumber = itemLine.InvoiceNumber,
                    InvoiceAmount = itemLine.InvoiceAmount,
                    IsAdjustmentInvoice = itemLine.IsAdjustmentInvoice,
                    PrepaymentAmount = itemLine.PrepaymentAmount,
                    AddedPrepaymentId = newPrepayment?.Id,
                    PoNo = itemLine.PoNo,
                };
                paymentLinesToAdds.Add(line);

            }

            ////add attachments
            //foreach (PaymentAttachmentsDto inputShipmentLineDto in input.Attachments)
            //{
            //    PaymentAttachments attachFileLine = new PaymentAttachments();
            //    attachFileLine = ObjectMapper.Map<PaymentAttachments>(inputShipmentLineDto);
            //    attachFileLine.PaymentHeaderId = payment.Id;

            //    await _attachment.InsertAsync(attachFileLine);
            //}

            CurrentUnitOfWork.GetDbContext<tmssDbContext>().UpdateRange(invoiceToUpdate.ToList());
            await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddRangeAsync(paymentLinesToAdds.ToList());
            await CurrentUnitOfWork.SaveChangesAsync();

            return newId;
            
        }

        public async Task<List<PaymentAttachmentsDto>> getAllAttachmentsByHeaderID(long? headerid)
        {
            var listPaymentLine = from a in _attachment.GetAll().AsNoTracking()
                                  where a.PaymentHeaderId == headerid
                                  select new PaymentAttachmentsDto()
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

        public async Task<List<PaymentFromSuppliersDto>> getAllPaymentFromSupplier(FilterPaymentFromSupliersDto input)
        {
            string _sql = "EXEC sp_PaymentFromSuppliers$SearchToCreatePayment @PaymentNo, @RequestDateFrom, @RequestDateTo, @VendorId, @Status, @InvoiceNumber, @PoNo, @MaxResultCount, @SkipCount,@CurrencyCode";
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
                @CurrencyCode = input.CurrencyCode,
            });

            //int totalCount = 0;
            //if (result != null && result.Count() > 0)
            //{
            //    totalCount = result.Count();
            //}
            return result.ToList();
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequest_Edit)]
        public async Task<long> updatePayment(InputPaymentHeadersDto input)
        {
            var payment = ObjectMapper.Map<PaymentHeaders>(input);
            payment.CreatorUserId = input.EmployeeId;
            var result = await _paymentHeadersRepository.UpdateAsync(payment);
            await CurrentUnitOfWork.SaveChangesAsync();

            //Update & delete lines 
            var currentLines = _paymentLinesRepository.GetAll().AsNoTracking().Where(e => e.PaymentHeaderId == input.Id).OrderBy(e => e.Id);
            var newLines = input.InputPaymentLinesDto.Select(e => e.Id.Value).ToList();

            var deleted = currentLines.Where(e => !newLines.Contains(e.Id)).ToList();
            var added = newLines.Except(currentLines.Select(e => e.Id)).ToList();

            List<InvoiceHeaders> invoiceToUpdate = new List<InvoiceHeaders>();
            List<PaymentLines> paymentLinesToAdd = new List<PaymentLines>();
            List<PaymentLines> paymentLinesToUpdate = new List<PaymentLines>();
            List<PaymentPrepayment> prePaymentToAdd = new List<PaymentPrepayment>();

            foreach (var item in deleted) //update IsPaid flag of invoice 
            {
                if (item.InvoiceId > 0) //add manually
                {
                    var obj = ObjectMapper.Map<InvoiceHeaders>(await _invoiceHeaderRepo.FirstOrDefaultAsync(e => e.Id.Equals(item.InvoiceId)));
                    obj.IsPaid = false;
                    invoiceToUpdate.Add(obj);

                    await _prepayment.GetAll().Where(e => e.InvoiceId == item.InvoiceId && e.IsPaymentAdded && e.PaymentHeaderId == input.Id).UpdateFromQueryAsync(e => new PaymentPrepayment { IsPaymentAdded = false, PaymentHeaderId = null });
                }
                else {
                    await _prepayment.GetAll().Where(e => e.Id == item.AddedPrepaymentId && e.IsPaymentAdded && e.PaymentHeaderId == input.Id).UpdateFromQueryAsync(e => new PaymentPrepayment { IsPaymentAdded = false, PaymentHeaderId = null, IsDeleted = true });
                }
            }
            PaymentPrepayment newPrepayment = null;
            foreach (var item in input.InputPaymentLinesDto)
            {
                newPrepayment = null;

                if (item.InvoiceId > 0) { 
                    var obj = ObjectMapper.Map<InvoiceHeaders>(await _invoiceHeaderRepo.FirstOrDefaultAsync(e => e.Id.Equals(item.InvoiceId)));
                    if (obj != null) { 
                        obj.IsPaid = true;
                        invoiceToUpdate.Add(obj);
                    }
                
                    await _prepayment.GetAll().Where(e => e.InvoiceId == item.InvoiceId && !e.IsPaymentAdded).UpdateFromQueryAsync(e => new PaymentPrepayment { IsPaymentAdded = true, PaymentHeaderId = input.Id });
                }
                else {  //insert into prepayment 
                    if (item.AddedPrepaymentId > 0)
                    {  //update prepayment 
                        var updateRow = await _prepayment.GetAll().FirstOrDefaultAsync(e => e.Id == item.AddedPrepaymentId);
                        updateRow.PoNo = item.PoNo;
                        updateRow.Amount = item.PaymentAmount;
                        updateRow.AdvancedDate = input.RequestDate;
                    }
                    else {
                        PaymentPrepayment p = new PaymentPrepayment();
                        p.PoNo = item.PoNo;
                        p.Amount = item.PaymentAmount;
                        p.AdvancedDate = input.RequestDate;
                        p.IsPaymentAdded = true;
                        p.IsAppliedInvoice = false;
                        p.VendorId = input.VendorId;
                        p.VendorSiteId = input.VendorSiteId;
                        p.PaymentHeaderId = result.Id;
                        newPrepayment = await _prepayment.InsertAsync(p);
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                }

                if (item.Id != 0 && item.Id != null) //update 
                {
                    PaymentLines curLine = ObjectMapper.Map(item, await currentLines.Where(e => e.Id == item.Id).FirstOrDefaultAsync());
                    curLine.PaymentHeaderId = input.Id;
                    paymentLinesToUpdate.Add(curLine);
                }
                else
                {  //insert 
                    PaymentLines newLine = ObjectMapper.Map<PaymentLines>(item);
                    newLine.PaymentHeaderId = input.Id;
                    newLine.AddedPrepaymentId = newPrepayment?.Id; 
                    paymentLinesToAdd.Add(newLine);
                }
            }

            //add & update attachments
            var currAttachment = _attachment.GetAll().AsNoTracking().Where(e => e.PaymentHeaderId == input.Id);
            var newAttachments = input.Attachments.Select(e => e.ServerFileName).ToList();

            var deletedAttachments = currAttachment.Where(e => !newAttachments.Contains(e.ServerFileName)).ToList();
            foreach (var inputShipmentLineDto in input.Attachments)
            {
                if (inputShipmentLineDto.Id <= 0)
                {
                    PaymentAttachments attachFileLine = new PaymentAttachments();
                    attachFileLine = ObjectMapper.Map<PaymentAttachments>(inputShipmentLineDto);
                    attachFileLine.PaymentHeaderId = input.Id;

                    await _attachment.InsertAsync(attachFileLine);
                }
            }
            var folderName = "wwwroot";
            var pathToSave = Directory.GetCurrentDirectory() + "/" + folderName;

            foreach (PaymentAttachments temp in deletedAttachments)
            {
                var fullPath = pathToSave + "/" + temp.ServerLink;
                if (File.Exists(fullPath)) File.Delete(fullPath);
                await _attachment.HardDeleteAsync(temp);
            }
            //end add & update attachments

            await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddRangeAsync(paymentLinesToAdd.ToList());
            CurrentUnitOfWork.GetDbContext<tmssDbContext>().UpdateRange(paymentLinesToUpdate.ToList());
            CurrentUnitOfWork.GetDbContext<tmssDbContext>().UpdateRange(invoiceToUpdate.ToList());
            foreach (PaymentLines temp in deleted) await _paymentLinesRepository.HardDeleteAsync(temp);
            await CurrentUnitOfWork.SaveChangesAsync();
            return input.Id;
        }

        public async Task Delete(long id)
        {
            //Update & delete lines 
            var currentLines = _paymentLinesRepository.GetAll().AsNoTracking().Where(e => e.PaymentHeaderId == id).OrderBy(e => e.Id).ToList();

            List<InvoiceHeaders> invoiceToUpdate = new List<InvoiceHeaders>();

            foreach (var item in currentLines) //update IsPaid flag of invoice 
            {
                if (item.InvoiceId > 0) //add manually
                {
                    var obj = ObjectMapper.Map<InvoiceHeaders>(await _invoiceHeaderRepo.FirstOrDefaultAsync(e => e.Id.Equals(item.InvoiceId)));
                    obj.IsPaid = false;
                    invoiceToUpdate.Add(obj);
                }
            }
            CurrentUnitOfWork.GetDbContext<tmssDbContext>().UpdateRange(invoiceToUpdate.ToList());
            foreach (PaymentLines temp in currentLines) await _paymentLinesRepository.HardDeleteAsync(temp);
            await CurrentUnitOfWork.SaveChangesAsync();

            var payment = ObjectMapper.Map<PaymentHeaders>(_paymentHeadersRepository.FirstOrDefault(id));
            await _paymentHeadersRepository.HardDeleteAsync(payment);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [AbpAuthorize(AppPermissions.InvoiceItems_PaymentRequest_Cancel)]
        public async Task CancelPayment(long id)
        {
            //Update & delete lines 
            var currentLines = _paymentLinesRepository.GetAll().AsNoTracking().Where(e => e.PaymentHeaderId == id).OrderBy(e => e.Id).ToList();

            List<InvoiceHeaders> invoiceToUpdate = new List<InvoiceHeaders>();

            foreach (var item in currentLines) //update IsPaid flag of invoice 
            {
                if (item.InvoiceId > 0) //add manually
                {
                    var obj = ObjectMapper.Map<InvoiceHeaders>(await _invoiceHeaderRepo.FirstOrDefaultAsync(e => e.Id.Equals(item.InvoiceId)));
                    if (obj != null) { 
                        obj.IsPaid = false;
                        invoiceToUpdate.Add(obj);
                    }
                    await _prepayment.GetAll().Where(e => e.InvoiceId == item.InvoiceId && e.IsPaymentAdded && e.PaymentHeaderId == id).UpdateFromQueryAsync(e => new PaymentPrepayment { IsPaymentAdded = false, PaymentHeaderId = null });
                }
                else
                {
                    await _prepayment.GetAll().Where(e => e.Id == item.AddedPrepaymentId && e.IsPaymentAdded && e.PaymentHeaderId == id).UpdateFromQueryAsync(e => new PaymentPrepayment { IsPaymentAdded = false, PaymentHeaderId = null, IsDeleted = true });
                }
            }

            var payment = ObjectMapper.Map<PaymentHeaders>(_paymentHeadersRepository.FirstOrDefault(id));
            payment.Status = 2; 
            await _paymentHeadersRepository.UpdateAsync(payment);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        // get payment line
        public async Task<PagedResultDto<InputPaymentLinesDto>> getAllPaymentLineByHeaderID(long? headerid)
        {
            var listPaymentLine = from a in _paymentLinesRepository.GetAll().AsNoTracking()
                                  join i in _invoiceLine.GetAll().AsNoTracking() on a.InvoiceId equals i.InvoiceId into l
                                  from i in l.DefaultIfEmpty()
                                  join ih in _invoiceHeaderRepo.GetAll().AsNoTracking() on i.InvoiceId equals ih.Id into k
                                  from ih in k.DefaultIfEmpty()
                                  where a.PaymentHeaderId == headerid
                                  select new InputPaymentLinesDto()
                                  {
                                      Id = a.Id,
                                      InvoiceId = a.InvoiceId,
                                      InvoiceAmount = a.InvoiceAmount,
                                      InvoiceDate = a.InvoiceDate,
                                      PaymentHeaderId = a.PaymentHeaderId,
                                      PaymentAmount = a.PaymentAmount,
                                      InvoiceNumber = string.IsNullOrWhiteSpace(ih.InvoiceSymbol) ? ih.InvoiceNum: ih.InvoiceSymbol + "-" + ih.InvoiceNum,
                                      IsAdjustmentInvoice = a.IsAdjustmentInvoice,
                                      PrepaymentAmount = a.PrepaymentAmount,
                                      AddedPrepaymentId = a.AddedPrepaymentId,
                                      PoNo = string.IsNullOrWhiteSpace(a.PoNo) ? i.PoNumber : a.PoNo
                                  };
            var result = listPaymentLine.Distinct();
            return new PagedResultDto<InputPaymentLinesDto>(
                       listPaymentLine.Count(),
                       result.ToList()
                      );
        }

        public async Task<GetPaymentReportDto> getPaymentReportById(long? id)
        {
            var listPayment = from a in _paymentHeadersRepository.GetAll().AsNoTracking()
                              join s in _suppliersRepo.GetAll().AsNoTracking() on a.VendorId equals s.Id
                              join us in _userRepository.GetAll().AsNoTracking() on (a.CreatorUserId == 0 ? a.EmployeeId : a.CreatorUserId) equals us.Id into e
                              from us in e.DefaultIfEmpty()
                              where a.Id == id
                              select new GetPaymentReportDto()
                              {
                                  Id = a.Id,
                                  PaymentNo = a.PaymentNo,
                                  RequestDate = a.RequestDate,
                                  RequestDuedate = a.RequestDuedate,
                                  FormatRequestDate = a.RequestDate.ToString("dd/MM/yyyy"),
                                  FormatRequestDuedate = a.RequestDuedate.ToString("dd/MM/yyyy"),
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
                                  CreatorName = us.FullName,
                                  CreatorUserId = (long)a.CreatorUserId,
                                };
            GetPaymentReportDto reportObj = await listPayment.FirstOrDefaultAsync();

            var listPaymentLine = from a in _paymentLinesRepository.GetAll().AsNoTracking()
                                  join il in _invoiceLine.GetAll().AsNoTracking() on a.InvoiceId equals il.InvoiceId into k 
                                  from il in k.DefaultIfEmpty()
                                  join ih in _invoiceHeaderRepo.GetAll().AsNoTracking() on il.InvoiceId equals ih.Id into p
                                  from ih in p.DefaultIfEmpty()
                                  where a.PaymentHeaderId == id
                                  group new {a,il} by new
                                  {
                                      Id = a.Id,
                                      InvoiceId = a.InvoiceId,
                                      InvoiceAmount = a.InvoiceAmount,
                                      InvoiceDate = a.InvoiceDate,
                                      PaymentHeaderId = a.PaymentHeaderId,
                                      PaymentAmount = a.PaymentAmount,
                                      InvoiceNumber = string.IsNullOrWhiteSpace(ih.InvoiceSymbol) ? a.InvoiceNumber : ih.InvoiceSymbol + "-" + a.InvoiceNumber ,
                                      IsAdjustmentInvoice = a.IsAdjustmentInvoice,
                                      PrepaymentAmount = a.PrepaymentAmount,
                                      PoNo = string.IsNullOrWhiteSpace(a.PoNo) ? il.PoNumber : a.PoNo,
                                  } into k 
                                  select new InputPaymentLinesDto()
                                  {
                                      Id = k.Key.Id,
                                      InvoiceId = k.Key.InvoiceId,
                                      InvoiceAmount = k.Key.InvoiceAmount,
                                      InvoiceDate = k.Key.InvoiceDate,
                                      PaymentHeaderId = k.Key.PaymentHeaderId,
                                      PaymentAmount = k.Key.PaymentAmount,
                                      InvoiceNumber = k.Key.InvoiceNumber,
                                      IsAdjustmentInvoice = k.Key.IsAdjustmentInvoice,
                                      PrepaymentAmount = k.Key.PrepaymentAmount,
                                      AmountVat = k.Sum(e => e.il.AmountVat),
                                      PoNo = k.Key.PoNo,
                                  };

            if (listPaymentLine.Count() > 0)
            {
                reportObj.PaymentLines = await listPaymentLine.ToListAsync();
            }
            return reportObj;
        }

        public async Task<SupplierBankAccountDto> getSupplierBankAccountInfo(long? supplierId, long? supplierSiteId, string currencyCode)
        {
            string _sql = "EXEC GetSupplierBankAccountInfo @SupplierId,@SupplierSiteId,@CurrencyCode ";
            var result = (await _dapperRepository.QueryAsync<SupplierBankAccountDto>(_sql, new
            {
                @SupplierId = supplierId,
                @SupplierSiteId = supplierSiteId,
                @CurrencyCode = currencyCode,
            })).ToList();

            return result.FirstOrDefault();
        }
    }
}
