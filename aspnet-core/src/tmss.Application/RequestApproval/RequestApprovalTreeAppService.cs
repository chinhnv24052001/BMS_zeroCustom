using Abp.Application.Services;
using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.Extensions;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using NPOI.SS.Formula.Functions;
using PayPalCheckoutSdk.Orders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Roles;
using tmss.Authorization.Users;
using tmss.EntityFrameworkCore;
using tmss.GR;
using tmss.Master;
using tmss.Master.SupplierRequest;
using tmss.Master.SupplierRequest.Dto;
using tmss.PaymentModule.Payment;
using tmss.PaymentModule.Payment.Dto;
using tmss.PO;
using tmss.PR;
using tmss.Price;
using tmss.Price.Dto;
using tmss.RequestApproval.Dto;
using tmss.SendMail;

namespace tmss.RequestApproval
{
    public class RequestApprovalTreeAppService : ApplicationService, IRequestApprovalTreeAppService
    {
        private readonly IRepository<PrRequisitionHeaders, long> _mstPrRequisitionHeadersRepository;
        private readonly IRepository<PoHeaders, long> _mstPoHeadersRepository;
        private readonly IRepository<UserRequest, long> _mstUserRequestRepository;
        private readonly IRepository<MstApprovalTreeDetail, long> _mstApprovalTreeDetailRepository;
        private readonly IRepository<MstApprovalTree, long> _mstApprovalTreeRepository;
        private readonly IRepository<RequestApprovalStep, long> _requestApprovalStepRepository;
        private readonly IRepository<RequestApprovalStepUser, long> _requestApprovalStepUserRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<MstProcessType, long> _mstProcessTypeRepository;
        private readonly IRepository<MstCurrency, long> _mstCurrencyRepository;
        private readonly IRepository<MstApprovalTreeDetailUser, long> _mstApprovalTreeDetailUserRepository;
        IRepository<MstHrOrgStructure, Guid> _mstHrOrgStructureRepository;
        IRepository<MstApprovalType, long> _mstApprovalTypeRepository;
        private readonly IDapperRepository<RequestApprovalStep, long> _requestApprovalDapperRepository;
        public readonly ISendEmail _sendEmail;
        IRepository<PrcContractHeaders, long> _prcContractHeadersRepository;
        private readonly IRepository<RcvShipmentHeaders, long> _rcvShipmentHeadersRepository;
        private readonly IRepository<PaymentHeaders, long> _paymentHeadersRepository;
        private readonly IRepository<MstGlExchangeRate, long> _rateRepo;
        private readonly IRepository<UserRole, long> _userRoleRepo;
        private readonly IRepository<Role> _roleRepo;
        private readonly IRepository<MstTitles, long> _titleRepo;
        private readonly IRepository<MstSupplierRequest, long> _supRepo;
        private readonly IRepository<MstSuppliers, long> _supplierRepo;
        private readonly IRepository<PrcAppendixContract, long> _prcAppendixContractRepo;
        private readonly IPaymentHeadersAppService _paymentHeadersAppService;
        private readonly IMstSupplierRequestAppService _supItf;
        private readonly IRcvShipmentHeadersAppService _rcvShipmentHeadersAppService; 
        private readonly IDapperRepository<User, long> _dapper;

        public RequestApprovalTreeAppService(
            IRepository<PrRequisitionHeaders, long> mstPrRequisitionHeadersRepository,
            IRepository<PoHeaders, long> mstPoHeadersRepository,
            IRepository<UserRequest, long> mstUserRequestRepository,
            IRepository<MstApprovalTreeDetail, long> mstApprovalTreeDetailRepository,
            IRepository<MstApprovalTree, long> mstApprovalTreeRepository,
            IRepository<RequestApprovalStep, long> requestApprovalStepRepository,
            IRepository<RequestApprovalStepUser, long> requestApprovalStepUserRepository,
            IRepository<User, long> userRepository,
            IRepository<MstProcessType, long> mstProcessTypeRepository,
            IRepository<MstCurrency, long> mstCurrencyRepository,
            IRepository<MstApprovalTreeDetailUser, long> mstApprovalTreeDetailUserRepository,
            IRepository<MstHrOrgStructure, Guid> mstHrOrgStructureRepository,
            IRepository<MstApprovalType, long> mstApprovalTypeRepository,
            ISendEmail sendEmail,
            IDapperRepository<RequestApprovalStep, long> requestApprovalDapperRepository,
            IRepository<PrcContractHeaders, long> prcContractHeadersRepository,
            IRepository<RcvShipmentHeaders, long> rcvShipmentHeadersRepository,
            IRepository<PaymentHeaders, long> paymentHeadersRepository,
            IRepository<MstGlExchangeRate, long> rateRepo,
            IRepository<UserRole, long> userRoleRepo,
            IRepository<Role> roleRepo,
            IRepository<MstTitles,long> titleRepo,
            IRepository<MstSupplierRequest, long> supRepo,
            IRepository<MstSuppliers, long> supplierRepo,
            IPaymentHeadersAppService paymentHeadersAppService,
            IMstSupplierRequestAppService supItf,
            IRcvShipmentHeadersAppService rcvShipmentHeadersAppService,
            IDapperRepository<User, long> dapper,
            IRepository<PrcAppendixContract, long> prcAppendixContractRepo)
        {
            _mstPrRequisitionHeadersRepository = mstPrRequisitionHeadersRepository;
            _mstPoHeadersRepository = mstPoHeadersRepository;
            _mstUserRequestRepository = mstUserRequestRepository;
            _mstApprovalTreeDetailRepository = mstApprovalTreeDetailRepository;
            _mstApprovalTreeRepository = mstApprovalTreeRepository;
            _requestApprovalStepRepository = requestApprovalStepRepository;
            _requestApprovalStepUserRepository = requestApprovalStepUserRepository;
            _userRepository = userRepository;
            _mstProcessTypeRepository = mstProcessTypeRepository;
            _mstCurrencyRepository = mstCurrencyRepository;
            _mstApprovalTreeDetailUserRepository = mstApprovalTreeDetailUserRepository;
            _mstHrOrgStructureRepository = mstHrOrgStructureRepository;
            _mstApprovalTypeRepository = mstApprovalTypeRepository;
            _sendEmail = sendEmail;
            _requestApprovalDapperRepository = requestApprovalDapperRepository;
            _prcContractHeadersRepository = prcContractHeadersRepository;
            _rcvShipmentHeadersRepository = rcvShipmentHeadersRepository;
            _paymentHeadersRepository = paymentHeadersRepository;
            _rateRepo = rateRepo;
            _userRoleRepo = userRoleRepo;
            _roleRepo = roleRepo;
            _titleRepo = titleRepo;
            _supRepo = supRepo;
            _supplierRepo = supplierRepo;
            _paymentHeadersAppService = paymentHeadersAppService;
            _supItf = supItf;
            _rcvShipmentHeadersAppService = rcvShipmentHeadersAppService;
            _dapper = dapper;
            _prcAppendixContractRepo = prcAppendixContractRepo;
        }

        //Approval
        [AbpAuthorize(AppPermissions.ApprovalManagement_Rejected, AppPermissions.ApprovalManagement_ApproveRequest)]
        public async Task<ApproveOrRejectOutputDto> ApproveOrReject(ApproveOrRejectInputDto approveOrRejectInputDto)
        {
            //Lấy bảng ra bảng step theo đk RequestApprovalStepId từ dto
            //update lại bảng step 
            var userId = AbpSession.UserId;
            var requestApprovalStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(approveOrRejectInputDto.RequestApprovalStepId);
            if (requestApprovalStep != null)
            {
                if (approveOrRejectInputDto.IsApproved)
                {
                    requestApprovalStep.ApprovalStatus = AppConsts.STATUS_APPROVED;
                    requestApprovalStep.ApprovalDate = DateTime.Now;
                }
                else
                {
                    requestApprovalStep.ApprovalStatus = AppConsts.STATUS_REJECTED;
                    requestApprovalStep.RejectDate = DateTime.Now;
                }

                requestApprovalStep.ApprovalUserId = approveOrRejectInputDto.ApprovalUserId;
                
                
                
                requestApprovalStep.Note = approveOrRejectInputDto.Note;
                requestApprovalStep.LastModificationTime = DateTime.Now;
                requestApprovalStep.LastModifierUserId = AbpSession.UserId;
                await _requestApprovalStepRepository.UpdateAsync(requestApprovalStep);
                //Nếu là approve thì tìm người tiếp theo để gửi yêu cầu
                if (approveOrRejectInputDto.IsApproved)
                {
                    var requestApprovalStepUser = _requestApprovalStepUserRepository.GetAll().Where(p => p.RequestApprovalStepId == approveOrRejectInputDto.RequestApprovalStepId
                                                                                                    && p.ApprovalUserId == userId).FirstOrDefault();
                    if (requestApprovalStepUser != null)
                    {
                        requestApprovalStep.ApprovalHrOrgStructureId = requestApprovalStepUser.ApprovalHrOrgStructureId;
                        requestApprovalStepUser.ApprovalDate = DateTime.Now;
                        requestApprovalStepUser.LastModificationTime = DateTime.Now;
                        requestApprovalStepUser.LastModifierUserId = userId;
                        await _requestApprovalStepUserRepository.UpdateAsync(requestApprovalStepUser);

                        string departmentName = "";
                        if (requestApprovalStepUser.ApprovalHrOrgStructureId != null)
                        {
                            departmentName = await _mstHrOrgStructureRepository.GetAll().Where(e => e.Id == requestApprovalStepUser.ApprovalHrOrgStructureId && e.Published == 1).Select(o => o.Name).FirstOrDefaultAsync();
                        }
                            

                        ApproveOrRejectOutputDto approveOrRejectOutputDto = new ApproveOrRejectOutputDto();
                        RequestApprovalStep requestApprovalStepNext = _requestApprovalStepRepository.GetAll().Where(
                           p => p.ReqId == approveOrRejectInputDto.ReqId
                           && p.ProcessTypeCode == approveOrRejectInputDto.ProcessTypeCode
                           && p.ApprovalStatus == AppConsts.STATUS_PENDING
                           ).OrderBy(p => p.ApprovalSeq)
                         .FirstOrDefault();
                        
                        if (requestApprovalStepNext == null)
                        {
                            //Không còn ai phê duyệt, mức cuối
                            approveOrRejectOutputDto.IsLast = true;
                            //Đánh dấu luồng duyệt đã kết thúc
                            var userList = await _userRepository.GetAll().AsNoTracking().ToListAsync();
                            var departmentList = await _mstHrOrgStructureRepository.GetAll().AsNoTracking().ToListAsync();
                            SendEmailContent sendEmail = new SendEmailContent();
                            sendEmail.EmailTemplateCode = AppConsts.REPLY_APPROVAL_REQUEST;

                            

                            if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PC)
                            {
                                var pcRequest = await _prcContractHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                pcRequest.ApprovalStatus = AppConsts.STATUS_APPROVED;
                                pcRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PR)
                            {

                                    var prRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                    if (prRequest.PicUserId == null || prRequest.PicUserId == 0) throw new UserFriendlyException(400, "Vui lòng chọn buyer xử lý chứng từ này!");   
                                    prRequest.AuthorizationStatus = AppConsts.STATUS_APPROVED;
                                    prRequest.ApprovedDate = DateTime.Now;
                                    prRequest.DepartmentApprovalName = departmentName;
                                    
                                
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.UR)
                            {

                                    var urRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                    if (urRequest.PicUserId == null || urRequest.PicUserId == 0) throw new UserFriendlyException(400, "Vui lòng chọn buyer xử lý chứng từ này!");

                                    urRequest.ApprovalStatus = AppConsts.STATUS_APPROVED;
                                    urRequest.DepartmentApprovalName = departmentName;


                                    sendEmail.Subject = $"Approved - {departmentName} - User request {urRequest.UserRequestNumber} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                                    sendEmail.From = userList.Find(e => e.Id == urRequest.CreatorUserId).FullName + "-"
                                        + departmentList.Find(e => e.Id == userList.Find(e => e.Id == urRequest.CreatorUserId).HrOrgStructureId).Name
                                        + $"({userList.Find(e => e.Id == urRequest.CreatorUserId).EmailAddress})";
                                    sendEmail.ApprovalPerson = userList.Find(e => e.Id == AbpSession.UserId).FullName;
                                    sendEmail.Document = $"User request {urRequest.UserRequestNumber}";
                                    sendEmail.Description = urRequest.Note;
                                    sendEmail.Status = urRequest.ApprovalStatus;
                                    sendEmail.Person = userList.Find(e => e.Id == urRequest.CreatorUserId).FullName;
                                    //sendEmail.Receiver = userList.Find(e => e.Id == urRequest.CreatorUserId).EmailAddress;
                                    sendEmail.Receiver = "hoatv.biz@hotmail.com";

                                    await _sendEmail.SendEmail(sendEmail);
                               
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PO)
                            {
                               
                                var poRequest = await _mstPoHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                poRequest.AuthorizationStatus = AppConsts.STATUS_APPROVED;
                                poRequest.DepartmentApprovalName = departmentName;

                                sendEmail.Subject = $"Xác nhận đơn đặt hàng {poRequest.Segment1} - {DateTime.Now.ToString("dd/MM/yyyy")}";

                                //sendEmail.Receiver = userList.Find(e => e.Id == urRequest.CreatorUserId).EmailAddress;
                                var supplier = await _supplierRepo.FirstOrDefaultAsync(e => e.Id == poRequest.VendorId);
                                if (supplier != null)
                                {
                                    sendEmail.Person = supplier.SupplierName;
                                    var user = userList.Find(e => e.UserName == supplier.VatRegistrationNum);
                                    if (user != null)
                                    {
                                        sendEmail.Receiver = user.EmailAddress;
                                        await _sendEmail.sendEmailPoToSupplier(sendEmail, poRequest.Segment1);
                                    }
                                   
                                }

                                //_requestApprovalDapperRepository.ExecuteAsync("EXEC sp_PoSynToOrcale @PoHeaderId", new { @PoHeaderId = poRequest.Id});
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.GR)
                            {
                                var grRequest = await _rcvShipmentHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                grRequest.AuthorizationStatus = AppConsts.STATUS_APPROVED;
                                grRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PM)
                            {
                                var paymentRequest = await _paymentHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                paymentRequest.AuthorizationStatus = AppConsts.STATUS_APPROVED;
                                paymentRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.SR)
                            {
                                var supRequest = await _supRepo.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                supRequest.ApprovalStatus = AppConsts.STATUS_APPROVED;
                                supRequest.DepartmentApprovalName = departmentName;

                                //tạo account
                                SupplierRequestInfoDto data = ObjectMapper.Map<SupplierRequestInfoDto>(supRequest);
                                data.CreateAccount = true;
                                data.RequestBaseUrl = approveOrRejectInputDto.CreateSupplierAccountUrl ; 
                                await _supItf.Approve(data);
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.AN || approveOrRejectInputDto.ProcessTypeCode == AppConsts.BD)
                            {
                                string _sqlAnnex = "EXEC sp_PrcAppendixContractGetById @p_id";
                                var _listAnnex = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlAnnex, new
                                {
                                    p_id = approveOrRejectInputDto.ReqId
                                })).ToList();

                                string _sqlUpdAnnex = "EXEC sp_PrcAppendixContractUpdStauts @p_status,@p_id,@p_user";
                                await _dapper.ExecuteAsync(_sqlUpdAnnex, new
                                {
                                    @p_status = AppConsts.STATUS_APPROVED,
                                    @p_id = approveOrRejectInputDto.ReqId,
                                    @p_user = AbpSession.UserId
                                });
                                string _sqlUpdatePrice = "EXEC sp_PrcAppendixContractItems_InsNewPrice @p_appendix_id,@p_user";
                                _dapper.Execute(_sqlUpdatePrice, new
                                {
                                    @p_appendix_id = approveOrRejectInputDto.ReqId,
                                    @p_user = AbpSession.UserId
                                });
                            }
                            else
                            {
                                throw new UserFriendlyException(400, "Chưa cài đặt yêu cầu khác!");
                            }


                            //var userList = await _userRepository.GetAll().AsNoTracking().ToListAsync();
                            //var departmentList = await _mstHrOrgStructureRepository.GetAll().AsNoTracking().ToListAsync();
                            //SendEmailContent sendEmail = new SendEmailContent();
                            //sendEmail.EmailTemplateCode = AppConsts.REPLY_APPROVAL_REQUEST;
                            //if (approveOrRejectInputDto.ProcessTypeCode == "UR")
                            //{
                            //    var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                            //    if (userRequest == null)
                            //    {
                            //        throw new UserFriendlyException(400, "Can not find user request!");
                            //    }
                            //    else
                            //    {
                            //        sendEmail.Subject = $"Approved - {departmentList.Find(e => e.Id == userList.Find(e => e.Id == userRequest.CreatorUserId).HrOrgStructureId).Name} - User request {userRequest.UserRequestNumber} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                            //        sendEmail.From = userList.Find(e => e.Id == userRequest.CreatorUserId).FullName + "-"
                            //            + departmentList.Find(e => e.Id == userList.Find(e => e.Id == userRequest.CreatorUserId).HrOrgStructureId).Name
                            //            + $"({userList.Find(e => e.Id == userRequest.CreatorUserId).EmailAddress})";
                            //        sendEmail.ApprovalPerson = userList.Find(e => e.Id == AbpSession.UserId).FullName;
                            //        sendEmail.Document = $"User request {userRequest.UserRequestNumber}";
                            //        sendEmail.Description = userRequest.Note;
                            //        sendEmail.Status = userRequest.ApprovalStatus;
                            //        sendEmail.Person = userList.Find(e => e.Id == userRequest.CreatorUserId).FullName;
                            //        sendEmail.Receiver = userList.Find(e => e.Id == userRequest.CreatorUserId).EmailAddress;
                            //    }
                            //}
                            //else if (approveOrRejectInputDto.ProcessTypeCode == "PR")
                            //{
                            //    var purchaseRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                            //    if (purchaseRequest == null)
                            //    {
                            //        throw new UserFriendlyException(400, "Can not find purchase request!");
                            //    }
                            //    else
                            //    {
                            //        sendEmail.Subject = $"Approved - {departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseRequest.CreatorUserId).HrOrgStructureId).Name} - User request {purchaseRequest.RequisitionNo} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                            //        sendEmail.From = userList.Find(e => e.Id == purchaseRequest.CreatorUserId).FullName + "-"
                            //            + departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseRequest.CreatorUserId).HrOrgStructureId).Name
                            //            + $"({userList.Find(e => e.Id == purchaseRequest.CreatorUserId).EmailAddress})";
                            //        sendEmail.Document = $"Purchase request {purchaseRequest.RequisitionNo}";
                            //        sendEmail.Description = purchaseRequest.Description;
                            //        sendEmail.Status = purchaseRequest.AuthorizationStatus;
                            //        sendEmail.Person = userList.Find(e => e.Id == purchaseRequest.CreatorUserId).FullName;
                            //        sendEmail.Receiver = userList.Find(e => e.Id == purchaseRequest.CreatorUserId).EmailAddress;
                            //    }
                            //}
                            //else if (approveOrRejectInputDto.ProcessTypeCode == "PO")
                            //{
                            //    var purchaseOrder = await _mstPoHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                            //    if (purchaseOrder == null)
                            //    {
                            //        throw new UserFriendlyException(400, "Can not find purchase request!");
                            //    }
                            //    else
                            //    {
                            //        sendEmail.Subject = $"Approved - {departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseOrder.CreatorUserId).HrOrgStructureId).Name} - User request {purchaseOrder.Segment1} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                            //        sendEmail.From = userList.Find(e => e.Id == purchaseOrder.CreatorUserId).FullName + "-"
                            //            + departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseOrder.CreatorUserId).HrOrgStructureId).Name
                            //            + $"({userList.Find(e => e.Id == purchaseOrder.CreatorUserId).EmailAddress})";
                            //        sendEmail.Document = $"Purchase request {purchaseOrder.Segment1}";
                            //        sendEmail.Description = purchaseOrder.Description;
                            //        sendEmail.Status = purchaseOrder.AuthorizationStatus;
                            //        sendEmail.Person = userList.Find(e => e.Id == purchaseOrder.CreatorUserId).FullName;
                            //        sendEmail.Receiver = userList.Find(e => e.Id == purchaseOrder.CreatorUserId).EmailAddress;
                            //    }
                            //}

                            ////Gọi hàm gửi email
                            //await _sendEmail.SendEmail(sendEmail);
                        }
                        else
                        {
                            if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PC)
                            {
                                var pcRequest = await _prcContractHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                pcRequest.ApprovalStatus = AppConsts.STATUS_IN_PROCESS;
                                pcRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PR)
                            {
                                var prRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                prRequest.AuthorizationStatus = AppConsts.STATUS_IN_PROCESS;
                                prRequest.ApprovedDate = DateTime.Now;
                                prRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.UR)
                            {
                                var urRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                urRequest.ApprovalStatus = AppConsts.STATUS_IN_PROCESS;
                                urRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PO)
                            {
                                var poRequest = await _mstPoHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                poRequest.AuthorizationStatus = AppConsts.STATUS_IN_PROCESS;
                                poRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.GR)
                            {
                                var grRequest = await _rcvShipmentHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                grRequest.AuthorizationStatus = AppConsts.STATUS_IN_PROCESS;
                                grRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PM)
                            {
                                var paymentRequest = await _paymentHeadersRepository.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                paymentRequest.AuthorizationStatus = AppConsts.STATUS_IN_PROCESS;
                                paymentRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.SR)
                            {
                                var supRequest = await _supRepo.FirstOrDefaultAsync(p => p.Id == approveOrRejectInputDto.ReqId);
                                supRequest.ApprovalStatus = AppConsts.STATUS_IN_PROCESS;
                                supRequest.DepartmentApprovalName = departmentName;
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.AN)
                            {
                                string _sqlAnnex = "EXEC sp_PrcAppendixContractGetById @p_id";
                                var _listAnnex = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sqlAnnex, new
                                {
                                    p_id = approveOrRejectInputDto.ReqId
                                })).ToList();

                                string _sqlUpdAnnex = "EXEC sp_PrcAppendixContractUpdStauts @p_status,@p_id,@p_user";
                                await _dapper.ExecuteAsync(_sqlUpdAnnex, new
                                {
                                    @p_status = AppConsts.STATUS_IN_PROCESS,
                                    @p_id = approveOrRejectInputDto.ReqId,
                                    @p_user = AbpSession.UserId
                                });                           
                            }

                            else
                            {
                                throw new UserFriendlyException(400, "Chưa cài đặt yêu cầu khác!");
                            }
                            approveOrRejectOutputDto.IsLast = false;
                            //Tu dong goi next tiep 
                            RequestNextApprovalTreeInputDto requestNextApprovalTreeInputDto = new RequestNextApprovalTreeInputDto();
                            requestNextApprovalTreeInputDto.ReqId = approveOrRejectInputDto.ReqId;
                            requestNextApprovalTreeInputDto.ProcessTypeCode = approveOrRejectInputDto.ProcessTypeCode;

                            var userList = await _userRepository.GetAll().AsNoTracking().ToListAsync();
                            var departmentList = await _mstHrOrgStructureRepository.GetAll().AsNoTracking().ToListAsync();
                            SendEmailContent sendEmail = new SendEmailContent();
                            if (approveOrRejectInputDto.ProcessTypeCode == "UR")
                            {
                                var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                                if (userRequest == null)
                                {
                                    throw new UserFriendlyException(400, "Can not find user request!");
                                }
                                else
                                {
                                    sendEmail.Subject = $"Rejected - {departmentList.Find(e => e.Id == userList.Find(e => e.Id == userRequest.CreatorUserId).HrOrgStructureId).Name} - User request {userRequest.UserRequestNumber} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                                    sendEmail.From = userList.Find(e => e.Id == userRequest.CreatorUserId).FullName + "-"
                                        + departmentList.Find(e => e.Id == userList.Find(e => e.Id == userRequest.CreatorUserId).HrOrgStructureId).Name
                                        + $"({userList.Find(e => e.Id == userRequest.CreatorUserId).EmailAddress})";
                                    sendEmail.ApprovalPerson = userList.Find(e => e.Id == AbpSession.UserId).FullName;
                                    sendEmail.Document = $"User request {userRequest.UserRequestNumber}";
                                    sendEmail.Description = userRequest.Note;
                                    sendEmail.Status = userRequest.ApprovalStatus;
                                    sendEmail.Person = userList.Find(e => e.Id == userRequest.CreatorUserId).FullName;
                                    sendEmail.Receiver = userList.Find(e => e.Id == userRequest.CreatorUserId).EmailAddress;
                                }
                            }
                            else if (approveOrRejectInputDto.ProcessTypeCode == "PR")
                            {
                                var purchaseRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                                if (purchaseRequest == null)
                                {
                                    throw new UserFriendlyException(400, "Can not find purchase request!");
                                }
                                else
                                {
                                    sendEmail.Subject = $"Rejected - {departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseRequest.CreatorUserId).HrOrgStructureId).Name} - Purchase request {purchaseRequest.RequisitionNo} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                                    sendEmail.From = userList.Find(e => e.Id == purchaseRequest.CreatorUserId).FullName + "-"
                                        + departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseRequest.CreatorUserId).HrOrgStructureId).Name
                                        + $"({userList.Find(e => e.Id == purchaseRequest.CreatorUserId).EmailAddress})";
                                    sendEmail.Document = $"Purchase request {purchaseRequest.RequisitionNo}";
                                    sendEmail.Description = purchaseRequest.Description;
                                    sendEmail.Status = purchaseRequest.AuthorizationStatus;
                                    sendEmail.Person = userList.Find(e => e.Id == purchaseRequest.CreatorUserId).FullName;
                                    sendEmail.Receiver = userList.Find(e => e.Id == purchaseRequest.CreatorUserId).EmailAddress;
                                }
                            }
                            else if (requestNextApprovalTreeInputDto.ProcessTypeCode == "PO")
                            {
                                var purchaseOrder = await _mstPoHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                                if (purchaseOrder == null)
                                {
                                    throw new UserFriendlyException(400, "Can not find purchase request!");
                                }
                                else
                                {
                                    sendEmail.Subject = $"Rejected - {departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseOrder.CreatorUserId).HrOrgStructureId).Name} - Purchase Order {purchaseOrder.Segment1} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                                    sendEmail.From = userList.Find(e => e.Id == purchaseOrder.CreatorUserId).FullName + "-"
                                        + departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseOrder.CreatorUserId).HrOrgStructureId).Name
                                        + $"({userList.Find(e => e.Id == purchaseOrder.CreatorUserId).EmailAddress})";
                                    sendEmail.Document = $"Purchase request {purchaseOrder.Segment1}";
                                    sendEmail.Description = purchaseOrder.Description;
                                    sendEmail.Status = purchaseOrder.AuthorizationStatus;
                                    sendEmail.Person = userList.Find(e => e.Id == purchaseOrder.CreatorUserId).FullName;
                                    sendEmail.Receiver = userList.Find(e => e.Id == purchaseOrder.CreatorUserId).EmailAddress;
                                }
                            }

                            else if (requestNextApprovalTreeInputDto.ProcessTypeCode == "SR")
                            {
                                var supRequest = await _supRepo.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                                if (supRequest == null)
                                {
                                    throw new UserFriendlyException(400, "Can not find supplier request!");
                                }
                                else
                                {
                                    sendEmail.Subject = $"Rejected - {departmentList.Find(e => e.Id == userList.Find(e => e.Id == supRequest.CreatorUserId).HrOrgStructureId).Name} - Purchase Order {supRequest.RequestNo} - {DateTime.Now.ToString("dd/MM/yyyy")}";
                                    sendEmail.From = userList.Find(e => e.Id == supRequest.CreatorUserId).FullName + "-"
                                        + departmentList.Find(e => e.Id == userList.Find(e => e.Id == supRequest.CreatorUserId).HrOrgStructureId).Name
                                        + $"({userList.Find(e => e.Id == supRequest.CreatorUserId).EmailAddress})";
                                    sendEmail.Document = $"Purchase request {supRequest.RequestNo}";
                                    sendEmail.Description = "";
                                    sendEmail.Status = supRequest.ApprovalStatus;
                                    sendEmail.Person = userList.Find(e => e.Id == supRequest.CreatorUserId).FullName;
                                    sendEmail.Receiver = userList.Find(e => e.Id == supRequest.CreatorUserId).EmailAddress;
                                }
                            }

                            //Gọi hàm gửi email
                            await _sendEmail.SendEmail(sendEmail);

                            await RequestNextApprovalTree(requestNextApprovalTreeInputDto);

                        }
                        approveOrRejectOutputDto.Status = true;
                        return approveOrRejectOutputDto;
                    }
                    else
                    {
                        throw new UserFriendlyException(400, "Request step user not found!");
                    }
                }
                else
                {

                    string departmentName = "";
                    var requestApprovalStepUser = _requestApprovalStepUserRepository.GetAll().Where(p => p.RequestApprovalStepId == approveOrRejectInputDto.RequestApprovalStepId
                                                                                                    && p.ApprovalUserId == userId).FirstOrDefault();
                    if (requestApprovalStepUser != null)
                    {
                        requestApprovalStepUser.RejectDate = DateTime.Now;
                        if (requestApprovalStepUser.ApprovalHrOrgStructureId != null)
                        {
                            departmentName = await _mstHrOrgStructureRepository.GetAll().Where(e => e.Id == requestApprovalStepUser.ApprovalHrOrgStructureId && e.Published == 1).Select(o => o.Name).FirstOrDefaultAsync();
                        }
                    }
                    
                    if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.UR)
                    {

                        var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);

                        if (userRequest == null)
                        {
                            throw new UserFriendlyException("UR not found!");
                        }
                        else
                        {
                            if (userRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                            userRequest.ApprovalStatus = AppConsts.STATUS_REJECTED;
                            userRequest.DepartmentApprovalName = departmentName;

                        }
                    }
                    else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PR)
                    {
                        var prRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                        if (prRequest == null)
                        {
                            throw new UserFriendlyException("PR not found!");
                        }
                        else
                        {
                            if (prRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                            prRequest.AuthorizationStatus = AppConsts.STATUS_REJECTED;
                            prRequest.DepartmentApprovalName = departmentName;
                        }
                    }
                    else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PO)
                    {
                        var poRequest = await _mstPoHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                        if (poRequest != null)
                        {
                            if (poRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                            poRequest.AuthorizationStatus = AppConsts.STATUS_REJECTED;
                            poRequest.DepartmentApprovalName = departmentName;
                        }
                        else
                        {
                            throw new UserFriendlyException(400, "PO not found!");
                        }
                    }
                    else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PC)
                    {
                        var pcRequest = await _prcContractHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                        if (pcRequest == null)
                        {
                            throw new UserFriendlyException("Contract not found!");
                        }
                        else
                        {
                            if (pcRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                            pcRequest.ApprovalStatus = AppConsts.STATUS_REJECTED;
                            pcRequest.DepartmentApprovalName = departmentName;
                        }
                    }
                    else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.GR)
                    {
                        var grRequest = await _rcvShipmentHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                        if (grRequest == null)
                        {
                            throw new UserFriendlyException("GR not found!");
                        }
                        else
                        {
                            if (grRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                            grRequest.AuthorizationStatus = AppConsts.STATUS_REJECTED;
                            grRequest.DepartmentApprovalName = departmentName;
                            await _rcvShipmentHeadersAppService.CancelReceipt(grRequest.Id); //revert data 
                        }
                    }
                    else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.PM)
                    {
                        var paymentRequest = await _paymentHeadersRepository.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                        if (paymentRequest == null)
                        {
                            throw new UserFriendlyException("GR not found!");
                        }
                        else
                        {
                            if (paymentRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                            paymentRequest.AuthorizationStatus = AppConsts.STATUS_REJECTED;
                            paymentRequest.DepartmentApprovalName = departmentName;
                            await _paymentHeadersAppService.CancelPayment(approveOrRejectInputDto.ReqId); //revert data 
                        }
                    }
                    else if (approveOrRejectInputDto.ProcessTypeCode == AppConsts.SR)
                    {
                        var supRequest = await _supRepo.FirstOrDefaultAsync(e => e.Id == approveOrRejectInputDto.ReqId);
                        if (supRequest == null)
                        {
                            throw new UserFriendlyException("SR not found!");
                        }
                        else
                        {
                            if (supRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                            supRequest.ApprovalStatus = AppConsts.STATUS_REJECTED;
                            supRequest.DepartmentApprovalName = departmentName;
                            //await _paymentHeadersAppService.CancelPayment(approveOrRejectInputDto.ReqId); //revert data 
                        }
                    }
                    else
                    {
                        throw new UserFriendlyException(400, "Request type not found");
                    }
                    ApproveOrRejectOutputDto approveOrRejectOutputDto = new ApproveOrRejectOutputDto();
                    approveOrRejectOutputDto.IsLast = true;
                    approveOrRejectOutputDto.Status = true;
                    return approveOrRejectOutputDto;
                    //throw new UserFriendlyException(400, "Chưa cài đăt luồng từ chối!");
                }
                

            }
            else
            {
                throw new UserFriendlyException(400, "Request step not found!");
            }

        }


        #region -- Tạo yêu cầu duyệt
        [AbpAuthorize(AppPermissions.UserRequest_ManageUserRequest_SendRequest, AppPermissions.PurchaseOrders_PurchaseOrdersManagement_SendRequest, AppPermissions.InvoiceItems_PaymentRequest_SendRequest)]
        public async Task<CreateRequestApprovalOutputDto> CreateRequestApprovalTree(CreateRequestApprovalInputDto createRequestApprovalInputDto)
        {
            CreateRequestApprovalOutputDto createRequestApprovalOutputDto = new CreateRequestApprovalOutputDto();
            createRequestApprovalOutputDto.Result = false;
            long InventoryGroupId = 0;
            long CurencyId = 0;
            decimal TotalPrice = 0;
            var checkSent = await _requestApprovalStepRepository.FirstOrDefaultAsync(e => e.ReqId == createRequestApprovalInputDto.ReqId
            && e.ProcessTypeCode == createRequestApprovalInputDto.ProcessTypeCode);
            var checkHasNoReject = await _requestApprovalStepRepository.GetAll().Where(e => e.ReqId == createRequestApprovalInputDto.ReqId
            && e.ProcessTypeCode == createRequestApprovalInputDto.ProcessTypeCode).ToListAsync();
            var dbContext = CurrentUnitOfWork.GetDbContext<tmssDbContext>();

            if (checkHasNoReject.Count() > 0 && (!checkHasNoReject.Any(e => e.ApprovalStatus == AppConsts.STATUS_REJECTED)))
            {
                throw new UserFriendlyException(400, "User Request sent!");
            }
            if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.UR)
            {
                //Lây loại từ bảng PoHeaders,Amount From, To, Currency
                //ProcessTypeId = 1;
                //Quyry vào bảng PrRequisitionHeaders theo ID lay duoc cot InventoryGroupId
                //Lay amount trong bang PrRequisitionHeaders
                var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);

                if (userRequest == null)
                {
                    throw new UserFriendlyException("UR not found!");
                }
                else
                {
                    //if (userRequest != null && userRequest.BudgetCodeId == null) throw new UserFriendlyException("BudgetCode can not be empty!");
                    if (userRequest.ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (userRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");

                    InventoryGroupId = userRequest.InventoryGroupId ?? 0;
                    CurencyId = userRequest.CurrencyId ?? 0;
                    TotalPrice = userRequest.TotalPriceUsd ?? 0;

                    userRequest.ApprovalStatus = AppConsts.STATUS_NEW;
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PR)
            {
                var prRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (prRequest == null)
                {
                    throw new UserFriendlyException("PR not found!");
                }
                else
                {
                    if (prRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (prRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    var currency = await _mstCurrencyRepository.FirstOrDefaultAsync(p => p.CurrencyCode == prRequest.CurrencyCode);
                    if (currency == null)
                    {
                        throw new UserFriendlyException(400, "Currency not found!");
                    }
                    else
                    {
                        CurencyId = currency.Id;
                        InventoryGroupId = prRequest.InventoryGroupId ?? 0;
                        prRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                        TotalPrice = prRequest.TotalPriceUsd ?? 0;
                    }
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PO)
            {
                var poRequest = await _mstPoHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (poRequest != null)
                {
                    if (poRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (poRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    //InventoryGroupId = poRequest.InventoryGroupId;
                    var currency = await _mstCurrencyRepository.FirstOrDefaultAsync(p => p.CurrencyCode == poRequest.CurrencyCode);
                    if (currency == null)
                    {
                        throw new UserFriendlyException(400, "Currency not found!");
                    }
                    else
                    {
                        CurencyId = currency.Id;// curency của header 
                        poRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                        InventoryGroupId = (long)poRequest.InventoryGroupId;
                        TotalPrice = poRequest.TotalPriceUsd ?? 0;// header price theo curency của header 
                    }
                }
                else
                {
                    throw new UserFriendlyException(400, "PO not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PC)
            {
                var pcRequest = await _prcContractHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (pcRequest == null)
                {
                    throw new UserFriendlyException("Contract not found!");
                }
                else
                {
                    if (pcRequest.ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (pcRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    //InventoryGroupId = poRequest.InventoryGroupId;
                    InventoryGroupId = 0;
                    pcRequest.ApprovalStatus = AppConsts.STATUS_NEW;
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.GR)
            {
                var grRequest = await _rcvShipmentHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (grRequest != null)
                {
                    if (grRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (grRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    InventoryGroupId = grRequest.InventoryGroupId ?? 0;
                    CurencyId = 0;
                    grRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                }
                else
                {
                    throw new UserFriendlyException(400, "GR not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PM)
            {
                var paymentRequest = await _paymentHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (paymentRequest != null)
                {
                    if (paymentRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (paymentRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    CurencyId = 0;
                    InventoryGroupId = 0;
                    TotalPrice = paymentRequest.TotalAmount;
                    paymentRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                }
                else
                {
                    throw new UserFriendlyException(400, "Payment not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.AN)
            {
                string _sql = "EXEC sp_PrcAppendixContractGetById @p_id";
                var contract = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
                {
                    p_id = createRequestApprovalInputDto.ReqId
                })).ToList();
                if (contract != null)
                {
                    if (contract[0].ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (contract[0].ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    InventoryGroupId = 0;
                    CurencyId = 0;
                    string _sqlIns = "EXEC sp_PrcAppendixContractUpdStauts @p_status,@p_id,@p_user";
                    await _dapper.ExecuteAsync(_sqlIns, new
                    {
                        @p_status = AppConsts.STATUS_NEW,
                        @p_id = createRequestApprovalInputDto.ReqId,
                        @p_user = AbpSession.UserId
                    });
                }
                else
                {
                    throw new UserFriendlyException(400, "AN not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.BD)
            {
                var contractBackdate = await _prcAppendixContractRepo.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (contractBackdate != null)
                {
                    if (contractBackdate.ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (contractBackdate.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    CurencyId = 0;
                    InventoryGroupId = 0;
                    contractBackdate.ApprovalStatus = AppConsts.STATUS_NEW;
                }
                else
                {
                    throw new UserFriendlyException(400, "Payment not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.SR)
            {
                var supplierRequest = await _supRepo.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (supplierRequest != null)
                { 
                    if (supplierRequest.ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (supplierRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    CurencyId = 0;
                    InventoryGroupId = 0;
                    supplierRequest.ApprovalStatus = AppConsts.STATUS_NEW;
                }
                else
                {
                    throw new UserFriendlyException(400, "Request not found!");
                }
            }
            else
            {
                throw new UserFriendlyException(400, "Request type not found");
            }
            var headerCurrencyCode = await _mstCurrencyRepository.FirstOrDefaultAsync(CurencyId);

            // đã có : heaer curency (vnd) có total price(vnd)
            // phải : tim cay va currency cua no  
            // header truyen xuong 500000 vnd  tao duyet theo amount 

            var currencyUsd = await _mstCurrencyRepository.FirstOrDefaultAsync(e => e.CurrencyCode.ToUpper() == "USD");

            //CurencyId = currencyUsd.Id;

            var approveTreeId = await (from approvalTree in _mstApprovalTreeRepository.GetAll().AsNoTracking()
                                       join processType in _mstProcessTypeRepository.GetAll().AsNoTracking()
                                       on approvalTree.ProcessTypeId equals processType.Id
                                       where (approvalTree.InventoryGroupId == InventoryGroupId
                                       && (approvalTree.CurrencyId == currencyUsd.Id)
                                       //&& (rate.FromCurrency == headerCurrencyCode.CurrencyCode || CurencyId == 0) 
                                       && processType.ProcessTypeCode == createRequestApprovalInputDto.ProcessTypeCode)
                                        select approvalTree.Id).FirstOrDefaultAsync();

            //var approveTreeId = approveTreeIdList.Where(e => (((CurencyId == 0 || CurencyId == e.CurrencyId) &&  (e.CurrencyId == CurencyId && TotalPrice >= e.AmountFrom && TotalPrice <= e.AmountTo) )
            //|| (e.CurrencyId != CurencyId && TotalPrice* (decimal)e.ConversionRate >= e.AmountFrom && TotalPrice* (decimal)e.ConversionRate <= e.AmountTo))).OrderByDescending(e => e.ConversionRate).Select(e => e.Id).FirstOrDefault();

            if (approveTreeId == 0)
            {
                throw new UserFriendlyException(400, "Approval tree not found!");

            }
            else
            {
                
                List<MstApprovalTreeDetail> listApprovalTreeDetail = _mstApprovalTreeDetailRepository.GetAll().Where(e => e.ApprovalTreeId == approveTreeId).OrderBy(p => p.ApprovalSeq).ToList();
                if (listApprovalTreeDetail.Count == 0)
                {
                    throw new UserFriendlyException(400, "Approval tree do not have child!");
                }
                else
                {
                    if (listApprovalTreeDetail[0] != null)
                    {
                        //var user = await _userRepository.FirstOrDefaultAsync(AbpSession.UserId.Value);
                        //var departmentName = await (from org in _mstHrOrgStructureRepository.GetAll()
                        //                            where org.Id == listApprovalTreeDetail[0].HrOrgStructureId || (user != null && org.Id == user.HrOrgStructureId )
                        //                            select org.Name).FirstOrDefaultAsync();

                        //if (departmentName != null)
                        //{
                        //    if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.UR)
                        //    {
                        //        await _mstUserRequestRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new UserRequest { DepartmentApprovalName = departmentName });
                        //    }
                        //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PR)
                        //    {
                        //        await _mstPrRequisitionHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PrRequisitionHeaders { DepartmentApprovalName = departmentName });
                        //    }
                        //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PO)
                        //    {
                        //        await _mstPoHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PoHeaders { DepartmentApprovalName = departmentName });
                        //    }
                        //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PC)
                        //    {
                        //        await _prcContractHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PrcContractHeaders { DepartmentApprovalName = departmentName });
                        //    }
                        //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.GR)
                        //    {
                        //        await _rcvShipmentHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new RcvShipmentHeaders { DepartmentApprovalName = departmentName });
                        //    }
                        //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PM)
                        //    {
                        //        await _paymentHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PaymentHeaders { DepartmentApprovalName = departmentName });
                        //    }
                        //}
                    }

                    //Luu vao approval step
                   
                    DateTime? StepDeadline = DateTime.Now;
                    foreach (var approvalTreeDetail in listApprovalTreeDetail)
                    {
                       
                        

                        List<ApprovalUserDto> approvalUserDtos =
                            (
                                from approvalTreeDetailUse in _mstApprovalTreeDetailUserRepository.GetAll().Where(p => p.ApprovalTreeDetailId == approvalTreeDetail.Id).AsNoTracking()
                                join user in _userRepository.GetAll().AsNoTracking() on approvalTreeDetailUse.ApprovalUserId equals user.Id
                                select new ApprovalUserDto
                                {
                                    Id = user.Id,
                                    HrOrgStructureId = user.HrOrgStructureId,
                                    ApprovalEmail = user.EmailAddress
                                }
                            ).ToList();

                        if (approvalUserDtos.Count == 0)
                        {

                            //Tìm dựa vào các tiêu chí khác phòng ban, chức danh
                            string HrOrgStructureId = "";
                            long? TitleId = approvalTreeDetail.TitleId;
                            long? PositionId = approvalTreeDetail.PositionId;

                            if (approvalTreeDetail.ApprovalTypeId == AppConsts.C_APPROVE_STEP_INTERNAL_DEPARTMENT)//Internal Department
                            {
                                //Lấy HrOrgStructure user đăng nhập
                                var user = _userRepository.GetAll().Where(p => p.Id == AbpSession.UserId).FirstOrDefault();
                                HrOrgStructureId = user.HrOrgStructureId.ToString();

                            }
                            else if (approvalTreeDetail.ApprovalTypeId == AppConsts.C_APPROVE_STEP_OTHER_DEPARTMENT)
                            {
                                //Lấy cụ thể phòng ban
                                HrOrgStructureId = approvalTreeDetail.HrOrgStructureId.ToString();
                            }
                            else if (approvalTreeDetail.ApprovalTypeId == AppConsts.C_APPROVE_STEP_CHECK_BUDGET)
                            {
                                //Phòng kế toán phê duyệt giá
                                HrOrgStructureId = approvalTreeDetail.HrOrgStructureId.ToString();
                            }
                            //Dùng câu query theo tree lấy tất cả user cùng chức danh sp_GetAllDepartmentHierarchical
                            IEnumerable<ApprovalUserDto> approvalUserDtoHierarchical = await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                                ("exec sp_GetAllDepartmentHierarchical @HrOrgStructureId, @PositionId ",
                                new
                                {
                                    HrOrgStructureId,
                                    PositionId
                                });
                            approvalUserDtos = approvalUserDtoHierarchical.ToList();
                        }
                        if (approvalUserDtos.Count == 0)
                        {
                            //Tìm chuc danh duyet tiep theo vi chuc dang trong
                            List<MstApprovalTreeDetail> listApprovalTreeDetailRemaining = 
                                _mstApprovalTreeDetailRepository.GetAll().Where(e => e.ApprovalTreeId == approveTreeId
                                    && e.ApprovalSeq > approvalTreeDetail.ApprovalSeq.Value //Muc tiep theo
                                    && e.ApprovalTypeId == approvalTreeDetail.ApprovalTypeId //Cung muc phe duyet
                                ).OrderBy(p => p.ApprovalSeq).ToList();
                            if(listApprovalTreeDetailRemaining.Count==0)//Muc phe duyet cuoi cung ma ko co ai thi bo qua, nguoc lai bao loi
                                throw new UserFriendlyException(400, "Approval User not found!");
                        }
                        else
                        {
                            RequestApprovalStep requestApprovalStep = new RequestApprovalStep();
                            requestApprovalStep = new RequestApprovalStep();
                            requestApprovalStep.ProcessTypeCode = createRequestApprovalInputDto.ProcessTypeCode;
                            requestApprovalStep.ReqId = createRequestApprovalInputDto.ReqId;
                            requestApprovalStep.ApprovalTreeDetailId = approvalTreeDetail.Id;
                            requestApprovalStep.ApprovalStatus = approvalTreeDetail.ApprovalSeq.Value == 1 ? AppConsts.STATUS_PENDING : AppConsts.STATUS_PENDING;
                            requestApprovalStep.CreationTime = DateTime.Now;
                            requestApprovalStep.CreatorUserId = AbpSession.UserId;
                            requestApprovalStep.ApprovalSeq = approvalTreeDetail.ApprovalSeq.Value;
                            requestApprovalStep.DayOfProcess = approvalTreeDetail.DayOfProcess;//Số ngày xử lý
                            await dbContext.AddAsync(requestApprovalStep);
                            await CurrentUnitOfWork.SaveChangesAsync();

                            //Lay danh sách user phê duyệtv
                            //Luu vao tung Step user
                            RequestApprovalStepUser requestApprovalStepUser = new RequestApprovalStepUser();
                            DateTime? maxDeadlineInStep = StepDeadline;
                            foreach (ApprovalUserDto approvalUserDto in approvalUserDtos)
                            {
                                requestApprovalStepUser = new RequestApprovalStepUser();
                                requestApprovalStepUser.RequestApprovalStepId = requestApprovalStep.Id;
                                requestApprovalStepUser.ApprovalUserId = approvalUserDto.Id;
                                requestApprovalStepUser.ApprovalEmail = approvalUserDto.ApprovalEmail;
                                requestApprovalStepUser.CreatorUserId = AbpSession.UserId;
                                requestApprovalStepUser.CreationTime = DateTime.Now;
                                requestApprovalStepUser.ApprovalEmail = approvalUserDto.ApprovalEmail;
                                requestApprovalStepUser.ApprovalHrOrgStructureId = approvalUserDto.HrOrgStructureId;

                                
                                if (requestApprovalStep.DayOfProcess == null || requestApprovalStep.DayOfProcess == 0)
                                {
                                    //requestApprovalStep.DeadlineDate = null;
                                    requestApprovalStepUser.DeadlineDate = null;
                                    maxDeadlineInStep = null;
                                }
                                else
                                {
                                    IEnumerable<RequestApprovalStep> execForDeadlineDate = await _requestApprovalDapperRepository.QueryAsync<RequestApprovalStep>
                                               ("exec MstHrDayOff$GetDatePassDayOff @p_UserId,@p_CurrentDate,@p_LeadTime ",
                                               new
                                               {
                                                   p_UserId = requestApprovalStepUser.ApprovalUserId,
                                                   p_CurrentDate = StepDeadline,
                                                   p_LeadTime = requestApprovalStep.DayOfProcess
                                               });
                                    requestApprovalStepUser.OriginalDeadlineDate = execForDeadlineDate != null ? execForDeadlineDate.FirstOrDefault().DeadlineDate : null;
                                    maxDeadlineInStep = (requestApprovalStepUser.OriginalDeadlineDate.HasValue && requestApprovalStepUser.OriginalDeadlineDate > maxDeadlineInStep) ? requestApprovalStepUser.OriginalDeadlineDate.Value : maxDeadlineInStep;
                                    //requestApprovalStep.DeadlineDate = execForDeadlineDate != null ? execForDeadlineDate.FirstOrDefault().DeadlineDate : null;
                                }

                                await dbContext.AddAsync(requestApprovalStepUser);
                               
                            }
                            StepDeadline = maxDeadlineInStep;

                        }
                    }
                }


                //RequestNextApprovalTreeInputDto requestNextApprovalTreeInputDto = new RequestNextApprovalTreeInputDto();
                //requestNextApprovalTreeInputDto.ReqId = createRequestApprovalInputDto.ReqId;
                //requestNextApprovalTreeInputDto.ProcessTypeCode = createRequestApprovalInputDto.ProcessTypeCode;
                //await RequestNextApprovalTree(requestNextApprovalTreeInputDto);

                createRequestApprovalOutputDto.Result = true;
                createRequestApprovalOutputDto.Message = AppConsts.CreateApprovalStep1Success;
                return createRequestApprovalOutputDto;
            }
        }
        #endregion

        // lấy ID bước duyệt tiếp theo
        public async Task<long> GetNextApprovalId(long id,string typeCode)
        {
            RequestApprovalStep requestApprovalStep = _requestApprovalStepRepository.GetAll().Where(
                p => p.ReqId == id
                && p.ProcessTypeCode == typeCode
                && p.ApprovalStatus == AppConsts.STATUS_PENDING
                ).OrderBy(p => p.ApprovalSeq)
                .FirstOrDefault();
            if (requestApprovalStep == null) return 0;
            var stepUser = await _requestApprovalStepUserRepository.FirstOrDefaultAsync(e => e.RequestApprovalStepId == requestApprovalStep.Id);
            if (stepUser == null) return 0;
            return stepUser.ApprovalUserId;
        }

        //Next (xét step đầu tiên pending thành trạng thái WAITTING)
        public async Task RequestNextApprovalTree(RequestNextApprovalTreeInputDto requestNextApprovalTreeInputDto)
        {
            //Neu khai bao Dto nhu tren se loi doan nay 
            RequestApprovalStep requestApprovalStep = await _requestApprovalStepRepository.GetAll().Where(
                p => p.ReqId == requestNextApprovalTreeInputDto.ReqId
                && p.ProcessTypeCode == requestNextApprovalTreeInputDto.ProcessTypeCode
                && p.ApprovalStatus == AppConsts.STATUS_PENDING
                ).OrderBy(p => p.ApprovalSeq)
                .FirstOrDefaultAsync();
            DateTime? StepDeadline = null;
            if (requestApprovalStep == null)
            {
                throw new UserFriendlyException(400, "Do not find next approval person!");
                //Hết người nhận
            }
            else
            {
                string departmentName = "";
                var requestApprovalStepUsers = await _requestApprovalStepUserRepository.GetAll().Where(p => p.RequestApprovalStepId == requestApprovalStep.Id
                                                                                                    ).ToListAsync();
                if (requestApprovalStepUsers != null)
                {
                    foreach (var requestApprovalStepUser in requestApprovalStepUsers)
                    {
                        if (requestApprovalStepUser.ApprovalHrOrgStructureId != null) departmentName = await _mstHrOrgStructureRepository.GetAll().Where(e => e.Id == requestApprovalStepUser.ApprovalHrOrgStructureId && e.Published == 1).Select(o => o.Name).FirstOrDefaultAsync();
                        requestApprovalStep.DeadlineDate = requestApprovalStepUser.DeadlineDate;

                        if (requestApprovalStep.DayOfProcess == null || requestApprovalStep.DayOfProcess == 0)
                        {
                            //requestApprovalStep.DeadlineDate = null;
                            requestApprovalStepUser.DeadlineDate = null;
                        }
                        else
                        {
                            IEnumerable<RequestApprovalStep> execForDeadlineDate = await _requestApprovalDapperRepository.QueryAsync<RequestApprovalStep>
                                       ("exec MstHrDayOff$GetDatePassDayOff @p_UserId,@p_CurrentDate,@p_LeadTime ",
                                       new
                                       {
                                           p_UserId = requestApprovalStepUser.ApprovalUserId,
                                           p_CurrentDate = DateTime.Now,
                                           p_LeadTime = requestApprovalStep.DayOfProcess
                                       });
                            //requestApprovalStep.DeadlineDate = requestApprovalStep.RequestDate.Value.AddDays(requestApprovalStep.DayOfProcess.Value);
                            requestApprovalStepUser.DeadlineDate = execForDeadlineDate != null ? execForDeadlineDate.FirstOrDefault().DeadlineDate : null;
                            //requestApprovalStep.DeadlineDate = execForDeadlineDate != null ? execForDeadlineDate.FirstOrDefault().DeadlineDate : null;
                            if (StepDeadline == null) StepDeadline = requestApprovalStepUser.DeadlineDate;
                            else
                                StepDeadline = (requestApprovalStepUser.DeadlineDate > StepDeadline) ? requestApprovalStepUser.DeadlineDate : StepDeadline;
                        }
                         
                    }
                    requestApprovalStep.ApprovalStatus = AppConsts.STATUS_WAITTING;
                    requestApprovalStep.RequestDate = DateTime.Now;
                    requestApprovalStep.DepartmentName = departmentName;


                    if (requestNextApprovalTreeInputDto.ProcessTypeCode == AppConsts.UR)
                    {

                        var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == requestNextApprovalTreeInputDto.ReqId);
                        if (userRequest.BudgetCodeId == null) throw new UserFriendlyException(400, "Please update budget code before sent request!");

                        await _mstUserRequestRepository.GetAll().Where(e => e.Id == requestNextApprovalTreeInputDto.ReqId).UpdateFromQueryAsync(e => new UserRequest { DepartmentApprovalName = departmentName });
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == AppConsts.PR)
                    {
                        await _mstPrRequisitionHeadersRepository.GetAll().Where(e => e.Id == requestNextApprovalTreeInputDto.ReqId).UpdateFromQueryAsync(e => new PrRequisitionHeaders { DepartmentApprovalName = departmentName });
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == AppConsts.PO)
                    {
                        PoHeaders poHeaders = _mstPoHeadersRepository.FirstOrDefault(p => p.Id == requestNextApprovalTreeInputDto.ReqId);
                        if (poHeaders != null && (poHeaders.VendorId == 0 || poHeaders.VendorId == null))
                        {
                            throw new UserFriendlyException(400, L("HaveItemsVendorIsEmpty"));
                        }
                        await _mstPoHeadersRepository.GetAll().Where(e => e.Id == requestNextApprovalTreeInputDto.ReqId).UpdateFromQueryAsync(e => new PoHeaders { DepartmentApprovalName = departmentName });
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == AppConsts.PC)
                    {
                        await _prcContractHeadersRepository.GetAll().Where(e => e.Id == requestNextApprovalTreeInputDto.ReqId).UpdateFromQueryAsync(e => new PrcContractHeaders { DepartmentApprovalName = departmentName });
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == AppConsts.GR)
                    {
                        await _rcvShipmentHeadersRepository.GetAll().Where(e => e.Id == requestNextApprovalTreeInputDto.ReqId).UpdateFromQueryAsync(e => new RcvShipmentHeaders { DepartmentApprovalName = departmentName });
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == AppConsts.PM)
                    {
                        await _paymentHeadersRepository.GetAll().Where(e => e.Id == requestNextApprovalTreeInputDto.ReqId).UpdateFromQueryAsync(e => new PaymentHeaders { DepartmentApprovalName = departmentName });
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == AppConsts.SR)
                    {
                        await _supRepo.GetAll().Where(e => e.Id == requestNextApprovalTreeInputDto.ReqId).UpdateFromQueryAsync(e => new MstSupplierRequest { DepartmentApprovalName = departmentName });
                    }

                    await _requestApprovalStepRepository.UpdateAsync(requestApprovalStep);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    //Gửi email cho danh sách người nhận

                    List<RequestApprovalStepUser> stepUsers = _requestApprovalStepUserRepository.GetAll().Where(
                        p => p.RequestApprovalStepId == requestApprovalStep.Id).ToList();

                    var userList = await _userRepository.GetAll().AsNoTracking().ToListAsync();
                    var departmentList = await _mstHrOrgStructureRepository.GetAll().AsNoTracking().ToListAsync();
                    SendEmailContent sendEmail = new SendEmailContent();
                    sendEmail.EmailTemplateCode = AppConsts.SEND_APPROVAL_REQUEST;
                    if (requestNextApprovalTreeInputDto.ProcessTypeCode == "UR")
                    {
                        var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == requestNextApprovalTreeInputDto.ReqId);
                        if (userRequest == null)
                        {
                            throw new UserFriendlyException(400, "Can not find user request!");
                        }
                        else
                        {
                            sendEmail.Subject = $"Action requested for User request {userRequest.UserRequestNumber}";
                            sendEmail.From = userList.Find(e => e.Id == userRequest.CreatorUserId).FullName + "-"
                                + departmentList.Find(e => e.Id == userList.Find(e => e.Id == userRequest.CreatorUserId).HrOrgStructureId).Name
                                + $"({userList.Find(e => e.Id == userRequest.CreatorUserId).EmailAddress})";
                            sendEmail.Document = $"User request {userRequest.UserRequestNumber}";
                            sendEmail.Description = userRequest.Note;
                            sendEmail.Status = userRequest.ApprovalStatus;
                        }
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == "PR")
                    {
                        var purchaseRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == requestNextApprovalTreeInputDto.ReqId);
                        if (purchaseRequest == null)
                        {
                            throw new UserFriendlyException(400, "Can not find purchase request!");
                        }
                        else
                        {
                            sendEmail.Subject = $"Action requested for Purchase request {purchaseRequest.RequisitionNo}";
                            sendEmail.From = userList.Find(e => e.Id == purchaseRequest.CreatorUserId).FullName + "-"
                                + departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseRequest.CreatorUserId).HrOrgStructureId).Name
                                + $"({userList.Find(e => e.Id == purchaseRequest.CreatorUserId).EmailAddress})";
                            sendEmail.Document = $"Purchase request {purchaseRequest.RequisitionNo}";
                            sendEmail.Description = purchaseRequest.Description;
                            sendEmail.Status = purchaseRequest.AuthorizationStatus;
                        }
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == "AN")
                    {
                        //var anex = await _.FirstOrDefaultAsync(e => e.Id == requestNextApprovalTreeInputDto.ReqId);
                        string _sql = "EXEC sp_PrcAppendixContractGetById @p_id";
                        var contract = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
                        {
                            p_id = requestNextApprovalTreeInputDto.ReqId
                        })).ToList();
                        if (contract == null || contract.Count() == 0)
                        {
                            throw new UserFriendlyException(400, "Can not find Contract/Anex!");
                        }
                        else
                        {
                            sendEmail.Subject = $"Action requested for Contract/Anex {contract[0].AppendixNo}";
                            sendEmail.From = userList.Find(e => e.Id == contract[0].CreatorUserId).FullName + "-"
                                + departmentList.Find(e => e.Id == userList.Find(e => e.Id == contract[0].CreatorUserId).HrOrgStructureId).Name
                                + $"({userList.Find(e => e.Id == contract[0].CreatorUserId).EmailAddress})";
                            sendEmail.Document = $"Contract/Anex {contract[0].AppendixNo}";
                            sendEmail.Description = contract[0].Description;
                            sendEmail.Status = contract[0].ApprovalStatus;
                        }
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == "PM")
                    {
                        var payment = await _paymentHeadersRepository.FirstOrDefaultAsync(requestNextApprovalTreeInputDto.ReqId);
                        if (payment == null)
                        {
                            throw new UserFriendlyException(400, "Can not find Payment request!");
                        }
                        else
                        {
                            sendEmail.Subject = $"Action requested for Payment request {payment.PaymentNo}";
                            sendEmail.From = userList.Find(e => e.Id == payment.CreatorUserId).FullName + "-"
                                + departmentList.Find(e => e.Id == userList.Find(e => e.Id == payment.CreatorUserId).HrOrgStructureId).Name
                                + $"({userList.Find(e => e.Id == payment.EmployeeId).EmailAddress})";
                            sendEmail.Document = $"Payment request {payment.PaymentNo}";
                            sendEmail.Description = payment.Description;
                            sendEmail.Status = payment.AuthorizationStatus;
                        }
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == "PO")
                    {
                        var po = await _mstPoHeadersRepository.FirstOrDefaultAsync(e => e.Id == requestNextApprovalTreeInputDto.ReqId);
                        if (po == null)
                        {
                            throw new UserFriendlyException(400, "Can not find Purchase order!");
                        }
                        else
                        {
                            sendEmail.Subject = $"Action requested for Purchase order {po.Segment1}";
                            sendEmail.From = userList.Find(e => e.Id == po.CreatorUserId).FullName + "-"
                                + departmentList.Find(e => e.Id == userList.Find(e => e.Id == po.CreatorUserId).HrOrgStructureId).Name
                                + $"({userList.Find(e => e.Id == po.CreatorUserId).EmailAddress})";
                            sendEmail.Document = $"Purchase order {po.Segment1}";
                            sendEmail.Description = po.Description;
                            sendEmail.Status = po.AuthorizationStatus;
                        }
                    }
                    else if (requestNextApprovalTreeInputDto.ProcessTypeCode == "SR")
                    {
                        var sup = await _supRepo.FirstOrDefaultAsync(requestNextApprovalTreeInputDto.ReqId);
                        if (sup == null)
                        {
                            throw new UserFriendlyException(400, "Can not find Payment request!");
                        }
                        else
                        {
                            sendEmail.Subject = $"Action requested for Payment request {sup.RequestNo}";
                            sendEmail.From = userList.Find(e => e.Id == sup.CreatorUserId).FullName + "-"
                                + departmentList.Find(e => e.Id == userList.Find(e => e.Id == sup.CreatorUserId).HrOrgStructureId).Name
                                + $"({userList.Find(e => e.Id == sup.CreatorUserId).EmailAddress})";
                            sendEmail.Document = $"Supplier request {sup.RequestNo}";
                            sendEmail.Description = "";
                            sendEmail.Status = sup.ApprovalStatus;
                        }
                    }
                    else /*(requestNextApprovalTreeInputDto.ProcessTypeCode == "PO")*/
                    {
                        var purchaseOrder = await _mstPoHeadersRepository.FirstOrDefaultAsync(e => e.Id == requestNextApprovalTreeInputDto.ReqId);
                        if (purchaseOrder == null)
                        {
                            throw new UserFriendlyException(400, "Can not find purchase request!");
                        }
                        else
                        {
                            sendEmail.Subject = $"Action requested for Purchase request {purchaseOrder.Segment1}";
                            sendEmail.From = userList.Find(e => e.Id == purchaseOrder.CreatorUserId).FullName + "-"
                                + departmentList.Find(e => e.Id == userList.Find(e => e.Id == purchaseOrder.CreatorUserId).HrOrgStructureId).Name
                                + $"({userList.Find(e => e.Id == purchaseOrder.CreatorUserId).EmailAddress})";
                            sendEmail.Document = $"Purchase request {purchaseOrder.Segment1}";
                            sendEmail.Description = purchaseOrder.Description;
                            sendEmail.Status = purchaseOrder.AuthorizationStatus;
                        }
                    }

                    foreach (RequestApprovalStepUser stepUser in stepUsers)
                    {
                        sendEmail.Person = userList.Find(e => e.Id == stepUser.ApprovalUserId).FullName;
                        sendEmail.Receiver = stepUser.ApprovalEmail;
                        //Gọi hàm gửi email
                        await _sendEmail.SendEmail(sendEmail);
                    }

                    DelayPaymentEmailContent delayPaymentEmailContent = new DelayPaymentEmailContent();

                    var users = from user in _userRepository.GetAll().AsNoTracking()
                                join stepUser in _requestApprovalStepUserRepository.GetAll().AsNoTracking()
                                on user.Id equals stepUser.ApprovalUserId
                                where stepUser.RequestApprovalStepId == requestApprovalStep.Id
                                select user.EmailAddress;
                    string[] listEmail = users.ToArray();

                    delayPaymentEmailContent.ReceiveEmail = listEmail;
                    delayPaymentEmailContent.Subject = AppConsts.SUBJECT_APPROVAL_TREE;
                    delayPaymentEmailContent.ContentEmail = AppConsts.BODY_APPROVAL_TREE;

                    //await _sendEmail.SendMailForDelayPayment(delayPaymentEmailContent);
                    //Tính lại tất cả các step tiếp theo

                    List<RequestApprovalStep> requestApprovalStepRemains =await _requestApprovalStepRepository.GetAll().Where(
                           p => p.ReqId == requestNextApprovalTreeInputDto.ReqId
                           && p.ProcessTypeCode == requestNextApprovalTreeInputDto.ProcessTypeCode
                           && p.ApprovalStatus == AppConsts.STATUS_PENDING 
                           ).OrderBy(p => p.ApprovalSeq)
                       .ToListAsync();
                    
                    foreach (var requestApprovalStepRemain in requestApprovalStepRemains)
                    {

                        if(requestApprovalStepRemain.ApprovalStatus == AppConsts.STATUS_PENDING)
                        {
                            var requestApprovalStepUserRemains = _requestApprovalStepUserRepository.GetAll().Where(p => p.RequestApprovalStepId == requestApprovalStepRemain.Id
                                                                                                   ).ToList();

                            //Luu vao tung Step user
                            //RequestApprovalStepUser requestApprovalStepUser = new RequestApprovalStepUser();
                            DateTime? maxDeadlineInStep = StepDeadline;
                            foreach (var requestApprovalStepUserRemain in requestApprovalStepUserRemains)
                            {

                                if (requestApprovalStep.DayOfProcess == null || requestApprovalStep.DayOfProcess == 0)
                                {
                                    //requestApprovalStep.DeadlineDate = null;
                                    requestApprovalStepUserRemain.DeadlineDate = null;
                                    maxDeadlineInStep = null;
                                }
                                else
                                {
                                    IEnumerable<RequestApprovalStep> execForDeadlineDate = await _requestApprovalDapperRepository.QueryAsync<RequestApprovalStep>
                                               ("exec MstHrDayOff$GetDatePassDayOff @p_UserId,@p_CurrentDate,@p_LeadTime ",
                                               new
                                               {
                                                   p_UserId = requestApprovalStepUserRemain.ApprovalUserId,
                                                   p_CurrentDate = StepDeadline,
                                                   p_LeadTime = requestApprovalStep.DayOfProcess
                                               });
                                    //requestApprovalStepUser.OriginalDeadlineDate = execForDeadlineDate != null ? execForDeadlineDate.FirstOrDefault().DeadlineDate : null;
                                    requestApprovalStepUserRemain.DeadlineDate = execForDeadlineDate != null ? execForDeadlineDate.FirstOrDefault().DeadlineDate : null;
                                    maxDeadlineInStep = (requestApprovalStepUserRemain.DeadlineDate.HasValue && requestApprovalStepUserRemain.DeadlineDate > maxDeadlineInStep) ? requestApprovalStepUserRemain.DeadlineDate.Value : maxDeadlineInStep;
                                    //requestApprovalStep.DeadlineDate = execForDeadlineDate != null ? execForDeadlineDate.FirstOrDefault().DeadlineDate : null;
                                }

                                await CurrentUnitOfWork.SaveChangesAsync();

                            }
                            StepDeadline = maxDeadlineInStep;
                        }
                        
                        
                    }
                }
                else throw new UserFriendlyException(400, "Cannot find next approval user !");

                
            }

        }

        //Get history
        public async Task<List<RequestApprovalHistoryOutputDto>> GetApprovalRequestHistory(RequestApprovalHistoryInputDto requestApprovalHistoryInputDto)
        {
            IEnumerable<RequestApprovalHistoryOutputDto> requestApprovalHistoryOutputDtos = await _requestApprovalDapperRepository.QueryAsync<RequestApprovalHistoryOutputDto>
                               ("exec sp_GetAllRequestApprovalHistory @ReqId, @ProcessTypeCode ",
                               new
                               {
                                   requestApprovalHistoryInputDto.ReqId,
                                   requestApprovalHistoryInputDto.ProcessTypeCode
                               });
            return requestApprovalHistoryOutputDtos.ToList();
        }

        // xóa dữ liệu step và lưu vào bảng log
        private async Task BackupData(string processTypeCode , long reqId)
        {
            await _requestApprovalDapperRepository.ExecuteAsync
                ("EXEC sp_RequestApprovalBackupHistory @ProcessTypeCode, @ReqId",
                new
                {
                    @ProcessTypeCode = processTypeCode,
                    @ReqId = reqId,
                });
        }

        [AbpAuthorize(AppPermissions.ApprovalManagement_Forward)]
        public async Task<bool> Forward(ForwardInputDto forwardInputDto)
        {
            try
            {
                var currentApprovalStep = await _requestApprovalStepRepository.GetAll().Where(p => p.Id == forwardInputDto.RequestApprovalStepId).FirstOrDefaultAsync();
                if (currentApprovalStep == null)
                {
                    throw new Exception("Cannot find record!");
                }
                if (currentApprovalStep.ApprovalStatus != AppConsts.STATUS_WAITTING)
                {
                    throw new Exception("Data is processed!");
                }
                var lsApprovalStepNext = await _requestApprovalStepRepository.GetAll().Where(p =>
                p.ReqId == currentApprovalStep.ReqId
                && p.ProcessTypeCode == currentApprovalStep.ProcessTypeCode
                && p.ApprovalSeq > currentApprovalStep.ApprovalSeq
                && p.ApprovalStatus == AppConsts.STATUS_PENDING
                
                ).ToListAsync();

                //set tất cả các bản ghi phía sau + 1
                foreach (RequestApprovalStep step in lsApprovalStepNext)
                {

                    step.ApprovalSeq = step.ApprovalSeq + 1;
                    await _requestApprovalStepRepository.UpdateAsync(step);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                //set ban ghi hiện tại là foward
                currentApprovalStep.ApprovalStatus = AppConsts.STATUS_APPROVED;
                await _requestApprovalStepRepository.UpdateAsync(currentApprovalStep);
                await CurrentUnitOfWork.SaveChangesAsync();

                //Insert bản ghi vào thứ tự phê duyệt
                RequestApprovalStep requestApprovalStep = new RequestApprovalStep();
                requestApprovalStep.ReqId = currentApprovalStep.ReqId;
                requestApprovalStep.ProcessTypeCode = currentApprovalStep.ProcessTypeCode;
                requestApprovalStep.ProcessTypeId = currentApprovalStep.ProcessTypeId;
                requestApprovalStep.ApprovalTreeDetailId = currentApprovalStep.ApprovalTreeDetailId;
                requestApprovalStep.ApprovalSeq = currentApprovalStep.ApprovalSeq + forwardInputDto.NumberPersonToFw;
                requestApprovalStep.ApprovalStatus = AppConsts.STATUS_PENDING;
                requestApprovalStep.ApprovalUserId = forwardInputDto.ForwardUserId;
                requestApprovalStep.RequestDate = DateTime.Now;
                requestApprovalStep.Note = forwardInputDto.Note;
                requestApprovalStep.DayOfProcess = currentApprovalStep.DayOfProcess;

                if (currentApprovalStep.DayOfProcess == null || currentApprovalStep.DayOfProcess == 0)
                {
                    requestApprovalStep.DeadlineDate = null;
                }
                else
                {
                    requestApprovalStep.DeadlineDate = requestApprovalStep.RequestDate.Value.AddDays(currentApprovalStep.DayOfProcess.Value);
                }
                var forwardUser = await _userRepository.GetAll().Where(p => p.Id == forwardInputDto.ForwardUserId).FirstOrDefaultAsync();
                requestApprovalStep.ApprovalEmail = forwardUser.EmailAddress;
                requestApprovalStep.ApprovalHrOrgStructureId = forwardUser.HrOrgStructureId;
                var newStepId = await _requestApprovalStepRepository.InsertAndGetIdAsync(requestApprovalStep);

                //IEnumerable<ApprovalUserDto> approvalUserDtoHierarchical = await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                //                ("exec sp_GetAllDepartmentHierarchical @HrOrgStructureId, @PositionId ",
                //                new
                //                {
                //                    HrOrgStructureId,
                //                    PositionId
                //                });
                //approvalUserDtos = approvalUserDtoHierarchical.ToList();

                RequestApprovalStepUser requestApprovalStepUser = new RequestApprovalStepUser();
                requestApprovalStepUser.RequestApprovalStepId = requestApprovalStep.Id;
                requestApprovalStepUser.ApprovalUserId = forwardUser.Id;
                requestApprovalStepUser.ApprovalEmail = forwardUser.EmailAddress;
                requestApprovalStepUser.CreatorUserId = AbpSession.UserId;
                requestApprovalStepUser.CreationTime = DateTime.Now;
                requestApprovalStepUser.ApprovalEmail = forwardUser.EmailAddress;
                requestApprovalStepUser.ApprovalHrOrgStructureId = forwardUser.HrOrgStructureId;

                if (forwardUser.IsBuyer == true)
                {
                    if (currentApprovalStep.ProcessTypeCode == "PR" )
                    {
                        var purchaseRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == requestApprovalStep.ReqId);
                        if (purchaseRequest != null) purchaseRequest.AuthorizationStatus = AppConsts.STATUS_APPROVED;
                        else throw new UserFriendlyException("PR not Found");
                    }
                    else if (currentApprovalStep.ProcessTypeCode == "UR")
                    {
                        var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == requestApprovalStep.ReqId);
                        if (userRequest != null) userRequest.ApprovalStatus = AppConsts.STATUS_APPROVED;
                        else throw new UserFriendlyException("UR not Found");
                    }
                }


                await _requestApprovalStepUserRepository.InsertAsync(requestApprovalStepUser);

                await CurrentUnitOfWork.SaveChangesAsync();
                //Gọi đến phê duyệt tiếp theo
                RequestNextApprovalTreeInputDto requestNextApprovalTreeInputDto = new RequestNextApprovalTreeInputDto();
                requestNextApprovalTreeInputDto.ProcessTypeCode = currentApprovalStep.ProcessTypeCode;
                requestNextApprovalTreeInputDto.ReqId = currentApprovalStep.ReqId;
                await RequestNextApprovalTree(requestNextApprovalTreeInputDto);
                return true;
            }   catch(Exception ex)
            {
                throw ex;
            } 
            
        }

        [AbpAuthorize(AppPermissions.ApprovalManagement_Forward, AppPermissions.ApprovalManagement_ApproveRequest)]
        public async Task ForwardAndApprove(FowardApproveInputDto fowardApproveInputDto)
        {

           
            //Lấy seq bước duyệt hiện tại và 
            long curApprovalSeq;
            long curApprvalUserId;
            long? curApprovalTreeDetailId;
            long? curApprovalTypeId; //Loại bước approve
            long curReqId;
            string curProcessTypeCode;
            var curApproval =
                                       from approvalStep in _requestApprovalStepRepository.GetAll()
                                       join treeDetail in _mstApprovalTreeDetailRepository.GetAll().AsNoTracking()
                                            on approvalStep.ApprovalTreeDetailId equals treeDetail.Id into k 
                                            from treeDetail in k.DefaultIfEmpty()
                                       where approvalStep.Id == fowardApproveInputDto.RequestApprovalStepId
                                       select new
                                       {
                                           ApprovalSeq = approvalStep.ApprovalSeq,
                                           ApprovalTreeDetailId = approvalStep.ApprovalTreeDetailId,
                                           ApprovalTypeId = (long?)treeDetail.ApprovalTypeId,
                                           ReqId = approvalStep.ReqId,
                                           ProcessTypeCode = approvalStep.ProcessTypeCode
                                       };
            curApprovalSeq =  curApproval.FirstOrDefault().ApprovalSeq;
            curApprovalTreeDetailId = curApproval.FirstOrDefault().ApprovalTreeDetailId;
            curApprovalTypeId = curApproval.FirstOrDefault().ApprovalTypeId ;
            curReqId = curApproval.FirstOrDefault().ReqId;
            curProcessTypeCode = curApproval.FirstOrDefault().ProcessTypeCode;

            var nextUser = await _userRepository.FirstOrDefaultAsync(e => e.Id == fowardApproveInputDto.NextApproveUserId);
            var remainStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(e => e.ApprovalSeq > curApprovalSeq && e.ApprovalStatus == AppConsts.STATUS_PENDING && e.ReqId == curReqId && e.ProcessTypeCode == curProcessTypeCode);
            // bước cuối chọn người tiếp theo là ng nhận việc => bàn giao coonng việc 
            if (nextUser.IsBuyer == true && remainStep == null)
            {
                if (curProcessTypeCode == "PR" )
                {
                    var pr = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == curReqId);
                    if (pr != null)
                    {
                        pr.PicUserId = fowardApproveInputDto.NextApproveUserId;
                        await CurrentUnitOfWork.SaveChangesAsync();

                        ApproveOrRejectInputDto input = new ApproveOrRejectInputDto();
                        input.RequestApprovalStepId = fowardApproveInputDto.RequestApprovalStepId;
                        input.ReqId = curApproval.FirstOrDefault().ReqId;
                        input.ProcessTypeCode = curApproval.FirstOrDefault().ProcessTypeCode;
                        input.Note = fowardApproveInputDto.Note;
                        input.ApprovalUserId = (long)AbpSession.UserId;
                        input.IsApproved = true;
                        await ApproveOrReject(input);

                        return;
                    }
                }
                else if (curProcessTypeCode == "UR" )
                {
                    var ur = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == curReqId);
                    if (ur != null)
                    {
                        ur.PicUserId = fowardApproveInputDto.NextApproveUserId;
                        await CurrentUnitOfWork.SaveChangesAsync();

                        ApproveOrRejectInputDto input = new ApproveOrRejectInputDto();
                        input.RequestApprovalStepId = fowardApproveInputDto.RequestApprovalStepId;
                        input.ReqId = curApproval.FirstOrDefault().ReqId;
                        input.ProcessTypeCode = curApproval.FirstOrDefault().ProcessTypeCode;
                        input.Note = fowardApproveInputDto.Note;
                        input.ApprovalUserId = (long)AbpSession.UserId;
                        input.IsApproved = true;
                        await ApproveOrReject(input);

                        return;
                    }
                }
            }
            
            //Kiểm tra xem user được chọn ở bước tới có nằm trong danh sách phê duyệt kế tiếp hay không
            var newApproval =
                               await (from approvalStep in _requestApprovalStepRepository.GetAll()
                                join approvalStepUser in _requestApprovalStepUserRepository.GetAll().AsNoTracking()
                                    on approvalStep.Id equals approvalStepUser.RequestApprovalStepId
                                       
                                where 
                                //approvalStep.Id == fowardApproveInputDto.RequestApprovalStepId 
                                //    && 
                                    approvalStepUser.ApprovalUserId == fowardApproveInputDto.NextApproveUserId
                                    && approvalStep.ReqId == curReqId && approvalStep.ProcessTypeCode.Equals(curProcessTypeCode)
                                orderby approvalStep.ApprovalSeq ascending
                                select new
                                {

                                    ApprovalSeq = approvalStep.ApprovalSeq 
                                }).FirstOrDefaultAsync();
            
            if(newApproval == null)
            {
                //Lấy id user đầu tiên  của step type đấy đã duyệt. Nếu ko có thì chính là user hiện tại
                long lastestUserId = 0;
                 
                if (curApprovalTypeId != null)
                {
                    lastestUserId = (long)AbpSession.UserId;
                }
                else
                {
                    //Lấy thằng đầu tiên có ApprovalTypeId <> null
                    var approvedData = await (
                         from approvalStep in _requestApprovalStepRepository.GetAll()
                         join treeDetail in _mstApprovalTreeDetailRepository.GetAll().AsNoTracking()
                                           on approvalStep.ApprovalTreeDetailId equals treeDetail.Id
                         where approvalStep.Id == curReqId && approvalStep.ProcessTypeCode.Equals(curProcessTypeCode)
                                            && treeDetail.ApprovalTreeId == curApprovalTypeId
                                            && approvalStep.ApprovalSeq < curApprovalSeq
                                            && approvalStep.ApprovalStatus == AppConsts.STATUS_APPROVED
                         orderby approvalStep.ApprovalSeq descending
                         select new
                         {
                             LastestUserId = approvalStep.ApprovalUserId,
                             ApprovalTypeId = (long?)treeDetail.ApprovalTypeId,
                         }
                         ).FirstOrDefaultAsync();
                    if (approvedData != null)
                    {
                        curApprovalTypeId = approvedData.ApprovalTypeId;
                        lastestUserId = approvedData.LastestUserId;
                    }
                    else
                    {
                        lastestUserId = (long)AbpSession.UserId;
                    }
                    

                }

                //Kiểm tra xem thằng User đầu tìm được có cùng loại với thằng next approval id hay không
                //Lấy phòng ban của thàng LastestUserId
                Guid? lastestHrOrgStructureId = (await _userRepository.FirstOrDefaultAsync(lastestUserId)).HrOrgStructureId;
                //Goi thu tuc ngay [sp_GetNextDepartmentHierarchical] dua vao tham số phòng ban Lastest và User là Next

                IEnumerable<ApprovalUserDto> approvalUserDtoHierarchical = await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                               ("exec sp_GetNextDepartmentHierarchical @HrOrgStructureId, @UserId  ",
                               new
                               {
                                   HrOrgStructureId=lastestHrOrgStructureId,
                                   UserId =fowardApproveInputDto.NextApproveUserId
                               });
                long lastestStepId = fowardApproveInputDto.RequestApprovalStepId;
                long skipPerson = 1;
                if (approvalUserDtoHierarchical != null && approvalUserDtoHierarchical.Count() != 0)
                {
                     

                    //Tim vị trí để chèn
                    //Lấy danh sách tất cả thằng cùng loại và > Seq hiện tại
                    var sameApprovalTypes =
                                   await (from approvalStep in _requestApprovalStepRepository.GetAll()
                                          join approvalStepUser in _requestApprovalStepUserRepository.GetAll().AsNoTracking()
                                                 on approvalStep.Id equals approvalStepUser.RequestApprovalStepId
                                          join treeDetail in _mstApprovalTreeDetailRepository.GetAll().AsNoTracking()
                                               on approvalStep.ApprovalTreeDetailId equals treeDetail.Id
                                          where treeDetail.ApprovalTypeId == curApprovalTypeId

                                              && approvalStep.ReqId == curReqId && approvalStep.ProcessTypeCode.Equals(curProcessTypeCode)
                                              && approvalStep.ApprovalSeq > curApprovalSeq
                                          orderby approvalStep.ApprovalSeq ascending
                                          select new
                                          {
                                              Id = approvalStep.Id,
                                              ApprovalUserId = approvalStepUser.ApprovalUserId
                                          }).ToListAsync();


                    
                    foreach (var sameApprovalType in sameApprovalTypes)
                    {
                        //So với next xem có ai chức vụ cao hơn
                        Guid? SameHrOrgStructureId= (await _userRepository.FirstOrDefaultAsync(sameApprovalType.ApprovalUserId)).HrOrgStructureId; ; //Lấy theo ApprovalUserId.
                        IEnumerable<ApprovalUserDto> sameDtoHierarchical = await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                             ("exec sp_GetNextDepartmentHierarchical @HrOrgStructureId, @UserId  ",
                             new
                             {
                                 HrOrgStructureId = SameHrOrgStructureId,
                                 UserId = sameApprovalType.ApprovalUserId
                             });
                        if (sameDtoHierarchical != null)
                        {
                            var skipStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(sameApprovalType.Id);
                            skipStep.ApprovalStatus = AppConsts.STATUS_SKIP;
                            skipPerson += 1;
                            await CurrentUnitOfWork.SaveChangesAsync();
                        }
                        else
                        {
                            break;
                        }

                    }
                }
                ForwardInputDto forwardInputDto = new ForwardInputDto();
                forwardInputDto.NumberPersonToFw = skipPerson;
                forwardInputDto.RequestApprovalStepId = lastestStepId;
                forwardInputDto.ForwardUserId = fowardApproveInputDto.NextApproveUserId;
                forwardInputDto.Note = fowardApproveInputDto.Note;
                await Forward(forwardInputDto);


            }
            else
            {
                //Kiểm tra xem khoảng giữa curSeq và NextSeq có loại phê duyệt nào khác hay không
                long nextApprovalSeq = newApproval.ApprovalSeq;
                var checkApproval =
                                      (from approvalStep in _requestApprovalStepRepository.GetAll()
                                       join treeDetail in _mstApprovalTreeDetailRepository.GetAll().AsNoTracking()
                                            on approvalStep.ApprovalTreeDetailId equals treeDetail.Id
                                       where approvalStep.Id == curReqId && approvalStep.ProcessTypeCode.Equals(curProcessTypeCode)
                                             && treeDetail.ApprovalTreeId != curApprovalTypeId
                                             && approvalStep.ApprovalSeq > curApprovalSeq && approvalStep.ApprovalSeq <= nextApprovalSeq
                                       orderby approvalStep.ApprovalSeq ascending
                                       select new
                                       {
                                           ApprovalSeq = approvalStep.ApprovalSeq
                                       }
                                      ).FirstOrDefault();
                if(checkApproval != null)
                {
                    //User này có nhưng nằm khác loại. fw
                    ForwardInputDto forwardInputDto = new ForwardInputDto();
                    forwardInputDto.RequestApprovalStepId = fowardApproveInputDto.RequestApprovalStepId;
                    forwardInputDto.ForwardUserId = fowardApproveInputDto.NextApproveUserId;
                    forwardInputDto.Note = fowardApproveInputDto.Note;
                    await Forward(forwardInputDto);
                }
                else
                {

                    //update khoảng giữa là Skip hết
                    var skipApprovals = await
                                      (from approvalStep in _requestApprovalStepRepository.GetAll()
                                       join treeDetail in _mstApprovalTreeDetailRepository.GetAll().AsNoTracking()
                                            on approvalStep.ApprovalTreeDetailId equals treeDetail.Id
                                       where approvalStep.Id == curReqId && approvalStep.ProcessTypeCode.Equals(curProcessTypeCode)
                                             && treeDetail.ApprovalTreeId != curApprovalTypeId
                                             && approvalStep.ApprovalSeq > curApprovalSeq && approvalStep.ApprovalSeq < nextApprovalSeq
                                       orderby approvalStep.ApprovalSeq ascending
                                       select new
                                       {
                                           Id = approvalStep.Id,
                                           ApprovalSeq = approvalStep.ApprovalSeq
                                       }
                                      ).ToListAsync();
                    foreach(var skipApproval in skipApprovals)
                    {
                        var skipStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(e=>e.Id == skipApproval.Id);
                        skipStep.ApprovalStatus = AppConsts.STATUS_FORWARD;
                        await CurrentUnitOfWork.SaveChangesAsync();
                    }
                    ApproveOrRejectInputDto input = new ApproveOrRejectInputDto();
                    input.RequestApprovalStepId = fowardApproveInputDto.RequestApprovalStepId;
                    input.ReqId = curApproval.FirstOrDefault().ReqId;
                    input.ProcessTypeCode = curApproval.FirstOrDefault().ProcessTypeCode;
                    input.Note = fowardApproveInputDto.Note;
                    input.ApprovalUserId = (long)AbpSession.UserId;
                    input.IsApproved = true;
                    await ApproveOrReject(input);
                    //RequestNextApprovalTreeInputDto requestNextApprovalTreeInputDto = new RequestNextApprovalTreeInputDto();
                    //requestNextApprovalTreeInputDto.ReqId = curReqId;
                    //requestNextApprovalTreeInputDto.ProcessTypeCode = curProcessTypeCode;
                    //await RequestNextApprovalTree(requestNextApprovalTreeInputDto);
                }
            }
            //Approve thằng hiện tại

            //string departmentName = "";
            //if (curApproval.FirstOrDefault().H != null)
            //{
            //    departmentName = await _mstHrOrgStructureRepository.GetAll().Where(e => e.Id == requestApprovalStepUser.ApprovalHrOrgStructureId && e.Published == 1).Select(o => o.Name).FirstOrDefaultAsync();
            //}
            //var curStepApproval = await _requestApprovalStepRepository.FirstOrDefaultAsync(e => e.Id == fowardApproveInputDto.RequestApprovalStepId);
            //curStepApproval.ApprovalStatus = AppConsts.STATUS_APPROVED;
            //curStepApproval.ApprovalDate = DateTime.Now;
            //curStepApproval.ApprovalUserId = (long)AbpSession.UserId;
            //await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<User> GetUserById(long? userId)
        {
            return await _userRepository.FirstOrDefaultAsync(e => e.Id == userId);
        }

        public async Task SkipSelectedSteps(string note, List<long> stepIds)
        {
            List<RequestApprovalStep> stepSkipList = new List<RequestApprovalStep>();
            foreach (var stepId in stepIds)
            {
                var skipStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(e => e.Id == stepId);
                var skipStepUser = await _requestApprovalStepUserRepository.FirstOrDefaultAsync(e => e.RequestApprovalStepId == skipStep.Id);
                var skipStepUserInfo = await _userRepository.FirstOrDefaultAsync(e => e.Id == skipStepUser.ApprovalUserId);

                var stepRemain = await(from step in _requestApprovalStepRepository.GetAll().AsNoTracking()
                                 join stepUser in _requestApprovalStepUserRepository.GetAll().AsNoTracking() on step.Id equals stepUser.RequestApprovalStepId
                                 join user in _userRepository.GetAll().AsNoTracking() on stepUser.ApprovalUserId equals user.Id
                                 where step.ProcessTypeCode == skipStep.ProcessTypeCode
                                        && step.ReqId == skipStep.ReqId
                                       && step.Id != stepId
                                       && step.ApprovalStatus == AppConsts.STATUS_PENDING
                                       && user.HrOrgStructureId == skipStepUserInfo.HrOrgStructureId
                                       select step.Id).ToListAsync();

                                 //var remainPendingStep = await _requestApprovalStepRepository.GetAll().Where(
                                 //           p => p.ReqId == skipStep.ReqId
                                 //           && p.ProcessTypeCode == skipStep.ProcessTypeCode
                                 //           && p.Id != stepId
                                 //           && p.ApprovalTreeDetailId != null
                                 //           && p.ApprovalTreeDetailId != 0
                                 //           && p.ApprovalStatus == AppConsts.STATUS_PENDING
                                 //           ).OrderBy(p => p.ApprovalSeq).ToListAsync();
                if (stepRemain.Count() == 0) throw new UserFriendlyException("Không thể bỏ qua bước duyệt thứ " + skipStep.ApprovalSeq + " do đây là người duyệt cuối của phòng ban này");
                var  requestApprovalStepRemainNext  = await _requestApprovalStepRepository.GetAll().Where(
                           p => p.ReqId == skipStep.ReqId
                           && p.ProcessTypeCode == skipStep.ProcessTypeCode
                           && p.ApprovalSeq > skipStep.ApprovalSeq
                           && p.ApprovalStatus == AppConsts.STATUS_PENDING
                           ).OrderBy(p => p.ApprovalSeq)
                       .FirstOrDefaultAsync();
                if (requestApprovalStepRemainNext != null)
                {
                    var skipStepType = await _mstApprovalTreeDetailRepository.FirstOrDefaultAsync(e => e.Id == skipStep.ApprovalTreeDetailId);
                    var requestApprovalStepRemainType = await _mstApprovalTreeDetailRepository.FirstOrDefaultAsync(e => e.Id == requestApprovalStepRemainNext.ApprovalTreeDetailId);
                    if (skipStepType != null && requestApprovalStepRemainType != null && skipStepType.ApprovalTypeId != requestApprovalStepRemainType?.ApprovalTypeId)
                    {
                        throw new UserFriendlyException("Không thể bỏ qua bước duyệt thứ " + skipStep.ApprovalSeq + " do đây là người duyệt cuối");
                    }
                    else
                    {
                        stepSkipList.Add(skipStep);
                    }
                }
                else
                {
                    throw new UserFriendlyException("Không thể bỏ qua bước duyệt " + skipStep.ApprovalSeq + " do đây là người duyệt cuối");
                }
            }
            foreach(var stepSkipData in stepSkipList)
            {
                stepSkipData.ApprovalStatus = AppConsts.STATUS_SKIP;
                stepSkipData.Note = note;
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        public async Task ConfirmRequestForSending(RequestNextApprovalTreeInputDto createRequestApprovalInputDto)
        {
            if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.UR)
            {
                //Lây loại từ bảng PoHeaders,Amount From, To, Currency
                //ProcessTypeId = 1;
                //Quyry vào bảng PrRequisitionHeaders theo ID lay duoc cot InventoryGroupId
                //Lay amount trong bang PrRequisitionHeaders
                var userRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);

                if (userRequest == null)
                {
                    throw new UserFriendlyException("UR not found!");
                }
                else
                {
                    //if (userRequest != null && userRequest.BudgetCodeId == null) throw new UserFriendlyException("BudgetCode can not be empty!");
                    if (userRequest.ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (userRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");

                    userRequest.ApprovalStatus = AppConsts.STATUS_PENDING;
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PR)
            {
                var prRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (prRequest == null)
                {
                    throw new UserFriendlyException("PR not found!");
                }
                else
                {
                    if (prRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (prRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    var currency = await _mstCurrencyRepository.FirstOrDefaultAsync(p => p.CurrencyCode == prRequest.CurrencyCode);
                    if (currency == null)
                    {
                        throw new UserFriendlyException(400, "Currency not found!");
                    }
                    else
                    {

                        prRequest.AuthorizationStatus = AppConsts.STATUS_PENDING;
                    }
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PO)
            {
                var poRequest = await _mstPoHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (poRequest != null)
                {
                    if (poRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (poRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    //InventoryGroupId = poRequest.InventoryGroupId;
                    var currency = await _mstCurrencyRepository.FirstOrDefaultAsync(p => p.CurrencyCode == poRequest.CurrencyCode);
                    if (currency == null)
                    {
                        throw new UserFriendlyException(400, "Currency not found!");
                    }
                    else
                    {
                        poRequest.AuthorizationStatus = AppConsts.STATUS_PENDING;

                    }
                }
                else
                {
                    throw new UserFriendlyException(400, "PO not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PC)
            {
                var pcRequest = await _prcContractHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (pcRequest == null)
                {
                    throw new UserFriendlyException("Contract not found!");
                }
                else
                {
                    if (pcRequest.ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (pcRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    //InventoryGroupId = poRequest.InventoryGroupId;
                    pcRequest.ApprovalStatus = AppConsts.STATUS_PENDING;
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.GR)
            {
                var grRequest = await _rcvShipmentHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (grRequest != null)
                {
                    if (grRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (grRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    grRequest.AuthorizationStatus = AppConsts.STATUS_PENDING;
                }
                else
                {
                    throw new UserFriendlyException(400, "GR not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PM)
            {
                var paymentRequest = await _paymentHeadersRepository.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (paymentRequest != null)
                {
                    if (paymentRequest.AuthorizationStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (paymentRequest.AuthorizationStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    paymentRequest.AuthorizationStatus = AppConsts.STATUS_PENDING;
                }
                else
                {
                    throw new UserFriendlyException(400, "Payment not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.AN)
            {
                string _sql = "EXEC sp_PrcAppendixContractGetById @p_id";
                var contract = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
                {
                    p_id = createRequestApprovalInputDto.ReqId
                })).ToList();
                if (contract != null)
                {
                    if (contract[0].ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (contract[0].ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    string _sqlIns = "EXEC sp_PrcAppendixContractUpdStauts @p_status,@p_id,@p_user";
                    await _dapper.ExecuteAsync(_sqlIns, new
                    {
                        @p_status = AppConsts.STATUS_PENDING,
                        @p_id = createRequestApprovalInputDto.ReqId,
                        @p_user = AbpSession.UserId
                    });
                }
                else
                {
                    throw new UserFriendlyException(400, "AN not found!");
                }
            }
            else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.SR)
            {
                var supRequest = await _supRepo.FirstOrDefaultAsync(e => e.Id == createRequestApprovalInputDto.ReqId);
                if (supRequest != null)
                {
                    if (supRequest.ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    else if (supRequest.ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    supRequest.ApprovalStatus = AppConsts.STATUS_PENDING;
                }
                else
                {
                    throw new UserFriendlyException(400, "SR not found!");
                }
            }
            else
            {
                throw new UserFriendlyException(400, "Request type not found");
            }

            //var user = await _userRepository.FirstOrDefaultAsync();

            //if (departmentName != null)
            //{
            //    if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.UR)
            //    {
            //        await _mstUserRequestRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new UserRequest { DepartmentApprovalName = departmentName });
            //    }
            //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PR)
            //    {
            //        await _mstPrRequisitionHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PrRequisitionHeaders { DepartmentApprovalName = departmentName });
            //    }
            //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PO)
            //    {
            //        await _mstPoHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PoHeaders { DepartmentApprovalName = departmentName });
            //    }
            //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PC)
            //    {
            //        await _prcContractHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PrcContractHeaders { DepartmentApprovalName = departmentName });
            //    }
            //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.GR)
            //    {
            //        await _rcvShipmentHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new RcvShipmentHeaders { DepartmentApprovalName = departmentName });
            //    }
            //    else if (createRequestApprovalInputDto.ProcessTypeCode == AppConsts.PM)
            //    {
            //        await _paymentHeadersRepository.GetAll().Where(e => e.Id == createRequestApprovalInputDto.ReqId).UpdateFromQueryAsync(e => new PaymentHeaders { DepartmentApprovalName = departmentName });
            //    }
            //}
            RequestNextApprovalTreeInputDto requestNextApprovalTreeInputDto = new RequestNextApprovalTreeInputDto();
            requestNextApprovalTreeInputDto.ReqId = createRequestApprovalInputDto.ReqId;
            requestNextApprovalTreeInputDto.ProcessTypeCode = createRequestApprovalInputDto.ProcessTypeCode;
            await RequestNextApprovalTree(requestNextApprovalTreeInputDto);
        }

        [AbpAuthorize(AppPermissions.ApprovalManagement_Forward)]
        public async Task ForwardAndSkip(long stepId, long newUserId,string note)
        {
            var currentApprovalStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(stepId);
            currentApprovalStep.ApprovalStatus = AppConsts.STATUS_SKIP;
            currentApprovalStep.Note = note;
            var currentStepUserId = await _requestApprovalStepUserRepository.FirstOrDefaultAsync(e => e.RequestApprovalStepId == currentApprovalStep.Id);
            var forwardUser = await _userRepository.GetAll().Where(p => p.Id == newUserId).FirstOrDefaultAsync();

            var nextApproveStep = await _requestApprovalStepRepository.GetAll().Where(p =>
               p.ReqId == currentApprovalStep.ReqId
               && p.ProcessTypeCode == currentApprovalStep.ProcessTypeCode
               && p.ApprovalSeq > currentApprovalStep.ApprovalSeq
               ).FirstOrDefaultAsync();

            List<ApprovalUserDto> approvalUserDtoHierarchical = (await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                               ("exec sp_GetNextDepartmentHierarchical @HrOrgStructureId, @UserId  ",
                               new
                               {
                                   HrOrgStructureId = forwardUser.HrOrgStructureId,
                                   UserId = currentStepUserId.ApprovalUserId,
                               })).ToList();

            //var currentStepUser = await _userRepository.GetAll().Where(p => p.Id == currentStepUserId.ApprovalUserId).FirstOrDefaultAsync();
            if (currentStepUserId.ApprovalUserId == newUserId && currentApprovalStep.ApprovalStatus == AppConsts.STATUS_PENDING) throw new UserFriendlyException("Không thể chuyển tiếp cho chính mình !");

            if (approvalUserDtoHierarchical.Count() != 0 )
            {
                throw new UserFriendlyException("Không thể chuyển tiếp cho người này !");
            }
            else
            {
                var lsApprovalStepNext = await _requestApprovalStepRepository.GetAll().Where(p =>
                p.ReqId == currentApprovalStep.ReqId
                && p.ProcessTypeCode == currentApprovalStep.ProcessTypeCode
                && p.ApprovalSeq > currentApprovalStep.ApprovalSeq
                && p.ApprovalStatus == AppConsts.STATUS_PENDING
                ).ToListAsync();

                var nexApproveStep = lsApprovalStepNext.FirstOrDefault();
                if (nexApproveStep != null)
                {
                    var nextUserStep = await _requestApprovalStepUserRepository.FirstOrDefaultAsync(e => e.RequestApprovalStepId == nextApproveStep.Id);
                    if (nextUserStep != null && nextUserStep.ApprovalUserId == newUserId)
                    {
                        throw new UserFriendlyException("Người này đã phụ trách duyệt mức duyệt tiếp theo!");
                    }
                }

                //set tất cả các bản ghi phía sau + 1
                foreach (RequestApprovalStep step in lsApprovalStepNext)
                {

                    step.ApprovalSeq = step.ApprovalSeq + 1;
                    await _requestApprovalStepRepository.UpdateAsync(step);
                    await CurrentUnitOfWork.SaveChangesAsync();
                }
                //Insert bản ghi vào thứ tự phê duyệt
                RequestApprovalStep requestApprovalStep = new RequestApprovalStep();
                requestApprovalStep.ReqId = currentApprovalStep.ReqId;
                requestApprovalStep.ProcessTypeCode = currentApprovalStep.ProcessTypeCode;
                requestApprovalStep.ProcessTypeId = currentApprovalStep.ProcessTypeId;
                //requestApprovalStep.ApprovalTreeDetailId = 0;
                requestApprovalStep.ApprovalSeq = currentApprovalStep.ApprovalSeq + 1;
                requestApprovalStep.ApprovalStatus = AppConsts.STATUS_PENDING;
                requestApprovalStep.ApprovalUserId = newUserId;
                requestApprovalStep.RequestDate = DateTime.Now;
                //requestApprovalStep.Note = note;
                requestApprovalStep.DayOfProcess = currentApprovalStep.DayOfProcess;


                if (currentApprovalStep.DayOfProcess == null || currentApprovalStep.DayOfProcess == 0)
                {
                    requestApprovalStep.DeadlineDate = null;
                }
                else
                {
                    requestApprovalStep.DeadlineDate = requestApprovalStep.RequestDate.Value.AddDays(currentApprovalStep.DayOfProcess.Value);
                }
                
                requestApprovalStep.ApprovalEmail = forwardUser.EmailAddress;
                requestApprovalStep.ApprovalHrOrgStructureId = forwardUser.HrOrgStructureId;
                var newStepId = await _requestApprovalStepRepository.InsertAndGetIdAsync(requestApprovalStep);

                //IEnumerable<ApprovalUserDto> approvalUserDtoHierarchical = await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                //                ("exec sp_GetAllDepartmentHierarchical @HrOrgStructureId, @PositionId ",
                //                new
                //                {
                //                    HrOrgStructureId,
                //                    PositionId
                //                });
                //approvalUserDtos = approvalUserDtoHierarchical.ToList();

                RequestApprovalStepUser requestApprovalStepUser = new RequestApprovalStepUser();
                requestApprovalStepUser.RequestApprovalStepId = requestApprovalStep.Id;
                requestApprovalStepUser.ApprovalUserId = forwardUser.Id;
                requestApprovalStepUser.ApprovalEmail = forwardUser.EmailAddress;
                requestApprovalStepUser.CreatorUserId = AbpSession.UserId;
                requestApprovalStepUser.CreationTime = DateTime.Now;
                requestApprovalStepUser.ApprovalEmail = forwardUser.EmailAddress;
                requestApprovalStepUser.ApprovalHrOrgStructureId = forwardUser.HrOrgStructureId;

                await _requestApprovalStepUserRepository.InsertAsync(requestApprovalStepUser);

                await CurrentUnitOfWork.SaveChangesAsync();

            }
        }

        public async Task UndoRequest(long reqId, string processTypeCode)
        {
            await BackupData(processTypeCode, reqId);
            if (processTypeCode == AppConsts.PC)
            {
                var pcRequest = await _prcContractHeadersRepository.FirstOrDefaultAsync(p => p.Id == reqId);
                pcRequest.ApprovalStatus = AppConsts.STATUS_NEW;
                pcRequest.DepartmentApprovalName = "";
            }
            else if (processTypeCode == AppConsts.PR)
            {
                var prRequest = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(p => p.Id == reqId);
                prRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                prRequest.ApprovedDate = DateTime.Now;
                prRequest.DepartmentApprovalName = "";
            }
            else if (processTypeCode == AppConsts.UR)
            {
                var urRequest = await _mstUserRequestRepository.FirstOrDefaultAsync(p => p.Id == reqId);
                urRequest.ApprovalStatus = AppConsts.STATUS_NEW;
                urRequest.DepartmentApprovalName = "";

            }
            else if (processTypeCode == AppConsts.PO)
            {
                var poRequest = await _mstPoHeadersRepository.FirstOrDefaultAsync(p => p.Id == reqId);
                poRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                poRequest.DepartmentApprovalName = "";

                //_requestApprovalDapperRepository.ExecuteAsync("EXEC sp_PoSynToOrcale @PoHeaderId", new { @PoHeaderId = poRequest.Id});
            }
            else if (processTypeCode == AppConsts.GR)
            {
                var grRequest = await _rcvShipmentHeadersRepository.FirstOrDefaultAsync(p => p.Id == reqId);
                grRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                grRequest.DepartmentApprovalName = "";
            }
            else if (processTypeCode == AppConsts.PM)
            {
                var paymentRequest = await _paymentHeadersRepository.FirstOrDefaultAsync(p => p.Id == reqId);
                paymentRequest.AuthorizationStatus = AppConsts.STATUS_NEW;
                paymentRequest.DepartmentApprovalName = "";
            }
            else if (processTypeCode == AppConsts.SR)
            {
                var supRequest = await _supRepo.FirstOrDefaultAsync(p => p.Id == reqId);
                supRequest.ApprovalStatus = AppConsts.STATUS_NEW;
                supRequest.DepartmentApprovalName = "";

                var supplier = await _supplierRepo.FirstOrDefaultAsync(e => e.VatRegistrationNum == supRequest.TaxRegistrationNumber);
                if(supplier != null)
                {
                    supplier.Status = "Not Qualify";
                }
            }
            else if (processTypeCode == AppConsts.AN)
            {
                string _sql = "EXEC sp_PrcAppendixContractGetById @p_id";
                var contract = (await _dapper.QueryAsync<PrcAppendixContractDto>(_sql, new
                {
                    p_id = reqId
                })).ToList();
                if (contract != null)
                {
                    //if (contract[0].ApprovalStatus == AppConsts.STATUS_REJECTED) await BackupData(createRequestApprovalInputDto.ProcessTypeCode, createRequestApprovalInputDto.ReqId);
                    //else if (contract[0].ApprovalStatus == AppConsts.STATUS_APPROVED) throw new UserFriendlyException("Request Already Approved!");
                    string _sqlIns = "EXEC sp_PrcAppendixContractUpdStauts @p_status,@p_id,@p_user";
                    await _dapper.ExecuteAsync(_sqlIns, new
                    {
                        @p_status = AppConsts.STATUS_NEW,
                        @p_id = reqId,
                        @p_user = AbpSession.UserId
                    });
                }
                else
                {
                    throw new UserFriendlyException(400, "AN not found!");
                }
            }

            var input = new CreateRequestApprovalInputDto();
            input.ProcessTypeCode = processTypeCode;
            input.ReqId = reqId;

            await CreateRequestApprovalTree(input);

        }

        public async Task AddNewStepToTree(long userId, long reqId, string processTypeCode, long dayOfProcess)
        {
            var approvalStepList = await _requestApprovalStepRepository.GetAll().Where(
                               p => p.ReqId == reqId
                               && p.ProcessTypeCode == processTypeCode
                               ).OrderBy(p => p.ApprovalSeq).ToListAsync();
            if (approvalStepList.Count() == 0) throw new UserFriendlyException("Không tìm thấy luồng duyệt ");

            var newUser = await _userRepository.GetAll().Where(p => p.Id == userId).FirstOrDefaultAsync();

            long seq = 1;
            bool isFound = false;
            foreach (var step in approvalStepList)
            {
                var stepUser = await _requestApprovalStepUserRepository.FirstOrDefaultAsync(e => e.RequestApprovalStepId == step.Id);
                var approvalUser = await _userRepository.FirstOrDefaultAsync(e => e.Id == stepUser.ApprovalUserId);
                List<ApprovalUserDto> approvalUserDtoHierarchical = (await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                          ("exec sp_GetNextDepartmentHierarchical @HrOrgStructureId, @UserId  ",
                          new
                          {
                              HrOrgStructureId = stepUser.ApprovalHrOrgStructureId,
                              UserId = newUser.Id,
                          })).ToList();
                if (approvalUserDtoHierarchical.Count() > 0)//người thêm mới có chức vụ nhỏ hơn step
                {
                    isFound = true;
                    seq = step.ApprovalSeq + 1;
                }
                else//người thêm mới có chức vụ lớn hơn step
                {
                    if (stepUser.ApprovalHrOrgStructureId == newUser.HrOrgStructureId)
                    {
                        seq = step.ApprovalSeq;
                        //kiểm tra chức vụ qua Title
                        var newTitle = await _titleRepo.FirstOrDefaultAsync(e => e.Id == newUser.TitlesId);
                        var currentTitle = await _titleRepo.FirstOrDefaultAsync(e => e.Id == approvalUser.TitlesId);

                        if (newTitle.Seq > currentTitle.Seq) seq = step.ApprovalSeq + 1;
                        else break;
                    }
                    else
                        if (isFound) break; //Da từng tìm thấy rồi thì dừng lại
                }
            }

            var remainStep =  await _requestApprovalStepRepository.GetAll().Where(
                               p => p.ReqId == reqId
                               && p.ProcessTypeCode == processTypeCode
                               && p.ApprovalSeq >= seq
                               ).OrderBy(p => p.ApprovalSeq).ToListAsync();

            foreach (var step in remainStep)
            {
                step.ApprovalSeq = step.ApprovalSeq + 1;
                 
            }



            //Insert bản ghi vào thứ tự phê duyệt
            RequestApprovalStep requestApprovalStep = new RequestApprovalStep();
            requestApprovalStep.ReqId = reqId;
            requestApprovalStep.ProcessTypeCode = processTypeCode;
            requestApprovalStep.ApprovalSeq = seq;
            requestApprovalStep.ApprovalStatus = AppConsts.STATUS_PENDING;
            requestApprovalStep.ApprovalUserId = userId;
            requestApprovalStep.RequestDate = DateTime.Now;
            requestApprovalStep.DayOfProcess = dayOfProcess;

            requestApprovalStep.ApprovalEmail = newUser.EmailAddress;
            requestApprovalStep.ApprovalHrOrgStructureId = newUser.HrOrgStructureId;

            var newStepId = await _requestApprovalStepRepository.InsertAndGetIdAsync(requestApprovalStep);

            RequestApprovalStepUser requestApprovalStepUser = new RequestApprovalStepUser();
            requestApprovalStepUser.RequestApprovalStepId = requestApprovalStep.Id;
            requestApprovalStepUser.ApprovalUserId = userId;
            requestApprovalStepUser.ApprovalEmail = newUser.EmailAddress;
            requestApprovalStepUser.CreatorUserId = AbpSession.UserId;
            requestApprovalStepUser.CreationTime = DateTime.Now;
            requestApprovalStepUser.ApprovalHrOrgStructureId = newUser.HrOrgStructureId;

            await _requestApprovalStepUserRepository.InsertAsync(requestApprovalStepUser);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task DeleteStep(long stepId)
        {
            var approvalStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(stepId);
            var remainStep = await _requestApprovalStepRepository.GetAll().Where(
                              p => p.ReqId == approvalStep.ReqId
                              && p.ProcessTypeCode == approvalStep.ProcessTypeCode
                              && p.ApprovalSeq > approvalStep.ApprovalSeq
                              ).OrderBy(p => p.ApprovalSeq).ToListAsync();
            foreach (var step in remainStep)
            {
                step.ApprovalSeq = step.ApprovalSeq - 1; // kéo xuống cuối
                await _requestApprovalStepRepository.UpdateAsync(step);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            await _requestApprovalStepRepository.DeleteAsync(stepId);
        }

        public async Task SaveChangeStepPosition(long stepId, long updateSeq)
        {
            var approvalStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(stepId);
            var currentUserStep = await _requestApprovalStepUserRepository.FirstOrDefaultAsync(e => e.RequestApprovalStepId == approvalStep.Id);
            var currentApprovalUser = await _userRepository.FirstOrDefaultAsync(e => e.Id == currentUserStep.ApprovalUserId);

            var updateStep = await _requestApprovalStepRepository.FirstOrDefaultAsync(e => e.ReqId == approvalStep.ReqId && e.ProcessTypeCode == approvalStep.ProcessTypeCode && e.ApprovalSeq == updateSeq);
            var updateUserStep = await _requestApprovalStepUserRepository.FirstOrDefaultAsync(e => e.RequestApprovalStepId == updateStep.Id);
            var updateApprovalUser = await _userRepository.FirstOrDefaultAsync(e => e.Id == updateUserStep.ApprovalUserId);


                List<ApprovalUserDto> approvalUserDtoHierarchical = (await _requestApprovalDapperRepository.QueryAsync<ApprovalUserDto>
                         ("exec sp_GetNextDepartmentHierarchical @HrOrgStructureId, @UserId  ",
                         new
                         {
                             HrOrgStructureId = approvalStep.ApprovalSeq > updateSeq ? updateUserStep.ApprovalHrOrgStructureId : currentUserStep.ApprovalHrOrgStructureId,
                             UserId = approvalStep.ApprovalSeq > updateSeq ? currentUserStep.ApprovalUserId : updateUserStep.ApprovalUserId,
                         })).ToList();
                if (approvalUserDtoHierarchical.Count() > 0) throw new UserFriendlyException("Không thể đổi đến vị trí này");
                else
                {
                    var newTitle = await _titleRepo.FirstOrDefaultAsync(e => e.Id == updateApprovalUser.TitlesId);
                    var currentTitle = await _titleRepo.FirstOrDefaultAsync(e => e.Id == currentApprovalUser.TitlesId);
                    if ((approvalStep.ApprovalSeq > updateSeq && currentTitle.Seq > newTitle.Seq) || (approvalStep.ApprovalSeq < updateSeq && currentTitle.Seq < newTitle.Seq)) throw new UserFriendlyException("Không thể đổi đến vị trí này");

                }
            var remainStep = await _requestApprovalStepRepository.GetAll().Where(
                              p => p.ReqId == approvalStep.ReqId
                              && p.ProcessTypeCode == approvalStep.ProcessTypeCode
                              && (approvalStep.ApprovalSeq > updateSeq 
                                ? (p.ApprovalSeq >= updateSeq && p.ApprovalSeq < approvalStep.ApprovalSeq) 
                                : (p.ApprovalSeq <= updateSeq && p.ApprovalSeq > approvalStep.ApprovalSeq))
                              ).OrderBy(p => p.ApprovalSeq).ToListAsync();
                foreach (var step in remainStep)
                {
                    
                    step.ApprovalSeq = (approvalStep.ApprovalSeq > updateSeq) ? ( step.ApprovalSeq + 1) : (step.ApprovalSeq - 1);
                    //await _requestApprovalStepRepository.UpdateAsync(step);
                    //await CurrentUnitOfWork.SaveChangesAsync();
                }


            approvalStep.ApprovalSeq = updateSeq;
            await CurrentUnitOfWork.SaveChangesAsync();

        }


        #region --Thao tác nhiều yêu cầu chứng từ cùng một lúc
        public async Task CheckRequestNextMultipleApprovalTree(string processTypeCode,List<long> reqIds)
        {

            var firstRequestsStep = await _requestApprovalStepRepository.GetAll().Where(e => e.ReqId == reqIds[0] && e.ProcessTypeCode == processTypeCode).Select(e => new { e.Id, e.ApprovalTreeDetailId }).ToListAsync();
            //var firtReqStepUser = _requestApprovalStepUserRepository.GetAll().Where(e => firstRequestsStep.Select(e => e.Id).Contains(e.RequestApprovalStepId)).Select(e => e.ApprovalUserId);
            var firtReqStepUser = await (from su in _requestApprovalStepUserRepository.GetAll().AsNoTracking()
                                  join s in _requestApprovalStepRepository.GetAll().AsNoTracking() on su.RequestApprovalStepId equals s.Id
                                  where firstRequestsStep.Select(e => e.Id).Contains(su.RequestApprovalStepId)
                                  select new
                                  {
                                      su.ApprovalUserId,
                                      s.ApprovalSeq
                                  }).ToListAsync();

            foreach (var reqId in reqIds)
            {
                var allStep = await _requestApprovalStepRepository.GetAll().Where(e => e.ReqId == reqId && e.ProcessTypeCode == processTypeCode).Select(e => new { e.Id, e.ApprovalTreeDetailId,e.ApprovalStatus }).ToListAsync();
                //var stepUser = _requestApprovalStepUserRepository.GetAll().Where(e => allStep.Select(e => e.Id).Contains(e.RequestApprovalStepId)).Select(e => e.ApprovalUserId);
                var stepUser = await(from su in _requestApprovalStepUserRepository.GetAll().AsNoTracking()
                                    join s in _requestApprovalStepRepository.GetAll().AsNoTracking() on su.RequestApprovalStepId equals s.Id
                                    where allStep.Select(e => e.Id).Contains(su.RequestApprovalStepId)
                                    select new
                                    {
                                        su.ApprovalUserId,
                                        s.ApprovalSeq
                                    }).ToListAsync();

                if (allStep.Any(e => e.ApprovalStatus == AppConsts.STATUS_WAITTING || e.ApprovalStatus == AppConsts.STATUS_APPROVED)) throw new UserFriendlyException("Yêu cầu đã được gửi");
                // check xem 2 header có cùng type hay ko 
                var checkTreeType = firstRequestsStep.Select(e => e.ApprovalTreeDetailId).Union(allStep.Select(e => e.ApprovalTreeDetailId));
                if (firstRequestsStep.GroupBy(e => e.ApprovalTreeDetailId).Count() != checkTreeType.Count() ) throw new UserFriendlyException("Nhóm hàng hóa khác nhau , không thể gửi yêu cầu cùng lúc");

                // check xem số lượng các step bvaf user có bằng nhau ko 
                if (firtReqStepUser.Count() != stepUser.Count()) throw new UserFriendlyException("Luồng duyệt khác nhau , không thể gửi yêu cầu cùng lúc");
                
                // check xem type các step có giống nhau ko 
                var checkContain = firtReqStepUser.Union(stepUser);
                if (checkContain.Count() != firtReqStepUser.Count()) throw new UserFriendlyException("Luồng duyệt khác nhau , không thể gửi yêu cầu cùng lúc");

            }

        }
        public async Task AddNewStepToTreeForMulltipleHeader(long userId, string processTypeCode, long dayOfProcess, List<long> reqIds)
        {

            foreach(var reqId in reqIds)
            {
                await AddNewStepToTree(userId, reqId, processTypeCode, dayOfProcess);
            }

        }
        public async Task SaveChangeStepPositionForMulltipleHeader(long firstSeq, long updateSeq,string processTypeCode, List<long> reqIds)
        {
            var requestStepNeedUpdate = await _requestApprovalStepRepository.GetAll().Where(e => reqIds.Contains(e.ReqId) && e.ProcessTypeCode == processTypeCode && e.ApprovalSeq == firstSeq).ToListAsync();
            foreach(var step in requestStepNeedUpdate)
            {
                await SaveChangeStepPosition(step.Id, updateSeq);
            }

        }
        public async Task SentRequestForMultipleHeader(string processTypeCode, List<long> reqIds)
        {
            foreach (var reqId in reqIds)
            {
                var requestNextApprovalTreeInputDto = new RequestNextApprovalTreeInputDto();
                requestNextApprovalTreeInputDto.ReqId = reqId;
                requestNextApprovalTreeInputDto.ProcessTypeCode = processTypeCode;
                await ConfirmRequestForSending(requestNextApprovalTreeInputDto);
            }

        }
        public async Task SkipStepForMultipleHeader(string note,  long skipSeq, string processTypeCode, List<long> reqIds)
        {
            foreach (var reqId in reqIds)
            {
                var stepIds = await _requestApprovalStepRepository.GetAll().Where(e => e.ApprovalSeq == skipSeq && e.ReqId == reqId && e.ProcessTypeCode == processTypeCode).Select(e => e.Id).ToListAsync();

                if (stepIds.Count() > 0) await SkipSelectedSteps(note, stepIds);

            }

        }
        public async Task DeleteStepForMultipleHeader( long skipSeq, string processTypeCode, List<long> reqIds)
        {
            foreach (var reqId in reqIds)
            {
                var step = await _requestApprovalStepRepository.FirstOrDefaultAsync(e => e.ApprovalSeq == skipSeq && e.ReqId == reqId && e.ProcessTypeCode == processTypeCode);
                if (step != null) await DeleteStep(step.Id);
            }

        }
        public async Task SkipAndForwardForMultipleHeader(long skipSeq, long newUserId, string note, string processTypeCode, List<long> reqIds)
        {
            foreach (var reqId in reqIds)
            {
                var step = await _requestApprovalStepRepository.FirstOrDefaultAsync(e => e.ApprovalSeq == skipSeq && e.ReqId == reqId && e.ProcessTypeCode == processTypeCode);
                if (step != null) await ForwardAndSkip(step.Id , newUserId, note);
            }

        }

        public async Task ApproveOrRejectMUltipleHeader(List<ApproveOrRejectInputDto> steps)
        {
            foreach (var step in steps)
            {
                await ApproveOrReject(step);
            }

        }
        #endregion

        public async Task AssignJobToOtherBuyer(string processTypeCode,long reqId,long userId )
        {
            if (processTypeCode == "PR")
            {
                var pr = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == reqId);
                if (pr != null)
                {
                    pr.PicUserId = userId;
                    return;
                }
            }
            else if (processTypeCode == "UR")
            {
                var ur = await _mstPrRequisitionHeadersRepository.FirstOrDefaultAsync(e => e.Id == reqId);
                if (ur != null)
                {
                    ur.PicUserId = userId;
                    return;
                }
            }
        }

        public async Task<List<GetEmployeesDto>> GetAllBuyerInfo(string filterText)
        {

            var result = await (
                                                   from us in _userRepository.GetAll().Where(e => e.IsActive == true && (e.IsBuyer != null && e.IsBuyer == true)).AsNoTracking()
                                                   where string.IsNullOrWhiteSpace(filterText) ? 1==1 : (us.Name.Contains(filterText) || us.UserName.Contains(filterText)) 
                                                   select new GetEmployeesDto
                                                   {
                                                       Id = us.Id,
                                                       Name = us.Name,
                                                       UserName= us.UserName,
                                                       EmailAddress = us.EmailAddress,
                                                       EmployeeCode =us.EmployeeCode,
                                                         HrOrgStructureId =us.HrOrgStructureId,
                                                    }).ToListAsync();
            return result;
        }


    }



}
