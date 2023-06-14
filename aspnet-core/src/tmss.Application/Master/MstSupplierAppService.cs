using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Abp.UI;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Roles;
using tmss.Authorization.Users;
using tmss.Master.Supplier;
using tmss.Master.Supplier.Dto;
using tmss.PaymentModule.Invoices.Dto;
using tmss.RequestApproval.Dto;
using tmss.SendMail;

namespace tmss.Master
{
    public class MstSupplierAppService : tmssAppServiceBase, IMstSupplierAppService
    {
        private readonly IRepository<MstSuppliers, long> _mstSuppliersRepository;
        private readonly IRepository<MstSupplierContacts, long> _mstSupplierContactsRepository;
        private readonly IRepository<MstSupplierSites, long> _mstSupplierSitesRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<MstTemplateEmail, long> _mstTemplateEmailRepository;
        private readonly IRepository<Role> _roleRepo;
        private readonly UserManager _userManager;
        private readonly IPasswordHasher<User> _passwordHasher;
        public readonly ISendEmail _sendEmail;
        private readonly ISendMailService _sendMailService;
        private readonly IRepository<MstSupplierBankAccount, long> _bankRepo;

        public MstSupplierAppService(IRepository<MstSuppliers, long> mstSuppliersRepository, IRepository<MstSupplierContacts, long> mstSupplierContactsRepository,
            IRepository<MstSupplierSites, long> mstSupplierSitesRepository, IRepository<User, long> userRepository,
            IRepository<MstTemplateEmail, long> mstTemplateEmailRepository,
            IRepository<Role> roleRepo,
            UserManager userManager,
            IPasswordHasher<User> passwordHasher, ISendEmail sendEmail, ISendMailService sendMailService, IRepository<MstSupplierBankAccount, long> bankRepo)
        {
            _mstSuppliersRepository = mstSuppliersRepository;
            _mstSupplierContactsRepository = mstSupplierContactsRepository;
            _mstSupplierSitesRepository = mstSupplierSitesRepository;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _mstTemplateEmailRepository = mstTemplateEmailRepository;
            _roleRepo = roleRepo;
            _userManager = userManager;
            _sendEmail = sendEmail;
            _sendMailService = sendMailService;
            _bankRepo = bankRepo;
        }

        //Get list supplier dropdown
        public async Task<List<SupplierDropdownDto>> GetListSupplierDropdown()
        {
            var list = from item in _mstSuppliersRepository.GetAll().AsNoTracking()
                       select new SupplierDropdownDto
                       {
                           Id = item.Id,
                           Name = item.SupplierName
                       };
            return list.ToList();
        }

        [AbpAuthorize(AppPermissions.SupplierList_Search)]
        public async Task<PagedResultDto<SupplierOutputSelectDto>> GetAllSupplier(SupplierInputSearchDto input)
        {
            var listsupplier = from supplier in _mstSuppliersRepository.GetAll().AsNoTracking()
                               where ((string.IsNullOrWhiteSpace(input.SupplierName) || supplier.SupplierName.Contains(input.SupplierName))
                               && (string.IsNullOrWhiteSpace(input.SupplierNumber) || supplier.SupplierNumber.Contains(input.SupplierNumber))
                               && (string.IsNullOrWhiteSpace(input.VatRegistrationNum) || supplier.VatRegistrationNum.Contains(input.VatRegistrationNum))
                               && (string.IsNullOrWhiteSpace(input.VatRegistrationInvoice) || supplier.VatRegistrationInvoice.Contains(input.VatRegistrationInvoice)))
                               select new SupplierOutputSelectDto
                               {
                                   Id = supplier.Id,
                                   SupplierName = supplier.SupplierName,
                                   VatRegistrationNum = supplier.VatRegistrationNum,
                                   VatRegistrationInvoice = supplier.VatRegistrationInvoice,
                                   TaxPayerId = supplier.TaxPayerId,
                                   RegistryId = supplier.RegistryId,
                                   StartDateActive = supplier.StartDateActive,
                                   EndDateActive = supplier.EndDateActive,
                                   SupplierNumber = supplier.SupplierNumber,
                                   AbbreviateName = supplier.AbbreviateName,
                               };

            var result = listsupplier.Skip(input.SkipCount).Take(input.MaxResultCount);

            return new PagedResultDto<SupplierOutputSelectDto>(
                       listsupplier.Count(),
                       result.ToList()
                      );
        }
        public async Task<PagedResultDto<SupplierOutputSelectDto>> GetAllSupplierForPayment(FilterInvoiceDto filter)
        {
            //var _list = _mstSuppliersRepository.GetAll().ToList();
            var listsupplier = from supplier in _mstSuppliersRepository.GetAll().AsNoTracking().Where(r => !string.IsNullOrWhiteSpace(filter.FilterInvoice) ? r.SupplierName.Contains(filter.FilterInvoice) : true)
                               
                               select new SupplierOutputSelectDto()
                               {
                                   Id = supplier.Id,
                                   SupplierName = supplier.SupplierName,
                                   VatRegistrationNum = supplier.VatRegistrationNum,
                                   TaxPayerId = supplier.TaxPayerId,
                                   RegistryId = supplier.RegistryId,
                                   StartDateActive = supplier.StartDateActive,
                                   EndDateActive = supplier.EndDateActive,
                                   AbbreviateName = supplier.AbbreviateName,
                               };

            var result = listsupplier;
            return new PagedResultDto<SupplierOutputSelectDto>(
                       listsupplier.Count(),
                       result.ToList()
                      );
        }

        //Load all Supplier site by supplier id
        [AbpAuthorize(AppPermissions.SupplierList_Search)]
        public async Task<PagedResultDto<SupplierSiteOutputSelectDto>> GetAllSupplierSiteBySupplierId(SupplierSiteInputSearchDto supplierSiteInputSearchDto)
        {
            //var _list = _mstSupplierSitesRepository.GetAll().ToList();
            var listSupplierSite = from site in _mstSupplierSitesRepository.GetAll().AsNoTracking()
                                   where site.SupplierId == supplierSiteInputSearchDto.SupplierId
                                   join bank in _bankRepo.GetAll().AsNoTracking() on site.SupplierId equals bank.SupplierId into bankJoined
                                   from bank in bankJoined.DefaultIfEmpty()
                                   select new SupplierSiteOutputSelectDto()
                                   {
                                       Id = site.Id,
                                       Country = site.Country,
                                       SupplierId = site.SupplierId,
                                       VendorSiteCode = site.VendorSiteCode,
                                       AddressLine1 = site.AddressLine1,
                                       AddressLine2 = site.AddressLine2,
                                       LegalBusinessName = site.LegalBusinessName,
                                       IsSiteDefault = site.IsSiteDefault,
                                       BankName = bank.BankName,
                                       BankAccountName = bank.BankAccountName,
                                       BankAccountNum = bank.BankAccountNum
                                   };
            var result = listSupplierSite.Skip(supplierSiteInputSearchDto.SkipCount).Take(supplierSiteInputSearchDto.MaxResultCount);
            return new PagedResultDto<SupplierSiteOutputSelectDto>(
                       listSupplierSite.Count(),
                       result.ToList()
                      );
        }

        //Load all supplier contact by supplier site id
        [AbpAuthorize(AppPermissions.SupplierList_Search)]
        public async Task<PagedResultDto<SupplierContacOutputSelectDto>> GetAllSupplierContactBySupplierSiteId(SupplierContactInputSearchDto supplierContactInputSearchDto)
        {
            var listSupplierContact = from contact in _mstSupplierContactsRepository.GetAll().AsNoTracking()
                                      where contact.SupplierSiteId == supplierContactInputSearchDto.SupplierSiteId
                                      select new SupplierContacOutputSelectDto()
                                      {
                                          Id = contact.Id,
                                          SupplierSiteId = contact.SupplierSiteId,
                                          FullName = contact.FirstName + " " + contact.MidName + " " + contact.LastName,
                                          UserName = contact.UserName,
                                          Password = contact.Password,
                                          Prefix = contact.Prefix,
                                          Title = contact.Title,
                                          AreaCode = contact.AreaCode,
                                          Phone = contact.Phone,
                                          InactiveDate = contact.InactiveDate,
                                          IsActive = contact.IsActive,
                                          EmailAddress = contact.EmailAddress
                                      };

            var result = listSupplierContact.Skip(supplierContactInputSearchDto.SkipCount).Take(supplierContactInputSearchDto.MaxResultCount);
            return new PagedResultDto<SupplierContacOutputSelectDto>(
                       listSupplierContact.Count(),
                       result.ToList()
                      );
        }

        public async Task DeleteContact(long id)
        {
            MstSupplierContacts mstSupplierContacts = await _mstSupplierContactsRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstSupplierContacts != null)
            {
                await _mstSupplierContactsRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, AppConsts.ValRecordsDelete);
            }
        }

        //Load by Id supplier contact
        public async Task<SupplierContactSaveDto> LoadById(long id)
        {
            var listSupplierContact = from contact in _mstSupplierContactsRepository.GetAll().AsNoTracking()
                                      where contact.Id == id
                                      select new SupplierContactSaveDto()
                                      {
                                          Id = contact.Id,
                                          SupplierSiteId = contact.SupplierSiteId.Value,
                                          FullName = contact.FirstName + " " + contact.MidName + " " + contact.LastName,
                                          FirstName = contact.FirstName,    
                                          LastName = contact.LastName,
                                          MidName = contact.MidName,
                                          UserName = contact.UserName,
                                          Password = contact.Password,
                                          Phone = contact.Phone,
                                          EmailAddress = contact.EmailAddress
                                      };

            return listSupplierContact.FirstOrDefault();
        }

        public async Task<string> GetSupplierName(long id)
        {
            string supplierName = "";
            var listSupplier = from site in _mstSupplierSitesRepository.GetAll().AsNoTracking()
                               join supplier in _mstSuppliersRepository.GetAll().AsNoTracking()
                               on site.SupplierId equals supplier.Id
                               where site.Id == id
                               select new
                               {
                                   Id = supplier.Id,
                                   SupplierName = supplier.SupplierName
                               };
            if (listSupplier != null)
            {
                supplierName = listSupplier.FirstOrDefault().SupplierName;
            }
            return supplierName;
        }

        [AbpAuthorize(AppPermissions.SupplierList_Add, AppPermissions.SupplierList_Edit)]
        public async Task Save(SupplierContactSaveDto supplierContactSaveDto)
        {
            //var userNameLength = supplierContactSaveDto.UserName.Length;
            if (supplierContactSaveDto.Id > 0)
            {
                await Edit(supplierContactSaveDto);
            }
            else
            {
                await Create(supplierContactSaveDto);
            }
        }

        [AbpAuthorize(AppPermissions.SupplierList_Add)]
        private async Task Create(SupplierContactSaveDto supplierContactSaveDto)
        {
            MstSupplierContacts mstSupplierContacts = new MstSupplierContacts();
            User user = new User();
            mstSupplierContacts.SupplierSiteId = supplierContactSaveDto.SupplierSiteId;
            mstSupplierContacts.FirstName = supplierContactSaveDto.FirstName;
            mstSupplierContacts.MidName = supplierContactSaveDto.MidName;
            mstSupplierContacts.LastName = supplierContactSaveDto.LastName;
            mstSupplierContacts.EmailAddress = supplierContactSaveDto.EmailAddress;
            mstSupplierContacts.UserName = supplierContactSaveDto.UserName;
           // mstSupplierContacts.UserName = supplierContactSaveDto.UserName != null ? supplierContactSaveDto.SupplierNumber + "_" + supplierContactSaveDto.UserName : supplierContactSaveDto.UserName;
            mstSupplierContacts.Password = supplierContactSaveDto.Password != null ? "********" : mstSupplierContacts.Password;
            mstSupplierContacts.Phone = supplierContactSaveDto.Phone;
            mstSupplierContacts.SupplierId = supplierContactSaveDto.SupplierId;
            mstSupplierContacts.CreationTime = DateTime.Now;
            mstSupplierContacts.CreatorUserId = AbpSession.UserId;
            await _mstSupplierContactsRepository.InsertAsync(mstSupplierContacts);
            await CurrentUnitOfWork.SaveChangesAsync();

            if(mstSupplierContacts.UserName != null && mstSupplierContacts.Password != null)
            {
                user.AccessFailedCount = 0;
                user.CreationTime = DateTime.Now;
                user.Name = mstSupplierContacts.FirstName + " " + mstSupplierContacts.MidName + " " + mstSupplierContacts.LastName;
                user.Surname = mstSupplierContacts.FirstName;
                user.UserName = mstSupplierContacts.UserName;
                user.EmailAddress = mstSupplierContacts.EmailAddress;
                user.Password = _passwordHasher.HashPassword(user, supplierContactSaveDto.Password);
                user.PhoneNumber = mstSupplierContacts.Phone;
                user.NormalizedEmailAddress = mstSupplierContacts.EmailAddress;
                user.NormalizedUserName = mstSupplierContacts.UserName;
                user.SupplierContactId = mstSupplierContacts.Id;
                await _userRepository.InsertAsync(user);
                await CurrentUnitOfWork.SaveChangesAsync();

                var roleData = await _roleRepo.FirstOrDefaultAsync(e => e.DisplayName.ToLower() == "supplier" || e.Name.ToLower() == "supplier");
                if (roleData == null) throw new UserFriendlyException("Không thể phân quyền supplier do không tìm thấy quyền trong hệ thống");
                await _userManager.AddToRoleAsync(user, roleData.Name);

                //Send email to supplier contact create account
                var teamplateEmailCreate = await _mstTemplateEmailRepository.FirstOrDefaultAsync(p => p.Title.Equals(AppConsts.SEND_EMAIL_TO_SUPPLIER_CONTACT_CREATE_ACCOUNT));
                if(teamplateEmailCreate != null)
                {
                    await SendEmailToSupplierContact(teamplateEmailCreate.BodyMessage, user.Name, user.UserName, supplierContactSaveDto.Password, user.EmailAddress);
                }
                else
                {
                    throw new Exception("The teamplate email not found!");
                }
            }
        }

        private async Task SendEmailToSupplierContact(string teamPlateEmail, string fullName, string userName, string passWord, string email)
        {
            DelayPaymentEmailContent delayPaymentEmailContent = new DelayPaymentEmailContent();
            StringBuilder body = new StringBuilder();
            body.Append(teamPlateEmail);

            string s_body = body.ToString();

            s_body = s_body.Replace("(Contact_FullName)", fullName);
            s_body = s_body.Replace("(UserName_Login)", userName);
            s_body = s_body.Replace("(Password_Login)", passWord);

            string[] listEmail = new string[] { email };

            delayPaymentEmailContent.ReceiveEmail = listEmail;
            delayPaymentEmailContent.Subject = AppConsts.ACCOUNT_INFORMATION;
            delayPaymentEmailContent.ContentEmail = s_body;

            await _sendEmail.SendMailForDelayPayment(delayPaymentEmailContent);

            //MailContent content = new MailContent
            //{
            //    To = email,
            //    Subject = "SEND_EMAIL_TO_SUPPLIER_CONTACT_CREATE_ACCOUNT",
            //    Body = s_body,
            //};
            //await _sendMailService.SendMail(content);
        }

        [AbpAuthorize(AppPermissions.SupplierList_Edit)]
        private async Task Edit(SupplierContactSaveDto supplierContactSaveDto)
        {
            //MstSupplierContacts mstSupplierContacts = await _mstSupplierContactsRepository.FirstOrDefaultAsync(supplierContactSaveDto.Id);
            MstSupplierContacts mstSupplierContacts = _mstSupplierContactsRepository.GetAll().Where(p=>p.Id == supplierContactSaveDto.Id).FirstOrDefault();
            
            if(mstSupplierContacts != null)
            {
                mstSupplierContacts.FirstName = supplierContactSaveDto.FirstName != null ? supplierContactSaveDto.FirstName : mstSupplierContacts.FirstName;
                mstSupplierContacts.MidName = supplierContactSaveDto.MidName != null ? supplierContactSaveDto.MidName : mstSupplierContacts.MidName;
                mstSupplierContacts.LastName = supplierContactSaveDto.LastName != null ? supplierContactSaveDto.LastName : mstSupplierContacts.LastName;
                mstSupplierContacts.Phone = supplierContactSaveDto.Phone != null ? supplierContactSaveDto.Phone : mstSupplierContacts.Phone;
                mstSupplierContacts.EmailAddress = supplierContactSaveDto.EmailAddress != null ? supplierContactSaveDto.EmailAddress : mstSupplierContacts.EmailAddress;

                //Create account for supplier contact
                if (mstSupplierContacts.Password == null && mstSupplierContacts.UserName == null
                    && supplierContactSaveDto.UserName != null && supplierContactSaveDto.Password != null)
                {
                    User user = new User();
                    user.AccessFailedCount = 0;
                    user.CreationTime = DateTime.Now;
                    user.CreatorUserId = AbpSession.UserId;
                    user.Name = mstSupplierContacts.FirstName + " " + mstSupplierContacts.MidName + " " + mstSupplierContacts.LastName;
                    user.Surname = mstSupplierContacts.FirstName;
                    user.UserName = supplierContactSaveDto.SupplierNumber + "_" + supplierContactSaveDto.UserName;
                    user.EmailAddress = supplierContactSaveDto.EmailAddress;
                    user.Password = _passwordHasher.HashPassword(user, supplierContactSaveDto.Password);
                    user.NormalizedEmailAddress = mstSupplierContacts.EmailAddress;
                    user.NormalizedUserName = supplierContactSaveDto.UserName;
                    user.SupplierContactId = mstSupplierContacts.Id;
                    await _userRepository.InsertAsync(user);

                    //Send email to supplier contact create account
                    var teamplateEmailCreate = await _mstTemplateEmailRepository.FirstOrDefaultAsync(p => p.Title.Equals(AppConsts.SEND_EMAIL_TO_SUPPLIER_CONTACT_CREATE_ACCOUNT));
                    if (teamplateEmailCreate != null)
                    {
                        await SendEmailToSupplierContact(teamplateEmailCreate.BodyMessage, user.Name, user.UserName, supplierContactSaveDto.Password, user.EmailAddress);
                    }
                    else
                    {
                        throw new Exception("The teamplate email not found!");
                    }
                }

                //reset password for supplier contact
                if (mstSupplierContacts.Password != null && mstSupplierContacts.UserName != null
                     && supplierContactSaveDto.Password != null && supplierContactSaveDto.RePassword != null)
                {
                    User user = await _userRepository.FirstOrDefaultAsync(p=> p.SupplierContactId == mstSupplierContacts.Id);
                    user.LastModificationTime = DateTime.Now;
                    user.LastModifierUserId = AbpSession.UserId;
                    user.Password = _passwordHasher.HashPassword(user, supplierContactSaveDto.Password);
                    await _userRepository.UpdateAsync(user);

                    //Send email to supplier contact reset passwd
                    var teamplateEmailCreate = await _mstTemplateEmailRepository.FirstOrDefaultAsync(p => p.Title.Equals(AppConsts.SEND_EMAIL_TO_SUPPLIER_CONTACT_RESET_PASSWORD));
                    if (teamplateEmailCreate != null)
                    {
                        await SendEmailToSupplierContact(teamplateEmailCreate.BodyMessage, user.Name, user.UserName, supplierContactSaveDto.Password, user.EmailAddress);
                    }
                    else
                    {
                        throw new Exception("The teamplate email not found!");
                    }
                }

                mstSupplierContacts.Password = supplierContactSaveDto.Password != null ? "********" : mstSupplierContacts.Password;
                if(mstSupplierContacts.UserName == null)
                {
                    mstSupplierContacts.UserName = supplierContactSaveDto.UserName != null ? supplierContactSaveDto.SupplierNumber + "_" + supplierContactSaveDto.UserName : supplierContactSaveDto.UserName;
                }
                
                mstSupplierContacts.LastModificationTime = DateTime.Now;
                mstSupplierContacts.LastModifierUserId = AbpSession.GetUserId();
                await _mstSupplierContactsRepository.UpdateAsync(mstSupplierContacts);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
            else
            {
                throw new Exception("Supplier contact not found!");
            }
            
        }

        public async Task<List<SupplierOutputSelectDto>> GetAllSupplierNotPaged(SupplierInputSearchNotPagedDto supplierInputSearchNotPagedDto)
        {
            //var _list = _mstSuppliersRepository.GetAll().ToList();
            var listsupplier = from supplier in _mstSuppliersRepository.GetAll().AsNoTracking()
                               where ((string.IsNullOrWhiteSpace(supplierInputSearchNotPagedDto.SupplierName) || supplier.SupplierName.Contains(supplierInputSearchNotPagedDto.SupplierName)))
                               select new SupplierOutputSelectDto()
                               {
                                   Id = supplier.Id,
                                   SupplierName = supplier.SupplierName,
                                   VatRegistrationNum = supplier.VatRegistrationNum,
                                   TaxPayerId = supplier.TaxPayerId,
                                   RegistryId = supplier.RegistryId,
                                   StartDateActive = supplier.StartDateActive,
                                   EndDateActive = supplier.EndDateActive,
                               };

            return listsupplier.ToList();

        }

        public async Task<List<SupplierSiteOutputSelectDto>> GetAllSupplierSiteBySupplierIdNotPaged(SupplierSiteInputSearchNotPagedDto supplierSiteInputSearchNotPagedDto)
        {
            var listSupplierSite = from site in _mstSupplierSitesRepository.GetAll().AsNoTracking()
                                   where site.SupplierId == supplierSiteInputSearchNotPagedDto.SupplierId
                                   && (string.IsNullOrWhiteSpace(supplierSiteInputSearchNotPagedDto.SiteName) || site.VendorSiteCode.Contains(supplierSiteInputSearchNotPagedDto.SiteName))
                                   select new SupplierSiteOutputSelectDto()
                                   {
                                       Id = site.Id,
                                       Country = site.Country,
                                       SupplierId = site.SupplierId,
                                       VendorSiteCode = site.VendorSiteCode,
                                       AddressLine1 = site.AddressLine1,
                                       AddressLine2 = site.AddressLine2,
                                       LegalBusinessName = site.LegalBusinessName,
                                   };
            return listSupplierSite.ToList();
        }

        //Supplier
        [AbpAuthorize(AppPermissions.SupplierList_Add, AppPermissions.SupplierList_Edit)]
        public async Task<ValSupplierSaveDto> SaveSupplier(SupplierSaveDto supplierSaveDto)
        {
            ValSupplierSaveDto result = new ValSupplierSaveDto();

            if (supplierSaveDto.Id == 0)
            {
                //Check duplicate for create
                var supplier1 = await _mstSuppliersRepository.FirstOrDefaultAsync(e => e.SupplierName.Equals(supplierSaveDto.SupplierName));
                result.Name = supplier1 != null ? AppConsts.DUPLICATE_NAME : null;

                var supplier2 = await _mstSuppliersRepository.FirstOrDefaultAsync(e => e.VatRegistrationNum.Equals(supplierSaveDto.VatRegistrationNum));
                result.Code = supplier2 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Name != null || result.Code != null)
                {
                    return result;
                }
                else
                {
                    await CreateSupplier(supplierSaveDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var supplier1 = await _mstSuppliersRepository.FirstOrDefaultAsync(e => e.SupplierName.Equals(supplierSaveDto.SupplierName) && e.Id != supplierSaveDto.Id);
                result.Name = supplier1 != null ? AppConsts.DUPLICATE_NAME : null;

                var supplier2 = await _mstSuppliersRepository.FirstOrDefaultAsync(e => e.VatRegistrationNum.Equals(supplierSaveDto.VatRegistrationNum) && e.Id != supplierSaveDto.Id);
                result.Code = supplier2 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Name != null || result.Code != null)
                {
                    return result;
                }
                else
                {
                    await UpdateSupplier(supplierSaveDto);
                }
            }
            return result;
        }

        private async Task CreateSupplier(SupplierSaveDto supplierSaveDto)
        {
            var lastSupplier = _mstSuppliersRepository.GetAll().OrderByDescending(p => p.Id).FirstOrDefault(); 
            MstSuppliers mstSuppliers = new MstSuppliers();
            mstSuppliers.SupplierName = supplierSaveDto.SupplierName;
            mstSuppliers.SupplierNumber = (lastSupplier.Id + 1).ToString();
            mstSuppliers.VatRegistrationNum = supplierSaveDto.VatRegistrationNum;
            mstSuppliers.VatRegistrationInvoice = supplierSaveDto.VatRegistrationInvoice;
            mstSuppliers.TaxPayerId = supplierSaveDto.TaxPayerId;
            mstSuppliers.StartDateActive = supplierSaveDto.StartDateActive;
            mstSuppliers.EndDateActive = supplierSaveDto.EndDateActive;
            mstSuppliers.IsFormOrc = false;
            mstSuppliers.AbbreviateName = supplierSaveDto.AbbreviateName;
            mstSuppliers.CreationTime = DateTime.Now;
            mstSuppliers.CreatorUserId = AbpSession.GetUserId();
            await _mstSuppliersRepository.InsertAsync(mstSuppliers);
        }

        private async Task UpdateSupplier(SupplierSaveDto supplierSaveDto)
        {
            MstSuppliers mstSuppliers = await _mstSuppliersRepository.FirstOrDefaultAsync(p => p.Id == supplierSaveDto.Id);
            mstSuppliers.SupplierName = supplierSaveDto.SupplierName;
            mstSuppliers.VatRegistrationNum = supplierSaveDto.VatRegistrationNum;
            mstSuppliers.TaxPayerId = supplierSaveDto.TaxPayerId;
            mstSuppliers.StartDateActive = supplierSaveDto.StartDateActive;
            mstSuppliers.EndDateActive = supplierSaveDto.EndDateActive;
            mstSuppliers.VatRegistrationInvoice = supplierSaveDto.VatRegistrationInvoice;
            mstSuppliers.AbbreviateName = supplierSaveDto.AbbreviateName;
            mstSuppliers.LastModificationTime = DateTime.Now;
            mstSuppliers.LastModifierUserId = AbpSession.GetUserId();
            await _mstSuppliersRepository.UpdateAsync(mstSuppliers);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [AbpAuthorize(AppPermissions.SupplierList_Delete)]
        public async Task DeleteSupplier(long id)
        {
            MstSuppliers mstSupplier = await _mstSuppliersRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstSupplier != null)
            {
                List<MstSupplierSites> listMstSupplierSite = _mstSupplierSitesRepository.GetAll().Where(p => p.SupplierId == mstSupplier.Id).ToList();
                foreach (var supplierSite in listMstSupplierSite)
                {
                    await DeleteSite(supplierSite.Id);
                }
                await _mstSuppliersRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, AppConsts.ValRecordsDelete);
            }
        }

        public async Task<SupplierSaveDto> LoadSupplierById(long id)
        {
            var listSupplier = from supplier in _mstSuppliersRepository.GetAll().AsNoTracking()
                                    where supplier.Id == id
                                    select new SupplierSaveDto()
                                    {
                                        Id = supplier.Id,
                                        SupplierNumber = supplier.SupplierNumber,
                                        SupplierName = supplier.SupplierName,
                                        VatRegistrationNum = supplier.VatRegistrationNum,
                                        TaxPayerId = supplier.TaxPayerId,
                                        StartDateActive = supplier.StartDateActive,
                                        EndDateActive = supplier.EndDateActive,
                                        AbbreviateName = supplier.AbbreviateName,
                                        VatRegistrationInvoice = supplier.VatRegistrationInvoice
                                    };
            return listSupplier.FirstOrDefault();
        }


        //Supplier site
        [AbpAuthorize(AppPermissions.SupplierList_Add, AppPermissions.SupplierList_Edit)]
        public async Task SaveSite(SupplierSiteSaveDto supplierSiteSaveDto)
        {
            if (supplierSiteSaveDto.Id == 0)
            {
                await CreateSupplierSite(supplierSiteSaveDto);
            }
            else
            {
                await UpdateSupplierSite(supplierSiteSaveDto);
            }
        }

        private async Task CreateSupplierSite(SupplierSiteSaveDto supplierSiteSaveDto)
        {
            MstSupplierSites mstSupplierSites = new MstSupplierSites();
            mstSupplierSites.Country = supplierSiteSaveDto.Country;
            mstSupplierSites.SupplierId = supplierSiteSaveDto.SupplierId;
            mstSupplierSites.AddressLine1 = supplierSiteSaveDto.AddressLine1;
            mstSupplierSites.LegalBusinessName = supplierSiteSaveDto.LegalBusinessName;
            mstSupplierSites.IsSiteDefault = supplierSiteSaveDto.IsSiteDefault;

            mstSupplierSites.CreationTime = DateTime.Now;
            mstSupplierSites.CreatorUserId = AbpSession.UserId;
            await _mstSupplierSitesRepository.InsertAsync(mstSupplierSites);
        }

        private async Task UpdateSupplierSite(SupplierSiteSaveDto supplierSiteSaveDto)
        {
            MstSupplierSites mstSupplierSites = await _mstSupplierSitesRepository.FirstOrDefaultAsync(p => p.Id == supplierSiteSaveDto.Id);
            mstSupplierSites.Country = supplierSiteSaveDto.Country;
            mstSupplierSites.SupplierId = supplierSiteSaveDto.SupplierId;
            mstSupplierSites.AddressLine1 = supplierSiteSaveDto.AddressLine1;
            mstSupplierSites.LegalBusinessName = supplierSiteSaveDto.LegalBusinessName;
            mstSupplierSites.IsSiteDefault = supplierSiteSaveDto.IsSiteDefault;

            mstSupplierSites.LastModificationTime = DateTime.Now;
            mstSupplierSites.LastModifierUserId = AbpSession.UserId;
            await _mstSupplierSitesRepository.UpdateAsync(mstSupplierSites);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        //Van de tai khoan
        [AbpAuthorize(AppPermissions.SupplierList_Delete)]
        public async Task DeleteSite(long id)
        {
            MstSupplierSites mstSupplierSite = await _mstSupplierSitesRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstSupplierSite != null)
            {
                List<MstSupplierContacts> listMstSupplierContacts = _mstSupplierContactsRepository.GetAll().Where(p => p.SupplierSiteId == mstSupplierSite.Id).ToList();
                foreach (var contact in listMstSupplierContacts)
                {
                    await _mstSupplierContactsRepository.DeleteAsync(contact.Id);
                }
                await _mstSupplierSitesRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, AppConsts.ValRecordsDelete);
            }
        }

        public async Task<SupplierSiteSaveDto> LoadSiteById(long id)
        {
            var listSupplierSite = from supplierSite in _mstSupplierSitesRepository.GetAll().AsNoTracking()
                               where supplierSite.Id == id
                               select new SupplierSiteSaveDto()
                               {
                                   Id = supplierSite.Id,
                                   Country = supplierSite.Country,
                                   SupplierId = supplierSite.SupplierId,
                                   AddressLine1 = supplierSite.AddressLine1,
                                   LegalBusinessName = supplierSite.LegalBusinessName,
                                   IsSiteDefault = supplierSite.IsSiteDefault
                               };
            return listSupplierSite.FirstOrDefault();
        }
    }
}


