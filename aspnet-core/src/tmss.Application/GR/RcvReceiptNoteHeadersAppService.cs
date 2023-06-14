using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.Authorization.Users.Profile;
using tmss.Common.Dto;
using tmss.Common.GeneratePurchasingNumber;
using tmss.Dto;
using tmss.GR;
using tmss.GR.Dto;
using tmss.GR.Dto.ReceiptNote;
using tmss.GR.Enum;
using tmss.Master;
using tmss.PaymentModule.Prepayment.Dto;
using tmss.PO;
using tmss.Storage;

namespace tmss.PR
{
    public class RcvReceiptNoteHeadersAppService : tmssAppServiceBase, IRcvReceiptNoteHeadersAppService
    {
        private readonly IRepository<PoHeaders, long> _poHeaders;
        private readonly IRepository<PoLines, long> _poLines;
        private readonly IRepository<PoLineShipments, long> _poShipments;
        private readonly IRepository<PoDistributions, long> _poDistributions;
        private readonly IRepository<PrRequisitionHeaders, long> _prHeaders;
        private readonly IRepository<PrRequisitionLines, long> _prLines;
        private readonly IRepository<RcvReceiptNoteHeaders, long> _rcvNoteHeaders;
        private readonly IRepository<RcvReceiptNoteLines, long> _rcvNoteLines;
        private readonly IDapperRepository<RcvShipmentHeaders, long> _dapperRepo;
        private readonly IRepository<User, long> _userRepository;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGenerateNum;
        private readonly IRepository<MstTitles, long> _titleRepo;
        private readonly IRepository<MstSuppliers, long> _supplierRepo;
        private readonly IRepository<MstSupplierSites, long> _supplierSiteRepo;
        private readonly IProfileAppService _profileAppService;
        private readonly IRepository<MstSuppliers, long> _supplier;
        private readonly IRepository<PoHeaders, long> _poHeader;
        private readonly ITempFileCacheManager _tempFileCacheManager;

        public RcvReceiptNoteHeadersAppService(
            IRepository<PoHeaders, long> repPOHeaders,
            IRepository<PoLines, long> repPOLines,
            IRepository<PoLineShipments, long> repPoLineShipments,
            IRepository<PoDistributions, long> repPoDistributions,
            IRepository<PrRequisitionHeaders, long> prHeaders,
            IRepository<PrRequisitionLines, long> prLines,
            //IRepository<PrRequisitionDistributions, long> prDist,
            IRepository<RcvReceiptNoteHeaders, long> repRcvNoteHeaders,
            IRepository<RcvReceiptNoteLines, long> repRcvNoteLines,
            IDapperRepository<RcvShipmentHeaders, long> controlDapperRepository,
            IRepository<User, long> userRepository,
            ICommonGeneratePurchasingNumberAppService commonGenerateNum,
            IRepository<MstTitles, long> titleRepo,
            IRepository<MstSuppliers, long> supplierRepo,
            IRepository<MstSupplierSites, long> supplierSiteRepo,
            IProfileAppService profileAppService,
            IRepository<MstSuppliers, long> supplier,
            IRepository<PoHeaders, long> poHeader,
            ITempFileCacheManager tempFileCacheManager
            )
        {
            _poHeaders = repPOHeaders;
            _poLines = repPOLines;
            _poShipments = repPoLineShipments;
            _poDistributions = repPoDistributions;
            _prHeaders = prHeaders;
            _prLines = prLines;
            //_prDist = prDist;
            _rcvNoteHeaders = repRcvNoteHeaders;
            _rcvNoteLines = repRcvNoteLines;
            _dapperRepo = controlDapperRepository;
            _userRepository = userRepository;
            _commonGenerateNum = commonGenerateNum;
            _titleRepo = titleRepo;
            _supplierRepo = supplierRepo;
            _supplierSiteRepo = supplierSiteRepo;
            _profileAppService = profileAppService;
            _supplier = supplier;
            _poHeader = poHeader;
            _tempFileCacheManager = tempFileCacheManager;
        }

       
       public async Task<PagedResultDto<GetExpectedReceiptNoteLinesDto>> getAllExpectedReceiptNoteLines_TMV(SearchExpectedReceiptsDto input)
        {

            input.PoLineNum = input.PoLineNum ?? -1;
            input.PoShipmentNum = input.PoShipmentNum ?? -1;
            input.PrLineNum = input.PrLineNum ?? -1;
            input.VendorId = input.VendorId ?? -1;
            input.VendorSiteId = input.VendorSiteId ?? -1;
            input.ReceivingLocationId = input.ReceivingLocationId ?? -1;

            string _sql = @"Exec [dbo].[sp_RcvGetExpectedReceipts]
                           @PoNo
                          ,@poLineNum
                          ,@PoShipmentNum
                          ,@VendorId
                          ,@VendorSiteId
                          ,@ItemNo";

            var filtered = await _dapperRepo.QueryAsync<GetExpectedReceiptNoteLinesDto>(_sql, new
            {
                PoNo = input.PoNo,
                PoLineNum = input.PoLineNum,
                PoShipmentNum = input.PoShipmentNum,
                VendorId = input.VendorId,
                VendorSiteId = input.VendorSiteId,
                ItemNo = input.ItemNo
            });

            return new PagedResultDto<GetExpectedReceiptNoteLinesDto>(
                        filtered.Count(),
                        filtered.ToList()
                       );
        }

        public async Task<PagedResultDto<GetExpectedReceiptNoteLinesDto>> getAllExpectedReceiptNoteLines(SearchExpectedReceiptNotesDto input)
        {
            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            input.VendorId = input.VendorId ?? -1;
            input.VendorSiteId = input.VendorSiteId ?? -1;
            input.PoLineNum = input.PoLineNum ?? -1;
            if (input.VendorId == 0) input.VendorId = -1;
            if (input.VendorSiteId == 0) input.VendorSiteId = -1;

                string _sql = @"Exec [dbo].[sp_RcvGetExpectedReceiptNoteLines] 
                           @PoNo
                          ,@poLineNum
                          ,@VendorId
                          ,@VendorSiteId
                          ,@ItemNo
                          ,@ReceiptNoteType";

                var filtered = await _dapperRepo.QueryAsync<GetExpectedReceiptNoteLinesDto>(_sql, new
                {
                    PoNo = input.PoNo,
                    PoLineNum = input.PoLineNum,
                    //PoShipmentNum = input.PoShipmentNum,
                    VendorId = input.VendorId,
                    VendorSiteId = input.VendorSiteId,
                    ItemNo = input.ItemNo,
                    ReceiptNoteType = input.ReceiptNoteType
                });

                return new PagedResultDto<GetExpectedReceiptNoteLinesDto>(
                            filtered.Count(),
                            filtered.ToList()
                           );
          
        }

        public async Task<PagedResultDto<GetRcvReceiptNoteHeadersDto>> getAllReceiptNotes(SearchAllReceiptNotesDto input)
        {
            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            string _sql = @"Exec [dbo].[sp_RcvGetAllReceiptNotes] 
                        @ReceiptNum
                        ,@VendorId
                        ,@VendorSiteId
                        ,@Status
                        ,@ReceiptNoteType 
                        ,@ShippedDateFrom
                        ,@ShippedDateTo
                        ,@MaxResultCount
	                    ,@SkipCount
                        ";

            var filtered = (await _dapperRepo.QueryAsync<GetRcvReceiptNoteHeadersDto>(_sql, new
            {
                ReceiptNum = input.ReceiptNoteNum,
                VendorId = input.VendorId ?? -1,
                VendorSiteId = input.VendorSiteId ?? -1,
                Status = input.Status ?? -1,
                ReceiptNoteType = input.ReceiptNoteType,
                ShippedDateFrom = input.ShippedDateFrom,
                ShippedDateTo = input.ShippedDateTo,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount,
            })).ToList();

            int totalCount = 0;
            if (filtered != null && filtered.Count() > 0)
            {
                totalCount = (int)filtered[0].TotalCount;
            }

            return new PagedResultDto<GetRcvReceiptNoteHeadersDto>(
                        totalCount,
                        filtered
                        );
            
        }
        public async Task updateReceiptNoteHeader(InputRcvReceiptNoteHeadersDto inputRcvShipmentHeaderDto)
        {
            RcvReceiptNoteHeaders headerRow;
            if (inputRcvShipmentHeaderDto.Id >= 0)
            {
                headerRow = ObjectMapper.Map<RcvReceiptNoteHeaders>(inputRcvShipmentHeaderDto);
                headerRow.LastModifierUserId = (long)AbpSession.UserId;
                await _rcvNoteHeaders.UpdateAsync(headerRow);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        public async Task<InputRcvReceiptNoteHeadersDto> createReceiptNotes(InputRcvReceiptNoteHeadersDto inputRcvShipmentHeaderDto)
        {
            string receiptNoteNum = "";
            if (inputRcvShipmentHeaderDto.Id == 0)
            {
                string receitpNoteNum = await _commonGenerateNum.GenerateRequestNumber(GenSeqType.Receipt);
                RcvReceiptNoteHeaders headerRow = new RcvReceiptNoteHeaders();

                headerRow = ObjectMapper.Map<RcvReceiptNoteHeaders>(inputRcvShipmentHeaderDto);
                headerRow.CreatorUserId = (long)AbpSession.UserId; //ng nhan 
                headerRow.ReceiptSourceCode = "PO";
                headerRow.ReceiptNoteNum = "RN" + receitpNoteNum;
                if (inputRcvShipmentHeaderDto.InputRcvReceiptNoteLinesDto.Count() > 0)
                {
                    headerRow.InventoryGroupId = inputRcvShipmentHeaderDto.InputRcvReceiptNoteLinesDto[0].InventoryGroupId;
                    headerRow.IsInventory = inputRcvShipmentHeaderDto.InputRcvReceiptNoteLinesDto[0].IsInventory;
                }
                if (headerRow.ReceiptNoteType == 0)
                {
                    headerRow.ServiceStartDate = null;
                    headerRow.ServiceEndDate = null;
                }
                else {
                    headerRow.ShippedDate = null;
                    headerRow.ReceivedDate = null;
                }
                await _rcvNoteHeaders.InsertAsync(headerRow);
                await CurrentUnitOfWork.SaveChangesAsync();

                inputRcvShipmentHeaderDto.Id = headerRow.Id;
                inputRcvShipmentHeaderDto.ReceiptNoteNum = headerRow.ReceiptNoteNum;
                receiptNoteNum = headerRow.ReceiptNoteNum;
            }
            else {
                var udpateObj = ObjectMapper.Map<RcvReceiptNoteHeaders>(_rcvNoteHeaders.GetAll().AsNoTracking().FirstOrDefault(e => e.Id == inputRcvShipmentHeaderDto.Id));
                udpateObj.LastModifierUserId = (long)AbpSession.UserId;
                receiptNoteNum = udpateObj.ReceiptNoteNum;
                await _rcvNoteHeaders.UpdateAsync(udpateObj);

                inputRcvShipmentHeaderDto.Id = udpateObj.Id;
                inputRcvShipmentHeaderDto.ReceiptNoteNum = udpateObj.ReceiptNoteNum;
            }

            int vLineNum = 0;
            foreach (GetExpectedReceiptNoteLinesDto itemLine in inputRcvShipmentHeaderDto.InputRcvReceiptNoteLinesDto)
            {
                RcvReceiptNoteLines lineRow = new RcvReceiptNoteLines();
                lineRow = ObjectMapper.Map<RcvReceiptNoteLines>(itemLine);
                vLineNum = vLineNum + 1;
                lineRow.LineNum = vLineNum;
                lineRow.ReceiptNoteHeaderId = inputRcvShipmentHeaderDto.Id;
                lineRow.QuantityReceived = 0; 

                await _rcvNoteLines.InsertAsync(lineRow);

                string _sql = @"Exec [dbo].[sp_RcvReceiptNotesUpdQuantityShipped] 
                        @PoLineId
                        ,@QuantityShipped";

                var filtered = await _dapperRepo.ExecuteAsync(_sql, new
                {
                    PoLineId = itemLine.PoLineId,
                    QuantityShipped = itemLine.QuantityShipped
                });
            }

            CurrentUnitOfWork.SaveChanges();
            //var supp = await _supplier.GetAll().AsNoTracking().FirstOrDefaultAsync(e => e.Id.Equals(inputRcvShipmentHeaderDto.VendorId));
            //var site = await _supplierSiteRepo.GetAll().AsNoTracking().FirstOrDefaultAsync(e => e.Id.Equals(inputRcvShipmentHeaderDto.VendorSiteId));
            //inputRcvShipmentHeaderDto.VendorName = supp?.SupplierName;
            //inputRcvShipmentHeaderDto.VendorSiteCode = site?.VendorSiteCode;

            return inputRcvShipmentHeaderDto;
        }
       
        public async Task<List<AbpUserDto>> GetUserList(int? tenantId)
        {
            var query = from e in _userRepository.GetAll().Where(e =>
                            (AbpSession.TenantId == null ? e.TenantId == tenantId : e.TenantId == AbpSession.TenantId) || e.TenantId == null
                           // e.TenantId == null
                            ).AsNoTracking()
                        where e.IsActive == true
                        select new AbpUserDto
                        {
                            UserName = e.UserName,
                            Name = e.Name,
                            Id = e.Id
                        };
            return await query.ToListAsync();
        }

        public async Task<PagedResultDto<GetRcvReceiptNoteLineForEditDto>> getReceiptNoteLinesForReceipt(string idList) //long? id)
        {
            string _sql = "EXEC sp_RcvGetReceiptNoteLinesForReceipt @HeaderIdList";

            var filtered = await _dapperRepo.QueryAsync<GetRcvReceiptNoteLineForEditDto>(_sql, new
            {
                @HeaderIdList = idList
            });

            return new PagedResultDto<GetRcvReceiptNoteLineForEditDto>(
                       filtered.Count(),
                       filtered.ToList()
                      );
        }

        public async Task<GetRcvReceiptNoteHeaderForEditDto> getReceiptNoteByNumForReceipt(SearchReceiptNotesByNum input)
        {
            if (!input.ReceiptNoteNum.StartsWith(";")) input.ReceiptNoteNum = ";" + input.ReceiptNoteNum;
            if (!input.ReceiptNoteNum.EndsWith(";")) input.ReceiptNoteNum = input.ReceiptNoteNum + ";";

            var prHeaderIdList = (from rcvHeader in _rcvNoteHeaders.GetAll().AsNoTracking()
                              where input.ReceiptNoteNum.Contains( ";" + rcvHeader.ReceiptNoteNum + ";")
                              select rcvHeader.Id).ToList();

            if (prHeaderIdList == null || prHeaderIdList.Count <= 0) throw new UserFriendlyException(400, "Dữ liệu không tồn tại"); 
            return await getReceiptNoteByIdForReceipt(prHeaderIdList);
        }

        public async Task<int> cancelReceiptNote(long id)
        {
            string _sql = "EXEC sp_RcvReceiptNotesCancel @HeaderId";

            var listPrLines = await _dapperRepo.ExecuteAsync(_sql, new
            {
                @HeaderId = id
            });
            return listPrLines;
        }

        public async Task<GetRcvReceiptNoteHeaderForEditDto> getReceiptNoteByIdForReceipt(List<long> idList)//long id)
        {
            var prHeaders = from rcvHeader in _rcvNoteHeaders.GetAll().AsNoTracking()
                            join us in _userRepository.GetAll().AsNoTracking() on rcvHeader.EmployeeId equals us.Id into e
                            from us in e.DefaultIfEmpty()
                            join title1 in _titleRepo.GetAll().AsNoTracking() on us.TitlesId equals title1.Id into g
                            from title1 in g.DefaultIfEmpty()
                            join us2 in _userRepository.GetAll().AsNoTracking() on rcvHeader.EmployeeId2 equals us2.Id into f
                            from us2 in f.DefaultIfEmpty()
                            join title2 in _titleRepo.GetAll().AsNoTracking() on us2.TitlesId equals title2.Id into h
                            from title2 in h.DefaultIfEmpty()
                            join s in _supplierRepo.GetAll().AsNoTracking() on rcvHeader.VendorId equals s.Id
                            join ss in _supplierSiteRepo.GetAll().AsNoTracking() on rcvHeader.VendorSiteId equals ss.Id into i
                            from ss in i.DefaultIfEmpty()
                            where idList.Contains(rcvHeader.Id) //rcvHeader.Id == id
                            select new GetRcvReceiptNoteHeaderForEditDto()
                            {
                                Id = rcvHeader.Id,
                                ReceiptSourceCode = rcvHeader.ReceiptSourceCode,
                                VendorId = rcvHeader.VendorId,
                                VendorSiteId = rcvHeader.VendorSiteId,
                                OrganizationId = rcvHeader.OrganizationId,
                                ShipmentNum = rcvHeader.ShipmentNum,
                                ReceiptNoteNum = rcvHeader.ReceiptNoteNum,
                                BillOfLading = rcvHeader.BillOfLading,
                                ShippedDate = rcvHeader.ShippedDate,
                                EmployeeId = rcvHeader.EmployeeId,
                                WaybillAirbillNum = rcvHeader.WaybillAirbillNum,
                                Comments = rcvHeader.Comments,
                                ShipToOrgId = rcvHeader.ShipToOrgId,
                                ReceivedDate = rcvHeader.CreationTime,//noted 
                                ReceiptNoteType = rcvHeader.ReceiptNoteType,
                                EmployeeId2 = rcvHeader.EmployeeId2,
                                ServiceStartDate = rcvHeader.ServiceStartDate,
                                ServiceEndDate = rcvHeader.ServiceEndDate,
                                DeliverName1 = rcvHeader.DeliverName1,
                                DeliverTitle1 = rcvHeader.DeliverTitle1,
                                DeliverName2 = rcvHeader.DeliverName2,
                                DeliverTitle2 = rcvHeader.DeliverTitle2,

                                EmployeeName1 = us.Name,
                                EmployeeName2 = us2.Name,
                                EmployeeTitle1 = title1.Description,
                                EmployeeTitle2 = title2.Description,
                                // VendorName = s.SupplierName,
                                //  VendorSiteCode = ss.VendorSiteCode,
                                // Status = rcvHeader.Status
                            };
            GetRcvReceiptNoteHeaderForEditDto purchaseRequestForEditDto = prHeaders.FirstOrDefault();

            string _sql = "EXEC sp_RcvGetReceiptNoteLinesForReceipt @HeaderIdList";
            string idListStr = ";" + String.Join(";", idList.ToArray()) + ";";

            var listPrLines = await _dapperRepo.QueryAsync<GetRcvReceiptNoteLineForEditDto>(_sql, new
            {
                HeaderIdList = idListStr
            });

            if (listPrLines != null && listPrLines.Count() > 0)
            {
                purchaseRequestForEditDto.InputRcvReceiptNoteLinesDto = listPrLines.ToList();
            }
            return purchaseRequestForEditDto;
            
        }


        public async Task<GetRcvReceiptNoteHeadersDto> getReceiptNoteByNumForView(SearchAllReceiptNotesDto input)
        {
            var prHeaderId = (from rcvHeader in _rcvNoteHeaders.GetAll().AsNoTracking()
                             where rcvHeader.ReceiptNoteNum.Equals(input.ReceiptNoteNum)
                             select rcvHeader.Id).FirstOrDefault();

            return await getReceiptNoteByIdForView(prHeaderId); 
        }

        public async Task<GetRcvReceiptNoteHeadersDto> getReceiptNoteByIdForView(long id)
        {
            var prHeaders = from rcvHeader in _rcvNoteHeaders.GetAll().AsNoTracking()
                            join us in _userRepository.GetAll().AsNoTracking() on rcvHeader.EmployeeId equals us.Id into e
                            from us in e.DefaultIfEmpty()
                            join title1 in _titleRepo.GetAll().AsNoTracking() on us.TitlesId equals title1.Id into g
                            from title1 in g.DefaultIfEmpty()
                            join us2 in _userRepository.GetAll().AsNoTracking() on rcvHeader.EmployeeId2 equals us2.Id into f
                            from us2 in f.DefaultIfEmpty()
                            join title2 in _titleRepo.GetAll().AsNoTracking() on us2.TitlesId equals title2.Id into h
                            from title2 in h.DefaultIfEmpty()
                            join s in _supplierRepo.GetAll().AsNoTracking() on rcvHeader.VendorId equals s.Id 
                            join ss in _supplierSiteRepo.GetAll().AsNoTracking() on rcvHeader.VendorSiteId equals ss.Id into i
                            from ss in i.DefaultIfEmpty()
                            where rcvHeader.Id == id
                            select new GetRcvReceiptNoteHeadersDto()
                            {
                                Id = rcvHeader.Id,
                                ReceiptSourceCode = rcvHeader.ReceiptSourceCode,
                                VendorId = rcvHeader.VendorId,
                                VendorSiteId = rcvHeader.VendorSiteId,
                                OrganizationId = rcvHeader.OrganizationId,
                                ShipmentNum = rcvHeader.ShipmentNum,
                                ReceiptNoteNum = rcvHeader.ReceiptNoteNum,
                                BillOfLading = rcvHeader.BillOfLading,
                                ShippedDate = rcvHeader.ShippedDate,
                                EmployeeId = rcvHeader.EmployeeId,
                                WaybillAirbillNum = rcvHeader.WaybillAirbillNum,
                                Comments = rcvHeader.Comments,
                                ShipToOrgId = rcvHeader.ShipToOrgId,
                                ReceivedDate = rcvHeader.CreationTime,//noted 
                                ReceiptNoteType = rcvHeader.ReceiptNoteType,
                                EmployeeId2 = rcvHeader.EmployeeId2,
                                ServiceStartDate = rcvHeader.ServiceStartDate,
                                ServiceEndDate = rcvHeader.ServiceEndDate,
                                DeliverName1 = rcvHeader.DeliverName1,
                                DeliverTitle1 = rcvHeader.DeliverTitle1,
                                DeliverName2 = rcvHeader.DeliverName2,
                                DeliverTitle2 = rcvHeader.DeliverTitle2,

                                EmployeeName1 = us.Name,
                                EmployeeName2 = us2.Name,
                                EmployeeTitle1 = title1.Description,
                                EmployeeTitle2 = title2.Description,
                                VendorName = s.SupplierName,
                                VendorSiteCode = ss.VendorSiteCode,
                                Status = rcvHeader.Status
                };
            GetRcvReceiptNoteHeadersDto purchaseRequestForEditDto = prHeaders.FirstOrDefault();

            string _sql = "EXEC sp_RcvGetReceiptNoteLines @HeaderId";

            var listPrLines = await _dapperRepo.QueryAsync<InputRcvReceiptNoteLinesDto>(_sql, new
            {
                @HeaderId = id
            });

            if (listPrLines.Count() > 0)
            {
                purchaseRequestForEditDto.InputRcvReceiptNoteLinesDto = listPrLines.ToList();
            }
            return purchaseRequestForEditDto;
        }

        public async Task<PagedResultDto<InputRcvReceiptNoteLinesDto>> getReceiptNoteDetail(int id)
        {
            string _sql = "EXEC sp_RcvGetReceiptNoteLines @HeaderId";

            var filtered = await _dapperRepo.QueryAsync<InputRcvReceiptNoteLinesDto>(_sql, new
            {
                @HeaderId = id
            });
            return new PagedResultDto<InputRcvReceiptNoteLinesDto>(
                       filtered.Count(),
                       filtered.ToList()
                      );
        }

        public async Task<GetReceiptNoteReportDto> getReceiptNoteReportById(long? id, int pFormType)
        {
            var prHeaders = from rcvHeader in _rcvNoteHeaders.GetAll().AsNoTracking()
                            join us in _userRepository.GetAll().AsNoTracking() on rcvHeader.EmployeeId equals us.Id into e
                            from us in e.DefaultIfEmpty()
                            join title1 in _titleRepo.GetAll().AsNoTracking() on us.TitlesId equals title1.Id into g
                            from title1 in g.DefaultIfEmpty()
                            join us2 in _userRepository.GetAll().AsNoTracking() on rcvHeader.EmployeeId2 equals us2.Id into f
                            from us2 in f.DefaultIfEmpty()
                            join title2 in _titleRepo.GetAll().AsNoTracking() on us2.TitlesId equals title2.Id into h
                            from title2 in h.DefaultIfEmpty()
                            join s in _supplierRepo.GetAll().AsNoTracking() on rcvHeader.VendorId equals s.Id
                            join ss in _supplierSiteRepo.GetAll().AsNoTracking() on rcvHeader.VendorSiteId equals ss.Id into i
                            from ss in i.DefaultIfEmpty()
                            where rcvHeader.Id == id
                            select new GetReceiptNoteReportDto()
                            {
                                Id = rcvHeader.Id,
                                ReceiptSourceCode = rcvHeader.ReceiptSourceCode,
                                VendorId = rcvHeader.VendorId,
                                VendorSiteId = rcvHeader.VendorSiteId,
                                OrganizationId = rcvHeader.OrganizationId,
                                ShipmentNum = rcvHeader.ShipmentNum,
                                ReceiptNoteNum = rcvHeader.ReceiptNoteNum,
                                BillOfLading = rcvHeader.BillOfLading,
                                ShippedDate = rcvHeader.ShippedDate,
                                EmployeeId = rcvHeader.EmployeeId,
                                WaybillAirbillNum = rcvHeader.WaybillAirbillNum,
                                Comments = rcvHeader.Comments,
                                ShipToOrgId = rcvHeader.ShipToOrgId,
                                ReceivedDate = rcvHeader.CreationTime,//noted 
                                PoNo = "",
                                ReceiptNoteType = rcvHeader.ReceiptNoteType,
                                DeliverName1 = rcvHeader.DeliverName1,
                                DeliverTitle1 = rcvHeader.DeliverTitle1,
                                DeliverName2 = rcvHeader.DeliverName2,
                                DeliverTitle2 = rcvHeader.DeliverTitle2,

                                EmployeeName1 = us.Name,
                                EmployeeName2 = us2.Name,
                                EmployeeTitle1 = title1.Description,
                                EmployeeTitle2 = title2.Description,
                                VendorName = s.SupplierName,
                                VendorSiteCode = ss.VendorSiteCode,
                                Status = rcvHeader.Status,
                                ServiceStartDate = rcvHeader.ServiceStartDate,
                                ServiceEndDate = rcvHeader.ServiceEndDate,
                                FromType = pFormType
                            };

            GetReceiptNoteReportDto purchaseRequestForEditDto = prHeaders.FirstOrDefault();
            string _sql = "EXEC sp_RcvGetReceiptNoteLines @HeaderId";

            var listPrLines = await _dapperRepo.QueryAsync<InputRcvReceiptNoteLinesDto>(_sql, new
            {
                @HeaderId = id
            });

            if (listPrLines.Count() > 0)
            {
                purchaseRequestForEditDto.RNLines = listPrLines.ToList();
                purchaseRequestForEditDto.PoNo = purchaseRequestForEditDto.RNLines[0].PoNo; 
            }
            return purchaseRequestForEditDto;
            
        }

        public async Task<PagedResultDto<GetPoHeadersDto>> getPOsForReceiptNote(SearchPosForReceiptNotesDto input)
        {
            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { 
                input.VendorId = supplierId;
            }

            string _sql = @"EXEC sp_RcvReceiptNotesGetPOs 
                            @PoNo
                          ,@VendorId
                          ,@VendorSiteId
                          ,@ReceiptNoteType
                          ,@MaxResultCount
	                      ,@SkipCount";

            input.VendorId = input.VendorId ?? -1;
            input.VendorSiteId = input.VendorSiteId ?? -1;

            var filtered = (await _dapperRepo.QueryAsync<GetPoHeadersDto>(_sql, new
            {
                @PoNo = input.PoNo,
                @VendorId = input.VendorId?? -1,
                @VendorSiteId = input.VendorSiteId?? -1,
                @ReceiptNoteType = input.ReceiptNoteType,
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

        public async Task<FileDto> exportRN(SearchAllReceiptNotesDto input)
        {
            string fileName = "";

            fileName = "RN_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".xlsx";

            var supplierId = await _profileAppService.GetCurrentUserSupplierId();

            if (supplierId.HasValue && supplierId.Value > 0)
            { //supplier 
                input.VendorId = supplierId;
            }

            input.VendorId = input.VendorId == 0 ? -1 : input.VendorId;
            input.VendorSiteId = input.VendorSiteId == 0 ? -1 : input.VendorSiteId;

            string _sql = @"Exec [dbo].[sp_RcvGetAllReceiptNotes] 
                        @ReceiptNum
                        ,@VendorId
                        ,@VendorSiteId
                        ,@Status
                        ,@ReceiptNoteType 
                        ,@ShippedDateFrom
                        ,@ShippedDateTo
                        ,@MaxResultCount
	                    ,@SkipCount
                        ";

            input.MaxResultCount = int.MaxValue;
            input.SkipCount = 0;

            var data = (await _dapperRepo.QueryAsync<GetRcvReceiptNoteHeadersDto>(_sql, new
            {
                ReceiptNum = input.ReceiptNoteNum,
                VendorId = input.VendorId ?? -1,
                VendorSiteId = input.VendorSiteId ?? -1,
                Status = input.Status ?? -1,
                ReceiptNoteType = input.ReceiptNoteType,
                ShippedDateFrom = input.ShippedDateFrom,
                ShippedDateTo = input.ShippedDateTo,
                MaxResultCount = input.MaxResultCount,
                SkipCount = input.SkipCount,
            })).ToList();

            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string template = "wwwroot/Excel_Template";
            string path = Path.Combine(Directory.GetCurrentDirectory(), template, "CPS_Template_Export_RN.xlsx");

            var workBook = ExcelFile.Load(path);
            var workSheet = workBook.Worksheets[0];

            int startRow = 1;
            int endRow = data.Count;

            if (endRow > 0)
            {
                workSheet.Cells.GetSubrange($"A1:F{endRow + 1}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
                workSheet.Cells["C1"].Value = (input.ReceiptNoteType == 0 ? "Ngày giao" : "Ngày bắt đầu");
                workSheet.Cells["D1"].Value = (input.ReceiptNoteType == 0 ? "Ngày nhận hàng" : "Ngày kết thúc");
                GetRcvReceiptNoteHeadersDto row;
                for (int i = 0; i < endRow; i++)
                {
                    row = data[i];
                    /* STT */
                    workSheet.Cells[startRow + i, 0].Value = i + 1;
                    workSheet.Cells[startRow + i, 1].Value = row.ReceiptNoteNum ?? "";
                    workSheet.Cells[startRow + i, 2].Value = (row.ReceiptNoteType == 0 ? row.ReceivedDate : row.ServiceStartDate) ?? null;
                    workSheet.Cells[startRow + i, 3].Value = (row.ReceiptNoteType == 0 ? row.ReceivedDate : row.ServiceEndDate) ?? null;
                    workSheet.Cells[startRow + i, 4].Value = row.VendorName ?? "";
                    string statusStr = "";
                    switch (row.Status)
                    {
                        case 0:
                            statusStr = "Đã tạo GRN";
                            break;
                        case 1:
                            statusStr = "Đã tạo GRN";
                            break;
                        case 2:
                            statusStr = "Đã hủy";
                            break;
                        default:
                            break;
                    }
                    workSheet.Cells[startRow + i, 5].Value = statusStr;
                    workSheet.Cells[startRow + i, 6].Value = row.CreatorUser;
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
