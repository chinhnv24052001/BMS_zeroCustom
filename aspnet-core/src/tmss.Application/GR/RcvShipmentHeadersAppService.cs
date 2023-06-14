using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Session;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using NPOI.HSSF.Record.Chart;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.Authorization.Users.Profile;
using tmss.Common.GeneratePurchasingNumber;
using tmss.Config;
using tmss.Config.Dto;
using tmss.Dto;
using tmss.GR;
using tmss.GR.Dto;
using tmss.GR.Enum;
using tmss.Master;
using tmss.Master.PurchasePurpose;
using tmss.Master.PurchasePurpose.Dto;
using tmss.PO;
using tmss.PR.PurchasingRequest;
using tmss.PR.PurchasingRequest.Dto;
using tmss.RequestApproval.Dto;
using tmss.SendMail;
using tmss.Storage;
using static tmss.tmssDashboardCustomizationConsts;

namespace tmss.PR
{
    public class RcvShipmentHeadersAppService : tmssAppServiceBase, IRcvShipmentHeadersAppService
    {
        private readonly IRepository<RcvShipmentHeaders, long> _rcvHeaders;
        private readonly IRepository<RcvShipmentLines, long> _rcvLines;
        private readonly IRepository<RcvReceiptNoteHeaders, long> _noteHeaders;
        private readonly IRepository<RcvReceiptNoteLines, long> _noteLines;
        private readonly IDapperRepository<RcvShipmentHeaders, long> _dapperRepo;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGenerateNum;
        private readonly IProfileAppService _profileAppService;
        private readonly IRepository<RcvShipmentAttachments, long> _attachment;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private readonly ICfgEmailTemplateAppService _iCfgEmailTemplate;
        private readonly IRepository<MstSupplierContacts, long> _supplierContactRepo;
        private readonly IRepository<User, long> _userRepo;
        private readonly ISendEmail _sendMail;

        public RcvShipmentHeadersAppService(
            IRepository<RcvShipmentHeaders, long> repRcvHeaders,
            IRepository<RcvShipmentLines, long> repRcvLines,
            IRepository<RcvReceiptNoteHeaders, long> noteHeaders,
            IRepository<RcvReceiptNoteLines, long> noteLines,
            IDapperRepository<RcvShipmentHeaders, long> controlDapperRepository,
            ICommonGeneratePurchasingNumberAppService commonGenerateNum,
            IProfileAppService profileAppService,
            IRepository<RcvShipmentAttachments, long> attachment,
            ITempFileCacheManager tempFileCacheManager,
            ICfgEmailTemplateAppService iCfgEmailTemplate,
            IRepository<MstSupplierContacts, long> supplierContactRepo,
            IRepository<User, long> userRepo,
            ISendEmail sendMail
            )
        {
            _rcvHeaders = repRcvHeaders;
            _rcvLines = repRcvLines;
            _noteHeaders = noteHeaders;
            _noteLines = noteLines;
            _dapperRepo = controlDapperRepository;
            _commonGenerateNum = commonGenerateNum;
            _profileAppService = profileAppService;
            _attachment = attachment;
            _tempFileCacheManager = tempFileCacheManager;
            _iCfgEmailTemplate = iCfgEmailTemplate;
            _supplierContactRepo = supplierContactRepo;
            _userRepo = userRepo;
            _sendMail = sendMail;
        }


        public async Task<PagedResultDto<ExpectedReceiptsDto>> getAllExpectedReceipts_Store(SearchExpectedReceiptsDto input)
        {
            if (!input.PoNo.StartsWith(";")) input.PoNo = ";" + input.PoNo;
            if (!input.PoNo.EndsWith(";")) input.PoNo = input.PoNo + ";";

            input.PoLineNum = input.PoLineNum ?? -1;
            input.PoShipmentNum = input.PoShipmentNum ?? -1;
            input.PrLineNum = input.PrLineNum ?? -1;
            input.VendorId = input.VendorId ?? -1;
            input.VendorSiteId = input.VendorSiteId ?? -1;
            input.ReceivingLocationId = input.ReceivingLocationId ?? -1;

            string _sql = @"Exec [dbo].[sp_RcvGetExpectedReceipts] 
                           @PoNo
                          ,@poLineNum
                          ,@poShipNum
                          ,@VendorId
                          ,@VendorSiteId
                          ,@ItemNo";

            var filtered = await _dapperRepo.QueryAsync<ExpectedReceiptsDto>(_sql, new
            {
                PoNo = input.PoNo,
                PoLineNum = input.PoLineNum,
                PoShipNum = input.PoShipmentNum,
                PrNo = input.PrNo,
                PrLineNum = input.PrLineNum,
                VendorId = input.VendorId,
                VendorSiteId = input.VendorSiteId,
                ReceivingLocationId = input.ReceivingLocationId,
                ItemNo = input.ItemNo
            });

            return new PagedResultDto<ExpectedReceiptsDto>(
                        filtered.Count(),
                        filtered.ToList()
                       );
        }

        public async Task<PagedResultDto<InputRcvShipmentHeadersDto>> getAllReceipts(SearchAllReceiptsDto input)
        {
            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            input.VendorId = input.VendorId == 0 ? -1 : input.VendorId;
            input.VendorSiteId = input.VendorSiteId == 0 ? -1 : input.VendorSiteId;

            string _sql = @"Exec [dbo].[sp_RcvGetAllReceipts] 
                        @ReceiptNum
                        ,@VendorId
                        ,@VendorSiteId
                        ,@Status  
                        ,@AuthorizationStatus
                        ,@ReceiptType
                        ,@ReceivedDateFrom
                        ,@ReceivedDateTo
                        ,@MaxResultCount
	                    ,@SkipCount
                        ";

            var filtered = (await _dapperRepo.QueryAsync<InputRcvShipmentHeadersDto>(_sql, new
            {
                ReceiptNum = input.ReceiptNum,
                VendorId = input.VendorId ?? -1,
                VendorSiteId = input.VendorSiteId ?? -1,
                Status = input.Status ?? -1,
                AuthorizationStatus = input.AuthorizationStatus,
                ReceiptType = input.ReceiptType,
                ReceivedDateFrom = input.ReceivedDateFrom,
                ReceivedDateTo = input.ReceivedDateTo,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount,
            })).ToList();

            int totalCount = 0;
            if (filtered != null && filtered.Count() > 0)
            {
                totalCount = (int)filtered[0].TotalCount;
            }

            return new PagedResultDto<InputRcvShipmentHeadersDto>(
                        totalCount,
                        filtered.ToList()
                        );
        }

        public async Task updateReceiptHeader(InputRcvShipmentHeadersDto inputRcvShipmentHeaderDto)
        {
            RcvShipmentHeaders headerRow;
            if (inputRcvShipmentHeaderDto.Id >= 0)
            {
                var newRcvShipmentHeader = _rcvHeaders.GetAll().AsNoTracking().FirstOrDefault(e => e.Id == inputRcvShipmentHeaderDto.Id);
                headerRow = ObjectMapper.Map(inputRcvShipmentHeaderDto, newRcvShipmentHeader);
                //headerRow = ObjectMapper.Map<RcvShipmentHeaders>(inputRcvShipmentHeaderDto);
                //headerRow.LastModifierUserId = (long)AbpSession.UserId;
                //headerRow.Id = inputRcvShipmentHeaderDto.Id; 
                await _rcvHeaders.UpdateAsync(headerRow);
                await CurrentUnitOfWork.SaveChangesAsync();

                //update attachments
                var currAttachment = _attachment.GetAll().AsNoTracking().Where(e => e.ShipmentHeaderId == inputRcvShipmentHeaderDto.Id);
                var newLines = inputRcvShipmentHeaderDto.Attachments.Select(e => e.ServerFileName).ToList();

                var deleted = currAttachment.Where(e => !newLines.Contains(e.ServerFileName)).ToList();
                //add and delete
                foreach (RcvShipmentAttachmentsDto inputShipmentLineDto in inputRcvShipmentHeaderDto.Attachments)
                {
                    if (inputShipmentLineDto.Id <= 0)
                    {
                        RcvShipmentAttachments attachFileLine = new RcvShipmentAttachments();
                        attachFileLine = ObjectMapper.Map<RcvShipmentAttachments>(inputShipmentLineDto);
                        attachFileLine.ShipmentHeaderId = inputRcvShipmentHeaderDto.Id;

                        await _attachment.InsertAsync(attachFileLine);
                    }
                }
                var folderName = "wwwroot";
                var pathToSave = Directory.GetCurrentDirectory() + "/" + folderName;

                foreach (RcvShipmentAttachments temp in deleted) {
                    var fullPath = pathToSave + "/" + temp.ServerLink;
                    if (File.Exists(fullPath)) File.Delete(fullPath); 
                    await _attachment.HardDeleteAsync(temp); 
                }
            }
        }


        public async Task<InputRcvShipmentHeadersDto> createGoodsReceipt(InputRcvShipmentHeadersDto inputRcvShipmentHeaderDto)
        {
            RcvShipmentHeaders newRcvShipmentHeader;
            if (inputRcvShipmentHeaderDto.Id == 0)
            {
                string receitpNum = await _commonGenerateNum.GenerateRequestNumber(GenSeqType.Receipt);
                newRcvShipmentHeader = new RcvShipmentHeaders();

                newRcvShipmentHeader = ObjectMapper.Map<RcvShipmentHeaders>(inputRcvShipmentHeaderDto);
                newRcvShipmentHeader.ReceiptNum = "GR" + receitpNum;
                //newRcvShipmentHeader.EmployeeId = (long)AbpSession.UserId; //ng nhan 
                newRcvShipmentHeader.ReceiptSourceCode = "VENDOR";
                newRcvShipmentHeader.Status = 0;
                inputRcvShipmentHeaderDto.Status = 0; 
                if (inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto.Count() > 0)
                {
                    newRcvShipmentHeader.InventoryGroupId = inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto[0].InventoryGroupId;
                    newRcvShipmentHeader.IsInventory = inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto[0].IsInventory;
                }
               
                await _rcvHeaders.InsertAsync(newRcvShipmentHeader);
                await CurrentUnitOfWork.SaveChangesAsync();
                //add
                foreach (RcvShipmentAttachmentsDto inputShipmentLineDto in inputRcvShipmentHeaderDto.Attachments)
                {
                    RcvShipmentAttachments attachFileLine = new RcvShipmentAttachments();
                    attachFileLine = ObjectMapper.Map<RcvShipmentAttachments>(inputShipmentLineDto);
                    attachFileLine.ShipmentHeaderId = newRcvShipmentHeader.Id;

                    await _attachment.InsertAsync(attachFileLine);
                }

                inputRcvShipmentHeaderDto.Id = newRcvShipmentHeader.Id;
                inputRcvShipmentHeaderDto.ReceiptNum = "GR" + receitpNum;
            }
            else
            {
                newRcvShipmentHeader = _rcvHeaders.GetAll().AsNoTracking().FirstOrDefault(e => e.Id == inputRcvShipmentHeaderDto.Id);
                var udpateObj = ObjectMapper.Map(inputRcvShipmentHeaderDto, newRcvShipmentHeader);
                await _rcvHeaders.UpdateAsync(udpateObj);
            }

            //chuyen trang thai cua note sang received/partly received
            if (inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto.Count() > 0) {
                var noteHeaderIdList = inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto.Select(e => e.ReceiptNoteHeaderId).Distinct().ToList();
               foreach(var noteHeaderId in noteHeaderIdList) { //neu nhap tu PO thi se ko co gia tri nay
                    var obj = ObjectMapper.Map<RcvReceiptNoteHeaders>(await _noteHeaders.FirstOrDefaultAsync(e => e.Id.Equals(noteHeaderId)));
                    if (obj != null) { 
                        obj.Status = 1;
                        await _noteHeaders.UpdateAsync(obj);
                    }
                }
            }

            var grpCount = inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto.Where(e => e.IsManuallyAdded == false).Select(e => e.InventoryGroupId).Distinct().Count();
            if (grpCount > 1) {
                throw new UserFriendlyException(400, "Lines phải thuộc cùng nhóm InventoryGroup!");
            }

            foreach (GetRcvReceiptNoteLineForEditDto inputShipmentLineDto in inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto)
            {
                RcvShipmentLines itemLine = new RcvShipmentLines();
                itemLine = ObjectMapper.Map<RcvShipmentLines>(inputShipmentLineDto);
                itemLine.ShipmentHeaderId = inputRcvShipmentHeaderDto.Id;
                itemLine.SourceDocumentCode = "PO";
                itemLine.QuantityReturned = 0; 
                await _rcvLines.InsertAsync(itemLine);

                string _sql = @"Exec [dbo].[sp_RcvReceiptUpdQuantityReceived] 
                        @PoLineId
                        ,@PoLineShipmentId
                        ,@PoDistributionId
                        ,@QuantityReceived
                        ,@ReceiptNoteLineId
                        ,@ReceiptNoteHeaderId";

                var filtered = await _dapperRepo.ExecuteAsync(_sql, new
                {
                    PoLineId = itemLine.PoLineId,
                    PoLineShipmentId = itemLine.PoLineShipmentId,
                    PoDistributionId = itemLine.PoDistributionId,
                    QuantityReceived = itemLine.QuantityReceived,
                    ReceiptNoteLineId = itemLine.ReceiptNoteLineId,
                    ReceiptNoteHeaderId = itemLine.ReceiptNoteHeaderId
                });
            }


            return inputRcvShipmentHeaderDto; 

            //return new GetRcvShipmentHeaderForViewDto() { Id = newRcvShipmentHeader.Id };
                //return ObjectMapper.Map<GetRcvShipmentHeaderForViewDto>(newRcvShipmentHeader); 
        }

        public async Task<InputRcvShipmentHeadersDto> returnGoodsReceipt(InputRcvShipmentHeadersDto inputRcvShipmentHeaderDto)
        {

            RcvShipmentHeaders newRcvShipmentHeader = _rcvHeaders.GetAll().AsNoTracking().FirstOrDefault(e => e.Id == inputRcvShipmentHeaderDto.Id);
            foreach (GetRcvReceiptNoteLineForEditDto inputShipmentLineDto in inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto)
            {

                RcvShipmentLines itemLine = new RcvShipmentLines();
                itemLine = ObjectMapper.Map<RcvShipmentLines>(inputShipmentLineDto);
                itemLine.Id = 0;
                itemLine.QuantityReturned = 0;
                itemLine.CreationTime = DateTime.Now;
                itemLine.CreatorUserId = AbpSession.GetUserId();
                itemLine.ShipmentHeaderId = inputRcvShipmentHeaderDto.Id;
                itemLine.SourceDocumentCode = "PO";
                await _rcvLines.InsertAsync(itemLine);

                var oldLine = _rcvLines.FirstOrDefault(e => e.Id.Equals(inputShipmentLineDto.Id));
                oldLine.QuantityReturned = (oldLine.QuantityReturned ?? 0) + (-1) * inputShipmentLineDto.QuantityReceived;

                await _rcvLines.UpdateAsync(oldLine);

                string _sql = @"Exec [dbo].[sp_RcvReceiptUpdQuantityReceived] 
                        @PoLineId
                        ,@PoLineShipmentId
                        ,@PoDistributionId
                        ,@QuantityReceived
                        ,@ReceiptNoteLineId
                        ,@ReceiptNoteHeaderId";

                var filtered = _dapperRepo.Execute(_sql, new
                {
                    PoLineId = itemLine.PoLineId,
                    PoLineShipmentId = itemLine.PoLineShipmentId,
                    PoDistributionId = itemLine.PoDistributionId,
                    QuantityReceived = itemLine.QuantityReceived,
                    ReceiptNoteLineId = oldLine?.ReceiptNoteLineId,
                    ReceiptNoteHeaderId = oldLine?.ReceiptNoteHeaderId
                });
            }

            await sentEmailToSupplier(inputRcvShipmentHeaderDto); 
            return inputRcvShipmentHeaderDto;
        }

        private async Task sentEmailToSupplier(InputRcvShipmentHeadersDto inputRcvShipmentHeaderDto)
        {
            var emailAddress = await (from us in _userRepo.GetAll().AsNoTracking()
                                      join ct in _supplierContactRepo.GetAll().AsNoTracking() on us.SupplierContactId equals ct.SupplierContactId
                                      where ct.SupplierId == inputRcvShipmentHeaderDto.VendorId
                                      select us).FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(emailAddress?.EmailAddress))
            {
                throw new UserFriendlyException(400, "Nhà cung cấp không được config email!");
            }

            EmailTemplateOuputDto emailInfo = await _iCfgEmailTemplate.GetTemplateByCode("RETURN_GOODS_RECEIPT");
           
            DelayPaymentEmailContent delayPaymentEmailContent = new DelayPaymentEmailContent();
            StringBuilder body = new StringBuilder();
            body.Append(emailInfo.EmailTemplateContent);

            string s_body = body.ToString(); //.Replace("<person>", emailAddress?.Name); ;
            string lineDetail = string.Empty;
            string lineList = string.Empty;

            int pFrom = s_body.IndexOf("<tbody>") + "<tbody>".Length;
            int pTo = s_body.LastIndexOf("</tbody>");

            string lineTemplate = s_body.Substring(pFrom, pTo - pFrom).Trim();

            foreach (GetRcvReceiptNoteLineForEditDto item in inputRcvShipmentHeaderDto.InputRcvShipmentLinesDto)
            {
                lineDetail = lineTemplate;
                lineDetail = lineDetail.Replace("<PO>", item.PoNo);
                lineDetail = lineDetail.Replace("<PartNo>", item.PartNo);
                lineDetail = lineDetail.Replace("<ReceivedQty>", item.QuantityReceived?.ToString());
                lineDetail = lineDetail.Replace("<UOM>", item.UnitOfMeasure);   
                lineDetail = lineDetail.Replace("<ReceivedDate>", DateTime.Now.ToString("dd/MM/yyyy"));

                lineList = lineList + lineDetail; 
            }

            s_body = s_body.Replace(lineTemplate, lineList);

            string[] listEmail = new string[] { emailAddress?.EmailAddress,  }; //add pic email vao day 

            delayPaymentEmailContent.ReceiveEmail = listEmail;
            delayPaymentEmailContent.Subject = "TMV returns GR";
            delayPaymentEmailContent.ContentEmail = s_body;

           await _sendMail.SendMailForDelayPayment(delayPaymentEmailContent);
          
        }

        public async Task<PagedResultDto<GetRcvShipmentLineForEditDto>> getGoodsReceiptDetail(int id)
        {
            string _sql = "EXEC sp_RcvGetShipmentLines @ShipmentHeaderId";

            var filtered = await _dapperRepo.QueryAsync<GetRcvShipmentLineForEditDto>(_sql, new
            {
                @ShipmentHeaderId = id
            });
            return new PagedResultDto<GetRcvShipmentLineForEditDto>(
                       filtered.Count(),
                       filtered.ToList()
                      );
        }

        public async Task<GetRcvShipmentHeaderForViewDto> getGoodsReceiptByIdForView(int id)
        {
            var prHeaders = from rcvHeader in _rcvHeaders.GetAll().AsNoTracking()
                            where rcvHeader.Id == id
                            select new GetRcvShipmentHeaderForViewDto()
                            {
                                Id = rcvHeader.Id,
                                ReceiptSourceCode = rcvHeader.ReceiptSourceCode,
                                VendorId = rcvHeader.VendorId,
                                VendorSiteId = rcvHeader.VendorSiteId,
                                OrganizationId = rcvHeader.OrganizationId,
                                ShipmentNum = rcvHeader.ShipmentNum,
                                ReceiptNum = rcvHeader.ReceiptNum,
                                BillOfLading = rcvHeader.BillOfLading,
                                ShippedDate = rcvHeader.ShippedDate,
                                EmployeeId = rcvHeader.EmployeeId,
                                WaybillAirbillNum = rcvHeader.WaybillAirbillNum,
                                Comments = rcvHeader.Comments,
                                ShipToOrgId = rcvHeader.ShipToOrgId,
                                ReceivedDate = rcvHeader.CreationTime,//noted 
                            };
            return prHeaders.FirstOrDefault(); 
        }
            
        public async Task<GetRcvShipmentHeaderForEditDto> getGoodsReceiptById(int id)
        {
            var prHeaders = from rcvHeader in _rcvHeaders.GetAll().AsNoTracking()
                            where rcvHeader.Id == id
                            select new GetRcvShipmentHeaderForEditDto()
                            {
                                Id = rcvHeader.Id,
                                ReceiptSourceCode = rcvHeader.ReceiptSourceCode,
                                VendorId = rcvHeader.VendorId,
                                VendorSiteId = rcvHeader.VendorSiteId,
                                OrganizationId = rcvHeader.OrganizationId,
                                ShipmentNum = rcvHeader.ShipmentNum,
                                ReceiptNum = rcvHeader.ReceiptNum,
                                BillOfLading = rcvHeader.BillOfLading,
                                ShippedDate = rcvHeader.ShippedDate,
                                EmployeeId = rcvHeader.EmployeeId,
                                WaybillAirbillNum = rcvHeader.WaybillAirbillNum,
                                Comments = rcvHeader.Comments,
                                ShipToOrgId = rcvHeader.ShipToOrgId,
                                ReceivedDate = rcvHeader.CreationTime,//noted 
                            };
            GetRcvShipmentHeaderForEditDto purchaseRequestForEditDto = prHeaders.FirstOrDefault();

            string _sql = "EXEC sp_RcvGetShipmentLines @ShipmentHeaderId";

            var listPrLines = await _dapperRepo.QueryAsync<GetRcvShipmentLineForEditDto>(_sql, new
            {
                @ShipmentHeaderId = id
            });

            if (listPrLines.Count() > 0)
            {
                purchaseRequestForEditDto.RcvShipmentLines = listPrLines.ToList();
            }
            return purchaseRequestForEditDto;
        }

        public async Task<GetRcvShipmentHeaderForEditDto> getGoodsReceiptForReturnById(int id)
        {
            var prHeaders = from rcvHeader in _rcvHeaders.GetAll().AsNoTracking()
                            where rcvHeader.Id == id
                            select new GetRcvShipmentHeaderForEditDto()
                            {
                                Id = rcvHeader.Id,
                                ReceiptSourceCode = rcvHeader.ReceiptSourceCode,
                                VendorId = rcvHeader.VendorId,
                                VendorSiteId = rcvHeader.VendorSiteId,
                                OrganizationId = rcvHeader.OrganizationId,
                                ShipmentNum = rcvHeader.ShipmentNum,
                                ReceiptNum = rcvHeader.ReceiptNum,
                                BillOfLading = rcvHeader.BillOfLading,
                                ShippedDate = rcvHeader.ShippedDate,
                                EmployeeId = rcvHeader.EmployeeId,
                                WaybillAirbillNum = rcvHeader.WaybillAirbillNum,
                                Comments = rcvHeader.Comments,
                                ShipToOrgId = rcvHeader.ShipToOrgId,
                                ReceivedDate = rcvHeader.CreationTime,//noted 
                            };
            GetRcvShipmentHeaderForEditDto purchaseRequestForEditDto = prHeaders.FirstOrDefault();

            string _sql = "EXEC sp_RcvGetShipmentLinesForReturn @ShipmentHeaderId";

            var listPrLines = await _dapperRepo.QueryAsync<GetRcvShipmentLineForEditDto>(_sql, new
            {
                @ShipmentHeaderId = id
            });

            if (listPrLines.Count() > 0)
            {
                purchaseRequestForEditDto.RcvShipmentLines = listPrLines.ToList();
            }
            return purchaseRequestForEditDto;
        }

        // get payment line
        public async Task<List<RcvShipmentAttachmentsDto>> getAllAttachmentsByHeaderID(long? headerid)
        {
            var listPaymentLine = from a in _attachment.GetAll().AsNoTracking()
                                  where a.ShipmentHeaderId == headerid
                                  select new RcvShipmentAttachmentsDto()
                                  {
                                      Id = a.Id,
                                      ShipmentHeaderId = a.ShipmentHeaderId,
                                      ServerFileName = a.ServerFileName,
                                      ServerLink = a.ServerLink,
                                      ContentType = a.ContentType,
                                  };
            var result = listPaymentLine;
            return  result.ToList();
        }
        public async Task<int> CancelReceipt(long id)
        {
            string _sql = "EXEC sp_RcvReceiptCancel @HeaderId";

            var listPrLines = await _dapperRepo.ExecuteAsync(_sql, new
            {
                @HeaderId = id
            });
            return listPrLines;
        }

        public async Task<FileDto> exportGR(SearchAllReceiptsDto input)
        {
            string fileName = "";

            fileName = "GR_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".xlsx";

            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            input.VendorId = input.VendorId == 0 ? -1 : input.VendorId;
            input.VendorSiteId = input.VendorSiteId == 0 ? -1 : input.VendorSiteId;

            string _sql = @"Exec [dbo].[sp_RcvGetAllReceipts] 
                        @ReceiptNum
                        ,@VendorId
                        ,@VendorSiteId
                        ,@Status  
                        ,@AuthorizationStatus
                        ,@ReceiptType
                        ,@ReceivedDateFrom
                        ,@ReceivedDateTo
                        ,@MaxResultCount
	                    ,@SkipCount
                        ";

            input.MaxResultCount = int.MaxValue;
            input.SkipCount = 0; 

           var data = (await _dapperRepo.QueryAsync<InputRcvShipmentHeadersDto>(_sql, new
            {
                ReceiptNum = input.ReceiptNum,
                VendorId = input.VendorId ?? -1,
                VendorSiteId = input.VendorSiteId ?? -1,
                Status = input.Status ?? -1,
                AuthorizationStatus = input.AuthorizationStatus,
                ReceiptType = input.ReceiptType,
                ReceivedDateFrom = input.ReceivedDateFrom,
                ReceivedDateTo = input.ReceivedDateTo,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount,
            })).ToList();

            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_Export_GR.xlsx");

            var workBook = ExcelFile.Load(path);
            var workSheet = workBook.Worksheets[0];

            int startRow = 1;
            int endRow = data.Count;

            if (endRow > 0)
            {
                workSheet.Cells.GetSubrange($"A1:F{endRow + 1}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                workSheet.Cells["C1"].Value = (input.ReceiptType == 0 ? "Ngày nhận hàng" : "Ngày bắt đầu");
                InputRcvShipmentHeadersDto row; 
                for (int i = 0; i < endRow; i++)
                {
                    row = data[i];
                    /* STT */
                    workSheet.Cells[startRow + i, 0].Value = i + 1;
                    workSheet.Cells[startRow + i, 1].Value = row.ReceiptNum ?? "";
                    workSheet.Cells[startRow + i, 2].Value = (row.ReceiptType == 0 ? row.ReceivedDate : row.ServiceStartDate) ?? null;
                    workSheet.Cells[startRow + i, 3].Value = row.VendorName ?? "";
                    string statusStr = (row.Status == 0? "Đã nghiêm thu/Nhập kho": (row.Status == 2?  "Đã hủy": ""));
                    if (input.ReceiptType == 0) {
                        workSheet.Cells["E1"].Value = "Trạng thái";
                        workSheet.Cells["F1"].Value = null;
                        workSheet.Cells[startRow + i, 4].Value = statusStr;
                    } else {
                        workSheet.Cells[startRow + i, 4].Value = row.AuthorizationStatus ?? "";
                        workSheet.Cells[startRow + i, 5].Value = statusStr;
                    }
                        
                }
            }

            MemoryStream stream = new MemoryStream();
            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            workBook.Save(tempFile);

            stream = new MemoryStream(File.ReadAllBytes(tempFile));
            _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
            File.Delete(tempFile);
            stream.Position = 0;

            return await Task.FromResult(file);
        }

        public async Task<FileDto> exportGRDetail(long id)
        {
            string fileName = "";

            fileName = "GR_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".xlsx";

            string _sql = "EXEC sp_RcvGetShipmentLines @ShipmentHeaderId";

            var data = (await _dapperRepo.QueryAsync<GetRcvShipmentLineForEditDto>(_sql, new
            {
                @ShipmentHeaderId = id
            })).ToList();

            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_Export_GR_Detail.xlsx");

            var workBook = ExcelFile.Load(path);
            var workSheet = workBook.Worksheets[0];

            int startRow = 1;
            int endRow = data.Count;

            if (endRow > 0)
            {
                workSheet.Cells.GetSubrange($"A1:N{endRow + 1}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                GetRcvShipmentLineForEditDto row;
                for (int i = 0; i < endRow; i++)
                {
                    row = data[i];
                    /* STT */
                    workSheet.Cells[startRow + i, 0].Value = i + 1;
                    workSheet.Cells[startRow + i, 1].Value = row.PartNo ?? "";
                    workSheet.Cells[startRow + i, 2].Value = row.ItemDescription ?? "";
                    workSheet.Cells[startRow + i, 3].Value = row.QuantityReceived ?? 0;
                    workSheet.Cells[startRow + i, 4].Value = row.QuantityShipped ?? 0;
                    workSheet.Cells[startRow + i, 5].Value = row.PoNo ?? "";
                    workSheet.Cells[startRow + i, 6].Value = row.Remark ?? ""; 
                    workSheet.Cells[startRow + i, 7].Value = row.UnitOfMeasure ?? "";
                    workSheet.Cells[startRow + i, 8].Value = row.DestinationTypeCode ?? "";
                    workSheet.Cells[startRow + i, 9].Value = row.LocationCode ?? "";
                    workSheet.Cells[startRow + i, 10].Value = row.ToSubinventory ?? "";
                    workSheet.Cells[startRow + i, 11].Value = row.CountryOfOriginCode ?? "";
                    workSheet.Cells[startRow + i, 12].Value = row.CreationTime ?? null;
                    workSheet.Cells[startRow + i, 13].Value = row.CreatorUserName ?? "";
                }
            }

            MemoryStream stream = new MemoryStream();
            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            workBook.Save(tempFile);

            stream = new MemoryStream(File.ReadAllBytes(tempFile));
            _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
            File.Delete(tempFile);
            stream.Position = 0;

            return await Task.FromResult(file);
        }

        public async Task<PagedResultDto<ReturnLinesDto>> getAllReturns(SearchAllReturnsDto input)
        {
            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            input.VendorId = input.VendorId == 0 ? -1 : input.VendorId;

            string _sql = @"Exec [dbo].[sp_RcvGetAllReturns] 
                    @ReceiptNum
                    ,@VendorId
                    ,@PoNo
                    ,@PartNo  
                    ,@ReceiptType
                    ,@ReceivedDateFrom
                    ,@ReceivedDateTo
                    ,@MaxResultCount
	                ,@SkipCount
                    ";

            var filtered = (await _dapperRepo.QueryAsync<ReturnLinesDto>(_sql, new
            {
                ReceiptNum = input.ReceiptNum,
                VendorId = input.VendorId ?? -1,
                PoNo = input.PoNo,
                PartNo = input.PartNo,
                ReceiptType = input.ReceiptType,
                ReceivedDateFrom = input.ReceivedDateFrom,
                ReceivedDateTo = input.ReceivedDateTo,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount,
            })).ToList();

            int totalCount = 0;
            if (filtered != null && filtered.Count() > 0)
            {
                totalCount = (int)filtered[0].TotalCount;
            }

            return new PagedResultDto<ReturnLinesDto>(
                        totalCount,
                        filtered.ToList()
                        );
            
        }

        public async Task<FileDto> exportReturns(SearchAllReturnsDto input)
        {
            string fileName = "Returns_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".xlsx";

            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            input.VendorId = input.VendorId == 0 ? -1 : input.VendorId;

            string _sql = @"Exec [dbo].[sp_RcvGetAllReturns] 
                        @ReceiptNum
                        ,@VendorId
                        ,@PoNo
                        ,@PartNo  
                        ,@ReceiptType
                        ,@ReceivedDateFrom
                        ,@ReceivedDateTo
                        ,@MaxResultCount
	                    ,@SkipCount
                        ";

            input.MaxResultCount = int.MaxValue;
            input.SkipCount = 0;

            var data = (await _dapperRepo.QueryAsync<ReturnLinesDto>(_sql, new
            {
                ReceiptNum = input.ReceiptNum,
                VendorId = input.VendorId ?? -1,
                PoNo = input.PoNo,
                PartNo = input.PartNo,
                ReceiptType = input.ReceiptType,
                ReceivedDateFrom = input.ReceivedDateFrom,
                ReceivedDateTo = input.ReceivedDateTo,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount,
            })).ToList();

            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_Export_Return.xlsx");

            var workBook = ExcelFile.Load(path);
            var workSheet = workBook.Worksheets[0];

            int startRow = 1;
            int endRow = data.Count;

            if (endRow > 0)
            {
                workSheet.Cells.GetSubrange($"A1:J{endRow + 1}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                ReturnLinesDto row;
                for (int i = 0; i < endRow; i++)
                {
                    row = data[i];
                    /* STT */
                    workSheet.Cells[startRow + i, 0].Value = i + 1;
                    workSheet.Cells[startRow + i, 1].Value = row.ReceiptNum ?? "";
                    workSheet.Cells[startRow + i, 2].Value = row.PoNo ?? "";
                    workSheet.Cells[startRow + i, 3].Value = row.PartNo ?? "";
                    workSheet.Cells[startRow + i, 4].Value = row.ItemDescription ?? "";
                    workSheet.Cells[startRow + i, 5].Value = row.QuantityReceived;
                    workSheet.Cells[startRow + i, 6].Value = row.UnitOfMeasure ?? "";
                    workSheet.Cells[startRow + i, 7].Value = row.CreationTime;
                    workSheet.Cells[startRow + i, 8].Value = row.SupplierName ?? "";
                    workSheet.Cells[startRow + i, 9].Value = row.Remark ?? "";
                }
            }

            MemoryStream stream = new MemoryStream();
            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            workBook.Save(tempFile);

            stream = new MemoryStream(File.ReadAllBytes(tempFile));
            _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
            File.Delete(tempFile);
            stream.Position = 0;

            return await Task.FromResult(file);
        }

        //public async Task<PagedResultDto<ExpectedReceiptsDto>> getAllExpectedReceipts(SearchExpectedReceiptsDto input)
        //{
        //    //using (CurrentUnitOfWork.DisableFilter(AbpDataFilters.MayHaveTenant, AbpDataFilters.MustHaveTenant))
        //    //{
        //    input.TenantId = AbpSession.TenantId == null ? input.TenantId : AbpSession.TenantId;

        //    //IEnumerable<ExpectedReceiptsDto> remindGroup = await _controlDapperRepository.QueryAsync<ExpectedReceiptsDto>(
        //    //	@"
        //    //                OPTION (RECOMPILE)
        //    //                ", new { NUMBEROFMONTHNCB = input.NumberOfMonthNotReturn, FROMDATE = input.FromDate.Date, TODATE = input.ToDate.AddDays(1).Date, TENANTID = input.TenantId, REGISTERNO = input.RegisterNo, VINNO = input.VinNo, STATUS = input.Status, CONTACTPERSON = input.ContactPerson, SERVICEADVISOR = input.ServiceAdvisor, INSURANCE = (int?)null, REGISTRATION = (int?)null });

        //    //return remindGroup.ToList();
        //    var listPaymentRequest = from pohead in _poHeaders.GetAll().AsNoTracking()
        //                             join poLine in _poLines.GetAll().AsNoTracking() on pohead.Id equals poLine.PoHeaderId
        //                             join poShipment in _poShipments.GetAll().AsNoTracking() on poLine.Id equals poShipment.PoLineId
        //                             join poDist in _poDistributions.GetAll().AsNoTracking() on poShipment.Id equals poDist.PoLineShipmentId
        //                             join prDist in _prDist.GetAll().AsNoTracking() on poDist.PrRequisitionDistributionId equals prDist.Id into a
        //                             from prDist in a.DefaultIfEmpty()
        //                             join prLine in _prLines.GetAll().AsNoTracking() on prDist.PrRequisitionLineId equals prLine.Id into b
        //                             from prLine in b.DefaultIfEmpty()
        //                             join prhead in _prHeaders.GetAll().AsNoTracking() on prLine.PrRequisitionHeaderId equals prhead.Id into c
        //                             from prhead in c.DefaultIfEmpty()
        //                             //join rcvLine in _rcvLines.GetAll().AsNoTracking() on prLines.PrRequisitionHeaderId equals prhead.Id into c
        //                             //from prhead in c.DefaultIfEmpty()
        //                             where (string.IsNullOrWhiteSpace(input.PoNo) || pohead.Segment1.Contains(input.PoNo))
        //                                && (string.IsNullOrWhiteSpace(input.PrNo) || prhead.RequisitionNo.Contains(input.PrNo))
        //                                && (input.VendorId == null || pohead.VendorId.Value.Equals(input.VendorId.Value))

        //                             select new ExpectedReceiptsDto()
        //                             {
        //                                 QuantityReceived = poDist.QuantityOrdered,
        //                                 UnitOfMeasure = poLine.UnitMeasLookupCode,
        //                                 DestinationTypeCode = "Inventory", //lookup 2 gia tri Inventory & Receive???
        //                                 ItemDescription = poLine.ItemDescription,
        //                                 ItemId = poLine.ItemId,
        //                                 ItemRevision = "",
        //                                 RequestId = prLine.CreatorUserId,
        //                                 ToSubinventory = poDist.DestinationSubinventory,
        //                                 LocatorId = 0, // default locator for part in subinventory 
        //                                 CategoryId = poLine.CategoryId,
        //                                 CountryOfOriginCode = poShipment.CountryOfOriginCode,
        //                                 PoHeaderId = poDist.PoHeaderId,
        //                                 PoLineId = poDist.PoLineId,
        //                                 PoLineShipmentId = poDist.PoLineShipmentId,
        //                                 PoDistributionId = poDist.Id,
        //                                 RoutingHeaderId = poShipment.ReceivingRoutingId,
        //                                 DeliverToLocationId = poDist.DeliverToLocationId,
        //                                 DeliverToPersonId = poDist.DeliverToPersonId
        //                             };
        //    var result = listPaymentRequest.Skip(input.SkipCount).Take(input.MaxResultCount);
        //    return new PagedResultDto<ExpectedReceiptsDto>(
        //               listPaymentRequest.Count(),
        //               result.ToList()
        //              );
        //}
    }
}
