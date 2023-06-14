using Abp.Zero.Ldap.Authentication;
using Abp.Zero.Ldap.Configuration;
using System.Reflection.PortableExecutable;
using System.Threading.Tasks;
using System;
using tmss.Authorization.Users;
using tmss.MultiTenancy;
using Abp.Configuration;
using System.DirectoryServices;
using System.DirectoryServices.AccountManagement;

namespace tmss.Authorization.Ldap
{
    public class AppLdapAuthenticationSource : LdapAuthenticationSource<Tenant, User>
    {
        private readonly ILdapSettings _settings;
        public ISettingManager _settingManager;
        private readonly IAbpZeroLdapModuleConfig _ldapModuleConfig;
        public AppLdapAuthenticationSource(ILdapSettings settings, IAbpZeroLdapModuleConfig ldapModuleConfig, ISettingManager settingManager)
            : base(settings, ldapModuleConfig)
        {
            _settings = settings;
            _settingManager = settingManager;
            _ldapModuleConfig = ldapModuleConfig;
        }

        public override async Task<bool> TryAuthenticateAsync(string userNameOrEmailAddress, string plainPassword,
    Tenant tenant)
        {
            if (!_ldapModuleConfig.IsEnabled || !(await _settings.GetIsEnabled(tenant?.Id)))
            {
                return false;
            }

            await _settingManager.ChangeSettingForTenantAsync(tenant.Id, LdapSettingNames.UserName, "esign_ldap");
            await _settingManager.ChangeSettingForTenantAsync(tenant.Id, LdapSettingNames.Password, "Apo7_HnR");

            using (var principalContext = await CreatePrincipalContext(tenant, userNameOrEmailAddress))
            {
                return await validateAccountLdap(tenant, userNameOrEmailAddress, plainPassword);
                //return principalContext.ValidateCredentials(userNameOrEmailAddress, plainPassword, ContextOptions.Negotiate | ContextOptions.Signing | ContextOptions.Sealing);
            }
        }

        private async Task<bool> validateAccountLdap(Tenant tenant, string userNameOrEmailAddress, string plainPassword)
        {
            try
            {
                if (!string.IsNullOrEmpty(userNameOrEmailAddress))
                {
                    userNameOrEmailAddress = userNameOrEmailAddress.Split("@")[0];
                }

                var entry = new System.DirectoryServices.DirectoryEntry("LDAP://192.168.2.1", userNameOrEmailAddress, plainPassword);
                var searcher = new DirectorySearcher(entry);
                searcher.Filter = string.Format("(&(objectCategory=person)(sAMAccountName={0}))", userNameOrEmailAddress);
                SearchResultCollection results = searcher.FindAll();
                if (results != null)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}