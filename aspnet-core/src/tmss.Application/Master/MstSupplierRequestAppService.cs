using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Abp.Net.Mail;
using Abp.UI;
using IdentityModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Roles;
using tmss.Authorization.Users;
using tmss.Authorization.Users.Dto;
using tmss.Common.GeneratePurchasingNumber;
using tmss.Config;
using tmss.Config.Dto;
using tmss.GR.Enum;
using tmss.Master.SupplierRequest;
using tmss.Master.SupplierRequest.Dto;
using tmss.RequestApproval;
using tmss.RequestApproval.Dto;
using tmss.SendMail;

namespace tmss.Master
{

    public class MstSupplierRequestAppService : tmssAppServiceBase, IMstSupplierRequestAppService
    {
        private readonly IRepository<MstSupplierRequest, long> _supplierRequestRepository;
        private readonly ICfgEmailTemplateAppService _iCfgEmailTemplate;
        private readonly IPasswordHasher<User> _passwordHasher;
        public readonly IEmailSender _sendEmail;
        private readonly IRepository<MstSupplierContacts, long> _mstSupplierContactsRepository;
        private readonly IRepository<MstSupplierSites, long> _mstSupplierSitesRepository;
        private readonly IRepository<MstSuppliers, long> _mstSuppliersRepository;
        private readonly IDapperRepository<User, long> _dapper;
        private readonly IRepository<User, long> _userRepo;
        private readonly IRepository<Role> _roleRepo;
        private readonly IUserAppService _userInterface;
        private readonly ISendEmail _sendMail;
        //private readonly IRequestApprovalTreeAppService _sentRequestInf;
        private readonly UserManager _userManager;
        private readonly ICommonGeneratePurchasingNumberAppService _commonGeneratePurchasingNumberAppService;
        private readonly ISendMailService _sendMailService;

        public MstSupplierRequestAppService(IRepository<MstSupplierRequest, long> supplierRequestRepository,
            ICfgEmailTemplateAppService iCfgEmailTemplate,
            IPasswordHasher<User> passwordHasher, IEmailSender sendEmail,
            IRepository<MstSupplierContacts, long> mstSupplierContactsRepository,
            IRepository<MstSupplierSites, long> mstSupplierSitesRepository,
            IRepository<MstSuppliers, long> mstSuppliersRepository,
            IDapperRepository<User, long> dapper,
            IRepository<User, long> userRepo,
            IRepository<Role> roleRepo,
            IUserAppService userInterface,
            ISendEmail sendMail,
            //IRequestApprovalTreeAppService sentRequestInf,
            UserManager userManager,
            //IUserAppService userManager,
            ICommonGeneratePurchasingNumberAppService commonGeneratePurchasingNumberAppService,
            ISendMailService sendMailService)
        {
            _supplierRequestRepository = supplierRequestRepository;
            _iCfgEmailTemplate = iCfgEmailTemplate;
            _passwordHasher = passwordHasher;
            _sendEmail = sendEmail;
            _mstSupplierContactsRepository = mstSupplierContactsRepository;
            _mstSupplierSitesRepository = mstSupplierSitesRepository;
            _mstSuppliersRepository = mstSuppliersRepository;
            _dapper = dapper;
            _userRepo = userRepo;
            _roleRepo = roleRepo;
            _userInterface = userInterface;
            _sendMail = sendMail;
            //_sentRequestInf = sentRequestInf;
            _userManager = userManager;
            _commonGeneratePurchasingNumberAppService = commonGeneratePurchasingNumberAppService;
            _sendMailService = sendMailService;
        }

        [AbpAuthorize(AppPermissions.SupplierRequest_Search)]
        public async Task<PagedResultDto<SupplierRequestInfoDto>> GetAllSupplier(SupplierRequestInput input)
        {
            var listRequester = from spl in _supplierRequestRepository.GetAll().AsNoTracking()
                                where !string.IsNullOrWhiteSpace(input.FilterText) ? (spl.RequestPerson.Contains(input.FilterText) 
                                    || spl.SupplierName.Contains(input.FilterText) 
                                    || spl.RequestEmail.Contains(input.FilterText)) : 1 == 1
                                orderby spl.Id , spl.RequestExpiredDate descending
                                select new SupplierRequestInfoDto
                                {
                                    Id = spl.Id,
                                     SupplierName = spl.SupplierName,
                                     TaxRegistrationNumber = spl.TaxRegistrationNumber,
                                     Address = spl.Address,
                                     Tel = spl.Tel,
                                     Tax = spl.Tax,
                                     ConntactPerson1 = spl.ConntactPerson1,
                                     ContactEmail1 = spl.ContactEmail1,
                                     ContactMobile1 = spl.ContactMobile1,
                                    ConntactPerson2 = spl.ConntactPerson2,
                                    ContactEmail2 = spl.ContactEmail2,
                                    ContactMobile2 = spl.ContactMobile2,
                                    ConntactPerson3 = spl.ConntactPerson3,
                                    ContactEmail3 = spl.ContactEmail3,
                                    ContactMobile3 = spl.ContactMobile3,
                                    ClassificationType = spl.ClassificationType,
                                     BeneficiaryName = spl.BeneficiaryName,
                                     BeneficiaryAccount = spl.BeneficiaryAccount,
                                     BankCode = spl.BankCode,
                                     BankName = spl.BankName,
                                     BankBranch = spl.BankBranch,
                                     BankAddress = spl.BankAddress,
                                     RequestPerson = spl.RequestPerson,
                                     RequestEmail = spl.RequestEmail,
                                     RequestUniqueId = spl.RequestUniqueId,
                                     RequestExpiredDate = spl.RequestExpiredDate,
                                     NationId = spl.NationId,
                                     ProvinceId = spl.ProvinceId,
                                     DistrictId = spl.DistrictId,
                                     AbbreviateName = spl.AbbreviateName,
                                     RepresentName = spl.RepresentName,
                                     Location = spl.Location,
                                     ApprovalStatus = spl.ApprovalStatus,
                                     RequestNo = spl.RequestNo,
                                    DepartmentApprovalName = spl.DepartmentApprovalName,
                                };
            var pagedAndFilteredInfo = listRequester.PageBy(input);
            int totalCount = await listRequester.CountAsync();
            return new PagedResultDto<SupplierRequestInfoDto>(
                       listRequester.Count(),
                       pagedAndFilteredInfo.ToList()
                      );
        }

        public async Task<SupplierRequestInfoDto> GetSupplierRequestById(long id)
        {
            var requestData = from spl in _supplierRequestRepository.GetAll().AsNoTracking()
                                where spl.Id == id
                                orderby spl.Id, spl.RequestExpiredDate descending
                                select new SupplierRequestInfoDto
                                {
                                    Id = spl.Id,
                                    SupplierName = spl.SupplierName,
                                    TaxRegistrationNumber = spl.TaxRegistrationNumber,
                                    Address = spl.Address,
                                    Tel = spl.Tel,
                                    Tax = spl.Tax,
                                    ConntactPerson1 = spl.ConntactPerson1,
                                    ContactEmail1 = spl.ContactEmail1,
                                    ContactMobile1 = spl.ContactMobile1,
                                    ConntactPerson2 = spl.ConntactPerson2,
                                    ContactEmail2 = spl.ContactEmail2,
                                    ContactMobile2 = spl.ContactMobile2,
                                    ConntactPerson3 = spl.ConntactPerson3,
                                    ContactEmail3 = spl.ContactEmail3,
                                    ContactMobile3 = spl.ContactMobile3,
                                    ClassificationType = spl.ClassificationType,
                                    BeneficiaryName = spl.BeneficiaryName,
                                    BeneficiaryAccount = spl.BeneficiaryAccount,
                                    BankCode = spl.BankCode,
                                    BankName = spl.BankName,
                                    BankBranch = spl.BankBranch,
                                    BankAddress = spl.BankAddress,
                                    RequestPerson = spl.RequestPerson,
                                    RequestEmail = spl.RequestEmail,
                                    RequestUniqueId = spl.RequestUniqueId,
                                    RequestExpiredDate = spl.RequestExpiredDate,
                                    NationId = spl.NationId,
                                    ProvinceId = spl.ProvinceId,
                                    DistrictId = spl.DistrictId,
                                    AbbreviateName = spl.AbbreviateName,
                                    RepresentName = spl.RepresentName,
                                    Location = spl.Location,
                                    ApprovalStatus = spl.ApprovalStatus,
                                    RequestNo = spl.RequestNo,
                                    DepartmentApprovalName = spl.DepartmentApprovalName,
                                    CurrencyId = spl.CurrencyId,
                                };
            return await requestData.FirstOrDefaultAsync();
        }

        [AbpAllowAnonymous]
        public async Task<SupplierRequestInfoDto> GetSupplierByGuId(Guid requestUniqueId)
        { 
            var requestInfo = await _supplierRequestRepository.GetAll().Where(e => e.RequestUniqueId.ToString().ToLower() == requestUniqueId.ToString().ToLower()).FirstOrDefaultAsync();
            var result = ObjectMapper.Map<SupplierRequestInfoDto>(requestInfo);
            if (result.RequestExpiredDate.Value.Date < DateTime.Now) result.IsExpired = true;
            else result.IsExpired = false;
            return result;
        }

        [AbpAllowAnonymous]
        [AbpAuthorize(AppPermissions.SupplierRequest_Add, AppPermissions.SupplierRequest_Edit)]
        public async Task<long?> CreateOrEditSupplierRequest(SupplierRequestInfoDto dto)
        {
            
            if (dto.Id == 0 || dto.Id == null)  // create New
            {
                string requestNo = await _commonGeneratePurchasingNumberAppService.GenerateRequestNumber(GenSeqType.SupplierRequest);
                //var requestInfo = await _supplierRequestRepository.GetAll().Where(e => e.RequestUniqueId.ToString().ToLower() == requestUniqueId.ToString().ToLower()).FirstOrDefaultAsync();
                Guid id = Guid.NewGuid();
                dto.RequestUniqueId = id;
                var result = ObjectMapper.Map<MstSupplierRequest>(dto);
                result.RequestNo = requestNo;
                var newId = await _supplierRequestRepository.InsertAndGetIdAsync(result);

                if (!string.IsNullOrWhiteSpace(dto.RequestBaseUrl)) await sentEmailToUser(dto);

                //var input = new CreateRequestApprovalInputDto();
                //input.ReqId = newId;
                //input.ProcessTypeCode = "SR";
                //await _sentRequestInf.CreateRequestApprovalTree(input);
                return newId;
            }
            else // update 
            {
                if (dto.IsUpdateRequestOnly == false || dto.IsUpdateRequestOnly == null)
                {
                    await validateMail(dto.ContactEmail1, "Contact email 1 already exist in this system", dto.Id);
                    await validateMail(dto.ContactEmail2, "Contact email 2 already exist in this system", dto.Id);
                    await validateMail(dto.ContactEmail3, "Contact email 3 already exist in this system", dto.Id);
                }
                var requestInfo = await _supplierRequestRepository.FirstOrDefaultAsync(e => e.Id == dto.Id);
                if (requestInfo != null)
                {
                    ObjectMapper.Map(dto,requestInfo);
                    await CurrentUnitOfWork.SaveChangesAsync();
                    //if (!string.IsNullOrWhiteSpace(dto.RequestBaseUrl)) await sentEmailToUser(dto);
                }

                return dto.Id;
            }
        }
         
        private async Task validateMail(string mail ,string message, long? id)
        {
            var supplier = await _supplierRequestRepository.FirstOrDefaultAsync(e => (e.ContactEmail1 == mail || e.ContactEmail2 == mail || e.ContactEmail3 == mail) && e.Id != id);
            var contact = await _mstSupplierContactsRepository.FirstOrDefaultAsync(e => e.EmailAddress == mail);
            if (!string.IsNullOrWhiteSpace(mail) && (supplier != null || contact != null)) throw new UserFriendlyException(message);

        }

        public async Task DeleteSupplierRequest(long id)
        {

            await _dapper.ExecuteAsync
                ("EXEC sp_RequestApprovalBackupHistory @ProcessTypeCode, @ReqId",
                new
                {
                    @ProcessTypeCode = "SR",
                    @ReqId = id,
                });
            await _supplierRequestRepository.DeleteAsync(id);

        }

        [AbpAuthorize(AppPermissions.SupplierRequest_Rejected)]
        public async Task RejectRequest(SupplierRequestInfoDto dto)
        {
            var request = await _supplierRequestRepository.FirstOrDefaultAsync((long)dto.Id);
            if (request != null) request.ApprovalStatus = AppConsts.STATUS_REJECTED;
            else throw new UserFriendlyException("Cannot find request");
        }

        [AbpAuthorize(AppPermissions.SupplierRequest_ApproveAndCreateAccount, AppPermissions.ApprovalManagement_ApproveRequest)]
        public async Task Approve(SupplierRequestInfoDto dto)
        {
            
            var supplier = await _mstSuppliersRepository.FirstOrDefaultAsync(e => e.VatRegistrationNum == dto.TaxRegistrationNumber);
            var userExist = await _userRepo.FirstOrDefaultAsync(e => e.EmailAddress == dto.RequestEmail);
            if (supplier != null) throw new UserFriendlyException("Supplier already been created (Tax registration num duplicated)");
            if (userExist != null) throw new UserFriendlyException("Cannot create account cause there is an account that already associated with this email please try approve with other email");

            string _sqlUpdateChecked = "Exec sp_MstSuppliers$Insert @SupplierRequestId ,@CreatorUserId  ";
            
            var list = (await _dapper.QueryAsync<SupplierRequestInfoDto>(_sqlUpdateChecked, new
            {
                SupplierRequestId = dto.Id,
                CreatorUserId = AbpSession.UserId,
            })).FirstOrDefault();

            var request = await _supplierRequestRepository.FirstOrDefaultAsync((long)dto.Id);
            if (request != null) request.ApprovalStatus = AppConsts.STATUS_APPROVED;
            else throw new UserFriendlyException("Cannot find request");

            //if (list != null)
            //{
            //    if (!string.IsNullOrWhiteSpace(list.ErrMess)) throw new UserFriendlyException(list.ErrMess);
            //}

            if (dto.CreateAccount)
            {
                var pass = GenerateRandomPassword(null);
                if (list != null)
                {
                    
                    User user = new User();
                    user.AccessFailedCount = 0;
                    user.CreationTime = DateTime.Now;
                    user.Name = dto.ConntactPerson1;
                    user.Surname = dto.ContactSurName ?? "";
                    user.UserName = dto.TaxRegistrationNumber;
                    user.EmailAddress = dto.RequestEmail;
                    user.Password = _passwordHasher.HashPassword(user, pass);
                    user.PhoneNumber = dto.ContactMobile1;
                    user.NormalizedEmailAddress = dto.TaxRegistrationNumber;
                    user.NormalizedUserName = dto.TaxRegistrationNumber;
                    user.SupplierContactId = list.SupContactId;
                    user.ShouldChangePasswordOnNextLogin = true;
                    await _userRepo.InsertAsync(user);
                    await CurrentUnitOfWork.SaveChangesAsync();

                    var roleData = await _roleRepo.FirstOrDefaultAsync(e => e.DisplayName.ToLower() == "supplier" || e.Name.ToLower() == "supplier");
                    if (roleData == null) throw new UserFriendlyException("Không thể phân quyền supplier do không tìm thấy quyền trong hệ thống");
                    await _userManager.AddToRoleAsync(user, roleData.Name);
                }

                

                EmailTemplateOuputDto emailInfo = await _iCfgEmailTemplate.GetTemplateByCode("SUPPLY_CREATE_ACCOUNT_FROM_REQUEST");
                //MailContent content = new MailContent
                //{
                //    To = dto.RequestEmail,
                //    Subject = "Gửi yêu cầu tạo mới nhà cung cấp",
                //    Body = emailInfo.EmailTemplateContent.Replace("<username>", dto.TaxRegistrationNumber).Replace("<password>", pass).Replace("<person>", dto.RequestPerson).Replace("<link>", "<a>" + dto.RequestBaseUrl + "</a>"),
                //};
                //await _sendMailService.SendMail(content);
                //_userInterface.CreateOrUpdateUser()


                DelayPaymentEmailContent delayPaymentEmailContent = new DelayPaymentEmailContent();
                StringBuilder body = new StringBuilder();
                body.Append(emailInfo.EmailTemplateContent);

                string s_body = body.ToString();

                s_body = s_body.Replace("<username>", dto.TaxRegistrationNumber);
                s_body = s_body.Replace("<password>", pass);
                s_body = s_body.Replace("<person>", dto.RequestPerson);
                s_body = s_body.Replace("<link>",  dto.RequestBaseUrl );

                string[] listEmail = new string[] { dto.RequestEmail };

                delayPaymentEmailContent.ReceiveEmail = listEmail;
                delayPaymentEmailContent.Subject = "Request new supplier account";
                delayPaymentEmailContent.ContentEmail = s_body;

                await _sendMail.SendMailForDelayPayment(delayPaymentEmailContent);

            }

            //return "INF:" + Common.Commons.GetMessage("APP_INF001");
            //if (GET_DATA_LIST[0].STATUS == "0")
            //    return Common.Commons.GetMessage("APP_INF002");
            //else return "INF:" + GET_DATA_LIST[0].MESSAGES;

        }

        /// <summary>
        /// Generates a Random Password
        /// respecting the given strength requirements.
        /// </summary>
        /// <param name="opts">A valid PasswordOptions object
        /// containing the password strength requirements.</param>
        /// <returns>A random password</returns>
        private static string GenerateRandomPassword(PasswordOptions opts = null)
        {
            if (opts == null) opts = new PasswordOptions()
            {
                RequiredLength = 8,
                RequiredUniqueChars = 4,
                RequireDigit = true,
                RequireLowercase = true,
                RequireNonAlphanumeric = true,
                RequireUppercase = true
            };

            string[] randomChars = new[] {
        "ABCDEFGHJKLMNOPQRSTUVWXYZ",    // uppercase 
        "abcdefghijkmnopqrstuvwxyz",    // lowercase
        "0123456789",                   // digits
        "!@$?_-"                        // non-alphanumeric
    };
            CryptoRandom rand = new CryptoRandom();
            List<char> chars = new List<char>();

            if (opts.RequireUppercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[0][rand.Next(0, randomChars[0].Length)]);

            if (opts.RequireLowercase)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[1][rand.Next(0, randomChars[1].Length)]);

            if (opts.RequireDigit)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[2][rand.Next(0, randomChars[2].Length)]);

            if (opts.RequireNonAlphanumeric)
                chars.Insert(rand.Next(0, chars.Count),
                    randomChars[3][rand.Next(0, randomChars[3].Length)]);

            for (int i = chars.Count; i < opts.RequiredLength
                || chars.Distinct().Count() < opts.RequiredUniqueChars; i++)
            {
                string rcs = randomChars[rand.Next(0, randomChars.Length)];
                chars.Insert(rand.Next(0, chars.Count),
                    rcs[rand.Next(0, rcs.Length)]);
            }

            return new string(chars.ToArray());
        }

        private async Task sentEmailToUser(SupplierRequestInfoDto dto)
        {
            EmailTemplateOuputDto emailInfo = await _iCfgEmailTemplate.GetTemplateByCode("SUPPLY_CREATE_EMAIL");
            //MailContent content = new MailContent
            //{
            //    To = dto.RequestEmail,
            //    Subject = "Gửi yêu cầu tạo mới nhà cung cấp",
            //    Body = emailInfo.EmailTemplateContent.Replace("<person>", dto.RequestPerson).Replace("<link>", "<a>" + dto.RequestBaseUrl + dto.RequestUniqueId + "</a>"),
            //};
            //await _sendMailService.SendMail(content);

            DelayPaymentEmailContent delayPaymentEmailContent = new DelayPaymentEmailContent();
            StringBuilder body = new StringBuilder();
            body.Append(emailInfo.EmailTemplateContent);

            string s_body = body.ToString();

            var currentUser = await _userRepo.FirstOrDefaultAsync(e => e.Id == AbpSession.UserId);

            s_body = s_body.Replace("<person>", dto.RequestPerson);
            s_body = s_body.Replace("<picuser>", currentUser.Name);
            s_body = s_body.Replace("<link>",  dto.RequestBaseUrl + dto.RequestUniqueId );
            s_body = s_body.Replace("<deadline>",  dto.RequestExpiredDate.Value.ToString("dd/MM/yyyy"));
            //s_body = s_body.Replace("(Password_Login)", passWord);

            string[] listEmail = new string[] { dto.RequestEmail };

            delayPaymentEmailContent.ReceiveEmail = listEmail;
            delayPaymentEmailContent.Subject = "Request new supplier";
            delayPaymentEmailContent.ContentEmail = s_body;

            await _sendMail.SendMailForDelayPayment(delayPaymentEmailContent);

        }

        public async Task ResentEmailToUser(SupplierRequestInfoDto dto)
        {
            EmailTemplateOuputDto emailInfo = await _iCfgEmailTemplate.GetTemplateByCode("REQUEST_SUPPLIER_MORE_INFO");
            //MailContent content = new MailContent
            //{
            //    To = dto.RequestEmail,
            //    Subject = "Gửi yêu cầu tạo mới nhà cung cấp",
            //    Body = emailInfo.EmailTemplateContent.Replace("<person>", dto.RequestPerson).Replace("<link>", "<a>" + dto.RequestBaseUrl + dto.RequestUniqueId + "</a>"),
            //};
            //await _sendMailService.SendMail(content);

            DelayPaymentEmailContent delayPaymentEmailContent = new DelayPaymentEmailContent();
            StringBuilder body = new StringBuilder();
            body.Append(emailInfo.EmailTemplateContent);

            string s_body = body.ToString();

            var currentUser = await _userRepo.FirstOrDefaultAsync(e => e.Id == AbpSession.UserId);

            s_body = s_body.Replace("<person>", dto.RequestPerson);
            s_body = s_body.Replace("<picuser>", currentUser.Name);
            s_body = s_body.Replace("<picnote>", dto.PicNote);
            s_body = s_body.Replace("<link>", dto.RequestBaseUrl + dto.RequestUniqueId);
            s_body = s_body.Replace("<deadline>", dto.RequestExpiredDate.Value.ToString("dd/MM/yyyy"));
            //s_body = s_body.Replace("(Password_Login)", passWord);

            string[] listEmail = new string[] { dto.RequestEmail };

            delayPaymentEmailContent.ReceiveEmail = listEmail;
            delayPaymentEmailContent.Subject = "Request edit supplier information";
            delayPaymentEmailContent.ContentEmail = s_body;

            await _sendMail.SendMailForDelayPayment(delayPaymentEmailContent);

        }

    }
}


