using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Localization;
using Abp.MultiTenancy;

namespace tmss.Authorization
{
    /// <summary>
    /// Application's authorization provider.
    /// Defines permissions for the application.
    /// See <see cref="AppPermissions"/> for all permission names.
    /// </summary>
    public class AppAuthorizationProvider : AuthorizationProvider
    {
        private readonly bool _isMultiTenancyEnabled;

        public AppAuthorizationProvider(bool isMultiTenancyEnabled)
        {
            _isMultiTenancyEnabled = isMultiTenancyEnabled;
        }

        public AppAuthorizationProvider(IMultiTenancyConfig multiTenancyConfig)
        {
            _isMultiTenancyEnabled = multiTenancyConfig.IsEnabled;
        }

        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            //COMMON PERMISSIONS (FOR BOTH OF TENANTS AND HOST)

            var pages = context.GetPermissionOrNull(AppPermissions.Pages) ?? context.CreatePermission(AppPermissions.Pages, L("Pages"));
            pages.CreateChildPermission(AppPermissions.Pages_DemoUiComponents, L("DemoUiComponents"));

            var administration = pages.CreateChildPermission(AppPermissions.Pages_Administration, L("Administration"));

            var roles = administration.CreateChildPermission(AppPermissions.Pages_Administration_Roles, L("Roles"));
            roles.CreateChildPermission(AppPermissions.Pages_Administration_Roles_Create, L("CreatingNewRole"));
            roles.CreateChildPermission(AppPermissions.Pages_Administration_Roles_Edit, L("EditingRole"));
            roles.CreateChildPermission(AppPermissions.Pages_Administration_Roles_Delete, L("DeletingRole"));

            var users = administration.CreateChildPermission(AppPermissions.Pages_Administration_Users, L("Users"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Create, L("CreatingNewUser"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Edit, L("EditingUser"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Delete, L("DeletingUser"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_ChangePermissions, L("ChangingPermissions"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Impersonation, L("LoginForUsers"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Unlock, L("Unlock"));

            var languages = administration.CreateChildPermission(AppPermissions.Pages_Administration_Languages, L("Languages"));
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_Create, L("CreatingNewLanguage"), multiTenancySides: _isMultiTenancyEnabled ? MultiTenancySides.Host : MultiTenancySides.Tenant);
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_Edit, L("EditingLanguage"), multiTenancySides: _isMultiTenancyEnabled ? MultiTenancySides.Host : MultiTenancySides.Tenant);
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_Delete, L("DeletingLanguages"), multiTenancySides: _isMultiTenancyEnabled ? MultiTenancySides.Host : MultiTenancySides.Tenant);
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_ChangeTexts, L("ChangingTexts"));

            administration.CreateChildPermission(AppPermissions.Pages_Administration_AuditLogs, L("AuditLogs"));

            var organizationUnits = administration.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits, L("OrganizationUnits"));
            organizationUnits.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits_ManageOrganizationTree, L("ManagingOrganizationTree"));
            organizationUnits.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits_ManageMembers, L("ManagingMembers"));
            organizationUnits.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits_ManageRoles, L("ManagingRoles"));

            administration.CreateChildPermission(AppPermissions.Pages_Administration_UiCustomization, L("VisualSettings"));

            var webhooks = administration.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription, L("Webhooks"));
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_Create, L("CreatingWebhooks"));
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_Edit, L("EditingWebhooks"));
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_ChangeActivity, L("ChangingWebhookActivity"));
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_Detail, L("DetailingSubscription"));
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_Webhook_ListSendAttempts, L("ListingSendAttempts"));
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_Webhook_ResendWebhook, L("ResendingWebhook"));

            var dynamicProperties = administration.CreateChildPermission(AppPermissions.Pages_Administration_DynamicProperties, L("DynamicProperties"));
            dynamicProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicProperties_Create, L("CreatingDynamicProperties"));
            dynamicProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicProperties_Edit, L("EditingDynamicProperties"));
            dynamicProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicProperties_Delete, L("DeletingDynamicProperties"));

            var dynamicPropertyValues = dynamicProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicPropertyValue, L("DynamicPropertyValue"));
            dynamicPropertyValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicPropertyValue_Create, L("CreatingDynamicPropertyValue"));
            dynamicPropertyValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicPropertyValue_Edit, L("EditingDynamicPropertyValue"));
            dynamicPropertyValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicPropertyValue_Delete, L("DeletingDynamicPropertyValue"));

            var dynamicEntityProperties = dynamicProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityProperties, L("DynamicEntityProperties"));
            dynamicEntityProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityProperties_Create, L("CreatingDynamicEntityProperties"));
            dynamicEntityProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityProperties_Edit, L("EditingDynamicEntityProperties"));
            dynamicEntityProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityProperties_Delete, L("DeletingDynamicEntityProperties"));

            var dynamicEntityPropertyValues = dynamicProperties.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityPropertyValue, L("EntityDynamicPropertyValue"));
            dynamicEntityPropertyValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityPropertyValue_Create, L("CreatingDynamicEntityPropertyValue"));
            dynamicEntityPropertyValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityPropertyValue_Edit, L("EditingDynamicEntityPropertyValue"));
            dynamicEntityPropertyValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicEntityPropertyValue_Delete, L("DeletingDynamicEntityPropertyValue"));

            //TENANT-SPECIFIC PERMISSIONS

            pages.CreateChildPermission(AppPermissions.Pages_Tenant_Dashboard, L("Dashboard"), multiTenancySides: MultiTenancySides.Tenant);

            administration.CreateChildPermission(AppPermissions.Pages_Administration_Tenant_Settings, L("Settings"), multiTenancySides: MultiTenancySides.Tenant);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_Tenant_SubscriptionManagement, L("Subscription"), multiTenancySides: MultiTenancySides.Tenant);

            //HOST-SPECIFIC PERMISSIONS

            var editions = pages.CreateChildPermission(AppPermissions.Pages_Editions, L("Editions"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_Create, L("CreatingNewEdition"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_Edit, L("EditingEdition"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_Delete, L("DeletingEdition"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_MoveTenantsToAnotherEdition, L("MoveTenantsToAnotherEdition"), multiTenancySides: MultiTenancySides.Host);

            var tenants = pages.CreateChildPermission(AppPermissions.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Create, L("CreatingNewTenant"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Edit, L("EditingTenant"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_ChangeFeatures, L("ChangingFeatures"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Delete, L("DeletingTenant"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Impersonation, L("LoginForTenants"), multiTenancySides: MultiTenancySides.Host);

            administration.CreateChildPermission(AppPermissions.Pages_Administration_Host_Settings, L("Settings"), multiTenancySides: MultiTenancySides.Host);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_Host_Maintenance, L("Maintenance"), multiTenancySides: _isMultiTenancyEnabled ? MultiTenancySides.Host : MultiTenancySides.Tenant);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_HangfireDashboard, L("HangfireDashboard"), multiTenancySides: _isMultiTenancyEnabled ? MultiTenancySides.Host : MultiTenancySides.Tenant);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_Host_Dashboard, L("Dashboard"), multiTenancySides: MultiTenancySides.Host);

            /* Custom Application Permission */
            #region -- Custom Application Permission

            #region -- User Request
            var userRequest = context.GetPermissionOrNull(AppPermissions.UserRequest) ?? context.CreatePermission(AppPermissions.UserRequest, L("UserRequest"));
            /* Buy From Catalog */
            var UserRequest_BuyRequestFromCatalog = userRequest.CreateChildPermission(AppPermissions.UserRequest_BuyRequestFromCatalog, L("BuyRequestFromCatalog"));
            UserRequest_BuyRequestFromCatalog.CreateChildPermission(AppPermissions.UserRequest_BuyRequestFromCatalog_Create, L("CreateUserRequest"));


            /* User Request Management */
            var ManageUserRequest = userRequest.CreateChildPermission(AppPermissions.UserRequest_ManageUserRequest, L("ManageUserRequest"));
            ManageUserRequest.CreateChildPermission(AppPermissions.UserRequest_ManageUserRequest_CreateOrEdit, L("CreateUserRequest"));
            ManageUserRequest.CreateChildPermission(AppPermissions.UserRequest_ManageUserRequest_Delete, L("Delete"));
            ManageUserRequest.CreateChildPermission(AppPermissions.UserRequest_ManageUserRequest_Import, L("ImportExcel"));
            ManageUserRequest.CreateChildPermission(AppPermissions.UserRequest_ManageUserRequest_Export, L("ExportExcel"));
            ManageUserRequest.CreateChildPermission(AppPermissions.UserRequest_ManageUserRequest_SendRequest, L("SendRequest"));
            #endregion

            #region -- Purchase Request
            var purchaseRequest = context.GetPermissionOrNull(AppPermissions.PurchaseRequest) ?? context.CreatePermission(AppPermissions.PurchaseRequest, L("PurchaseRequest"));
            var PurchaseRequestManagement = purchaseRequest.CreateChildPermission(AppPermissions.PurchaseRequest_PurchaseRequestManagement, L("PurchaseRequestManagement"));
            PurchaseRequestManagement.CreateChildPermission(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Search, L("Search"));
            PurchaseRequestManagement.CreateChildPermission(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Add, L("Add"));
            PurchaseRequestManagement.CreateChildPermission(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Delete, L("Delete"));
            PurchaseRequestManagement.CreateChildPermission(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Import, L("ImportExcel"));
            PurchaseRequestManagement.CreateChildPermission(AppPermissions.PurchaseRequest_PurchaseRequestManagement_Export, L("ExportExcel"));
            PurchaseRequestManagement.CreateChildPermission(AppPermissions.PurchaseRequest_PurchaseRequestManagement_SendRequest, L("SendRequest"));

            var CreateOrEditPurchaseRequest = purchaseRequest.CreateChildPermission(AppPermissions.PurchaseRequest_CreatePurchaseRequest, L("CreateOrEditPurchaseRequest"));
            CreateOrEditPurchaseRequest.CreateChildPermission(AppPermissions.PurchaseRequest_CreatePurchaseRequest_Search, L("Search"));
            CreateOrEditPurchaseRequest.CreateChildPermission(AppPermissions.PurchaseRequest_CreatePurchaseRequest_Add, L("Add"));

            var AutoCreatePurchaseOrders = purchaseRequest.CreateChildPermission(AppPermissions.PurchaseOrders_AutoCreatePurchaseOrders, L("AutoCreatePurchaseOrders"));
            AutoCreatePurchaseOrders.CreateChildPermission(AppPermissions.PurchaseOrders_AutoCreatePurchaseOrders_Search, L("Search"));
            AutoCreatePurchaseOrders.CreateChildPermission(AppPermissions.PurchaseOrders_AutoCreatePurchaseOrders_Add, L("Add"));
            #endregion

            var ConfigureSystem = context.GetPermissionOrNull(AppPermissions.ConfigureSystem) ?? context.CreatePermission(AppPermissions.ConfigureSystem, L("ConfigureSystem"));
            var ApprovalTree = ConfigureSystem.CreateChildPermission(AppPermissions.ApprovalTree, L("ApprovalTree"));
            ApprovalTree.CreateChildPermission(AppPermissions.ApprovalTree_Search, L("Search"));
            ApprovalTree.CreateChildPermission(AppPermissions.ApprovalTree_Add, L("Add"));
            ApprovalTree.CreateChildPermission(AppPermissions.ApprovalTree_Edit, L("Edit"));
            ApprovalTree.CreateChildPermission(AppPermissions.ApprovalTree_Delete, L("Delete"));

            var ListOfDocument = ConfigureSystem.CreateChildPermission(AppPermissions.ListOfDocument, L("ListOfDocument"));
            ListOfDocument.CreateChildPermission(AppPermissions.ListOfDocument_Search, L("Search"));
            ListOfDocument.CreateChildPermission(AppPermissions.ListOfDocument_Add, L("Add"));
            ListOfDocument.CreateChildPermission(AppPermissions.ListOfDocument_Edit, L("Edit"));
            ListOfDocument.CreateChildPermission(AppPermissions.ListOfDocument_Export, L("ExportExcel"));

            var InventoryCodeConfig = ConfigureSystem.CreateChildPermission(AppPermissions.InventoryCodeConfig, L("InventoryCodeConfig"));
            InventoryCodeConfig.CreateChildPermission(AppPermissions.InventoryCodeConfig_Search, L("Search"));
            InventoryCodeConfig.CreateChildPermission(AppPermissions.InventoryCodeConfig_Add, L("Add"));
            InventoryCodeConfig.CreateChildPermission(AppPermissions.InventoryCodeConfig_Edit, L("Edit"));
            InventoryCodeConfig.CreateChildPermission(AppPermissions.InventoryCodeConfig_Export, L("ExportExcel"));




            var MasterData = context.GetPermissionOrNull(AppPermissions.MasterData) ?? context.CreatePermission(AppPermissions.MasterData, L("MasterData"));
            var PurchasePurpose = MasterData.CreateChildPermission(AppPermissions.PurchasePurpose, L("PurchasePurpose"));
            PurchasePurpose.CreateChildPermission(AppPermissions.PurchasePurpose_Search, L("Search"));
            PurchasePurpose.CreateChildPermission(AppPermissions.PurchasePurpose_Add, L("Add"));
            PurchasePurpose.CreateChildPermission(AppPermissions.PurchasePurpose_Edit, L("Edit"));
            PurchasePurpose.CreateChildPermission(AppPermissions.PurchasePurpose_Delete, L("Delete"));
            PurchasePurpose.CreateChildPermission(AppPermissions.PurchasePurpose_Import, L("ImportExcel"));

            var CurrencyType = MasterData.CreateChildPermission(AppPermissions.CurrencyType, L("CurrencyType"));
            CurrencyType.CreateChildPermission(AppPermissions.CurrencyType_Search, L("Search"));
            CurrencyType.CreateChildPermission(AppPermissions.CurrencyType_Add, L("Add"));
            CurrencyType.CreateChildPermission(AppPermissions.CurrencyType_Edit, L("Edit"));
            CurrencyType.CreateChildPermission(AppPermissions.CurrencyType_Delete, L("Delete"));

            var UnitOfMeasure = MasterData.CreateChildPermission(AppPermissions.UnitOfMeasure, L("UnitOfMeasure"));
            UnitOfMeasure.CreateChildPermission(AppPermissions.UnitOfMeasure_Search, L("Search"));
            UnitOfMeasure.CreateChildPermission(AppPermissions.UnitOfMeasure_Add, L("Add"));
            UnitOfMeasure.CreateChildPermission(AppPermissions.UnitOfMeasure_Edit, L("Edit"));
            UnitOfMeasure.CreateChildPermission(AppPermissions.UnitOfMeasure_Delete, L("Delete"));
            UnitOfMeasure.CreateChildPermission(AppPermissions.UnitOfMeasure_Export, L("ExportExcel"));

            var CancelReason = MasterData.CreateChildPermission(AppPermissions.CancelReason, L("CancelReason"));
            CancelReason.CreateChildPermission(AppPermissions.CancelReason_Search, L("Search"));
            CancelReason.CreateChildPermission(AppPermissions.CancelReason_Add, L("Add"));
            CancelReason.CreateChildPermission(AppPermissions.CancelReason_Edit, L("Edit"));
            CancelReason.CreateChildPermission(AppPermissions.CancelReason_Delete, L("Delete"));

            var MasterCatalog = MasterData.CreateChildPermission(AppPermissions.MasterCatalog, L("MasterCatalog"));
            MasterCatalog.CreateChildPermission(AppPermissions.MasterCatalog_Search, L("Search"));
            MasterCatalog.CreateChildPermission(AppPermissions.MasterCatalog_Add, L("Add"));
            MasterCatalog.CreateChildPermission(AppPermissions.MasterCatalog_Edit, L("Edit"));
            MasterCatalog.CreateChildPermission(AppPermissions.MasterCatalog_Delete, L("Delete"));

            var MstProductManagement = MasterData.CreateChildPermission(AppPermissions.MstProductManagement, L("ProductManagement"));
            MstProductManagement.CreateChildPermission(AppPermissions.ProductManagement_Search, L("Search"));
            MstProductManagement.CreateChildPermission(AppPermissions.ProductManagement_Add, L("Add"));
            MstProductManagement.CreateChildPermission(AppPermissions.ProductManagement_Edit, L("Edit"));
            MstProductManagement.CreateChildPermission(AppPermissions.ProductManagement_Delete, L("Delete"));
            MstProductManagement.CreateChildPermission(AppPermissions.ProductManagement_Export, L("ExportExcel"));
            MstProductManagement.CreateChildPermission(AppPermissions.ProductManagement_Import, L("ImportExcel"));

            var InventoryGroup = MasterData.CreateChildPermission(AppPermissions.InventoryGroup, L("InventoryGroup"));
            InventoryGroup.CreateChildPermission(AppPermissions.InventoryGroup_Search, L("Search"));
            InventoryGroup.CreateChildPermission(AppPermissions.InventoryGroup_Add, L("Add"));
            InventoryGroup.CreateChildPermission(AppPermissions.InventoryGroup_Edit, L("Edit"));
            InventoryGroup.CreateChildPermission(AppPermissions.InventoryGroup_Delete, L("Delete"));
            InventoryGroup.CreateChildPermission(AppPermissions.InventoryGroup_Export, L("ExportExcel"));

            var PersonnelMaster = MasterData.CreateChildPermission(AppPermissions.PersonnelMaster, L("PersonnelMaster"));
            PersonnelMaster.CreateChildPermission(AppPermissions.PersonnelMaster_Search, L("Search"));

            var MstExchangeRateData = MasterData.CreateChildPermission(AppPermissions.MstExchangeRateData, L("ExchangeRateData"));
            MstExchangeRateData.CreateChildPermission(AppPermissions.MstExchangeRateData_Search, L("Search"));
            MstExchangeRateData.CreateChildPermission(AppPermissions.MstExchangeRateData_Add, L("Add"));
            MstExchangeRateData.CreateChildPermission(AppPermissions.MstExchangeRateData_Edit, L("Edit"));
            MstExchangeRateData.CreateChildPermission(AppPermissions.MstExchangeRateData_Delete, L("Delete"));
            MstExchangeRateData.CreateChildPermission(AppPermissions.MstExchangeRateData_Export, L("ExportExcel"));


            var MasterBudgetCode = MasterData.CreateChildPermission(AppPermissions.MasterBudgetCode, L("BudgetCode"));
            MasterBudgetCode.CreateChildPermission(AppPermissions.MasterBudgetCode_Search, L("Search"));

            var Project = MasterData.CreateChildPermission(AppPermissions.Project, L("Project"));
            Project.CreateChildPermission(AppPermissions.Project_Search, L("Search"));
            Project.CreateChildPermission(AppPermissions.Project_Add, L("Add"));
            Project.CreateChildPermission(AppPermissions.Project_Edit, L("Edit"));
            Project.CreateChildPermission(AppPermissions.Project_Export, L("ExportExcel"));

            var QuotaExpense = MasterData.CreateChildPermission(AppPermissions.QuotaExpense, L("QuotaExpense"));
            QuotaExpense.CreateChildPermission(AppPermissions.QuotaExpense_Search, L("Search"));
            QuotaExpense.CreateChildPermission(AppPermissions.QuotaExpense_Add, L("Add"));
            QuotaExpense.CreateChildPermission(AppPermissions.QuotaExpense_Edit, L("Edit"));
            QuotaExpense.CreateChildPermission(AppPermissions.QuotaExpense_Export, L("ExportExcel"));

            var ProductGroup = MasterData.CreateChildPermission(AppPermissions.ProductGroup, L("ProductGroup"));
            ProductGroup.CreateChildPermission(AppPermissions.ProductGroup_Search, L("Search"));
            ProductGroup.CreateChildPermission(AppPermissions.ProductGroup_Add, L("Add"));
            ProductGroup.CreateChildPermission(AppPermissions.ProductGroup_Edit, L("Edit"));
            ProductGroup.CreateChildPermission(AppPermissions.ProductGroup_Export, L("ExportExcel"));



            //var ProductManagement = context.GetPermissionOrNull(AppPermissions.ProductManagement) ?? context.CreatePermission(AppPermissions.ProductManagement, L("ProductManagement"));
            //var ExchangeRateData = context.GetPermissionOrNull(AppPermissions.ExchangeRateData) ?? context.CreatePermission(AppPermissions.ExchangeRateData, L("ExchangeRateData"));
            
            var PriceManagement = context.GetPermissionOrNull(AppPermissions.PriceManagement) ?? context.CreatePermission(AppPermissions.PriceManagement, L("PriceManagement"));
            var MstPriceManagement = PriceManagement.CreateChildPermission(AppPermissions.MstPriceManagement, L("PriceManagement"));
            var FrameworkContractSupplier = PriceManagement.CreateChildPermission(AppPermissions.PriceManagement_FrameworkContractSupplier, L("FrameworkContractSupplier"));
            MstPriceManagement.CreateChildPermission(AppPermissions.MstPriceManagement_Search, L("Search"));
            MstPriceManagement.CreateChildPermission(AppPermissions.MstPriceManagement_Import, L("ImportExcel"));

            var FrameworkContractManagement = PriceManagement.CreateChildPermission(AppPermissions.FrameworkContractManagement, L("FrameworkContractManagement"));
            FrameworkContractManagement.CreateChildPermission(AppPermissions.FrameworkContractManagement_Search, L("Search"));
            FrameworkContractManagement.CreateChildPermission(AppPermissions.FrameworkContractManagement_Add, L("Add"));
            FrameworkContractManagement.CreateChildPermission(AppPermissions.FrameworkContractManagement_Edit, L("Edit"));
            FrameworkContractManagement.CreateChildPermission(AppPermissions.FrameworkContractManagement_Delete, L("Delete"));
            FrameworkContractManagement.CreateChildPermission(AppPermissions.FrameworkContractManagement_Import, L("ImportExcel"));

            var FrameworkContractCatalog = PriceManagement.CreateChildPermission(AppPermissions.FrameworkContractCatalog, L("FrameworkContractCatalog"));
            FrameworkContractCatalog.CreateChildPermission(AppPermissions.FrameworkContractCatalog_Search, L("Search"));
            FrameworkContractCatalog.CreateChildPermission(AppPermissions.FrameworkContractCatalog_Add, L("Add"));
            FrameworkContractCatalog.CreateChildPermission(AppPermissions.FrameworkContractCatalog_Edit, L("Edit"));
            FrameworkContractCatalog.CreateChildPermission(AppPermissions.FrameworkContractCatalog_Delete, L("Delete"));

            var SupplierManagement = context.GetPermissionOrNull(AppPermissions.SupplierManagement) ?? context.CreatePermission(AppPermissions.SupplierManagement, L("SupplierManagement"));
            var SupplierList = SupplierManagement.CreateChildPermission(AppPermissions.SupplierList, L("SupplierList"));
            SupplierList.CreateChildPermission(AppPermissions.SupplierList_Search, L("Search"));
            SupplierList.CreateChildPermission(AppPermissions.SupplierList_Add, L("Add"));
            SupplierList.CreateChildPermission(AppPermissions.SupplierList_Edit, L("Edit"));
            SupplierList.CreateChildPermission(AppPermissions.SupplierList_Delete, L("Delete"));

            var SupplierRequest = SupplierManagement.CreateChildPermission(AppPermissions.SupplierRequest, L("SupplierRequest"));
            SupplierRequest.CreateChildPermission(AppPermissions.SupplierRequest_Search, L("Search"));
            SupplierRequest.CreateChildPermission(AppPermissions.SupplierRequest_Add, L("Add"));
            SupplierRequest.CreateChildPermission(AppPermissions.SupplierRequest_Edit, L("Edit"));
            SupplierRequest.CreateChildPermission(AppPermissions.SupplierRequest_Rejected, L("Rejected"));
            SupplierRequest.CreateChildPermission(AppPermissions.SupplierRequest_ApproveAndCreateAccount, L("ApproveAndCreateAccount"));

            var ApproveRequest = context.GetPermissionOrNull(AppPermissions.ApproveRequest) ?? context.CreatePermission(AppPermissions.ApproveRequest, L("ApproveRequest"));
            var ApprovalManagement = ApproveRequest.CreateChildPermission(AppPermissions.ApprovalManagement, L("ApprovalManagement"));
            ApprovalManagement.CreateChildPermission(AppPermissions.ApprovalManagement_Search, L("Search"));
            ApprovalManagement.CreateChildPermission(AppPermissions.ApprovalManagement_Forward, L("Forward"));
            ApprovalManagement.CreateChildPermission(AppPermissions.ApprovalManagement_Rejected, L("Rejected"));
            ApprovalManagement.CreateChildPermission(AppPermissions.ApprovalManagement_ApproveRequest, L("ApproveRequest"));

            var SupplierPurchaseOrders = context.GetPermissionOrNull(AppPermissions.SupplierPurchaseOrders) ?? context.CreatePermission(AppPermissions.SupplierPurchaseOrders, L("SupplierPurchaseOrders"));
            var PurchaseOrdersHandle = SupplierPurchaseOrders.CreateChildPermission(AppPermissions.SupplierPurchaseOrders_PurchaseOrdersHandle, L("PurchaseOrdersHandle"));

            var PurchaseOrders = context.GetPermissionOrNull(AppPermissions.PurchaseOrders) ?? context.CreatePermission(AppPermissions.PurchaseOrders, L("PurchaseOrders"));
            //var PurchaseOrdersHandle = PurchaseOrders.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersHandle, L("PurchaseOrdersHandle"));
            PurchaseOrdersHandle.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersHandle_Search, L("Search"));
            PurchaseOrdersHandle.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersHandle_Approved, L("Confirm"));
            PurchaseOrdersHandle.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersHandle_Rejected, L("Rejected"));

            var PurchaseOrdersManagement = PurchaseOrders.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersManagement, L("PurchaseOrdersManagement"));
            PurchaseOrdersManagement.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Search, L("Search"));
            PurchaseOrdersManagement.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Add, L("Add"));
            PurchaseOrdersManagement.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Delete, L("Delete"));
            PurchaseOrdersManagement.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Import, L("ImportExcel"));
            PurchaseOrdersManagement.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_Export, L("ExportExcel"));
            PurchaseOrdersManagement.CreateChildPermission(AppPermissions.PurchaseOrders_PurchaseOrdersManagement_SendRequest, L("SendRequest"));

            var InvoiceItems = context.GetPermissionOrNull(AppPermissions.InvoiceItems) ?? context.CreatePermission(AppPermissions.InvoiceItems, L("InvoiceItems"));
            var DigitalInvoices = InvoiceItems.CreateChildPermission(AppPermissions.InvoiceItems_DigitalInvoices, L("DigitalInvoices"));
            DigitalInvoices.CreateChildPermission(AppPermissions.InvoiceItems_DigitalInvoices_Search, L("Search"));
            DigitalInvoices.CreateChildPermission(AppPermissions.InvoiceItems_DigitalInvoices_Edit, L("Edit"));
            DigitalInvoices.CreateChildPermission(AppPermissions.InvoiceItems_DigitalInvoices_Delete, L("Delete"));
            DigitalInvoices.CreateChildPermission(AppPermissions.InvoiceItems_DigitalInvoices_ChangeStatus, L("ChangeStatus"));

            var Invoices =  InvoiceItems.CreateChildPermission(AppPermissions.InvoiceItems_Invoices, L("Invoices"));
            Invoices.CreateChildPermission(AppPermissions.InvoiceItems_Invoices_Search, L("Search"));
            Invoices.CreateChildPermission(AppPermissions.InvoiceItems_Invoices_Add, L("Add"));
            Invoices.CreateChildPermission(AppPermissions.InvoiceItems_Invoices_Edit, L("Edit"));
            Invoices.CreateChildPermission(AppPermissions.InvoiceItems_Invoices_Import, L("ImportExcell"));

            var InvoiceAdjusted = InvoiceItems.CreateChildPermission(AppPermissions.InvoiceItems_InvoiceAdjusted, L("InvoiceAdjusted"));

            var PaymentRequest = InvoiceItems.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequest, L("PaymentRequest"));
            PaymentRequest.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequest_Search, L("Search"));
            PaymentRequest.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequest_Add, L("Add"));
            PaymentRequest.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequest_Edit, L("Edit"));
            PaymentRequest.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequest_SendRequest, L("SendRequest"));
            PaymentRequest.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequest_Cancel, L("Cancel"));

            var Prepayment = InvoiceItems.CreateChildPermission(AppPermissions.InvoiceItems_Prepayment, L("Prepayment"));
            Prepayment.CreateChildPermission(AppPermissions.InvoiceItems_Prepayment_Search, L("Search"));
            Prepayment.CreateChildPermission(AppPermissions.InvoiceItems_Prepayment_Add, L("Add"));
            Prepayment.CreateChildPermission(AppPermissions.InvoiceItems_Prepayment_Edit, L("Edit"));
            Prepayment.CreateChildPermission(AppPermissions.InvoiceItems_Prepayment_Delete, L("Delete"));

            var PaymentRequestFromSuppliers = InvoiceItems.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers, L("PaymentRequestFromSuppliers"));
            PaymentRequestFromSuppliers.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Search, L("Search"));
            PaymentRequestFromSuppliers.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Add, L("Add"));
            PaymentRequestFromSuppliers.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Edit, L("Edit"));
            PaymentRequestFromSuppliers.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_Cancel, L("Cancel"));
            PaymentRequestFromSuppliers.CreateChildPermission(AppPermissions.InvoiceItems_PaymentRequestFromSuppliers_SendToTMV, L("SendToTMV"));

            var GoodsReceipt = context.GetPermissionOrNull(AppPermissions.GoodsReceipt) ?? context.CreatePermission(AppPermissions.GoodsReceipt, L("GoodsReceipt"));
            GoodsReceipt.CreateChildPermission(AppPermissions.GoodsReceipt_AcceptanceNotes, L("AcceptanceNotes"));
            GoodsReceipt.CreateChildPermission(AppPermissions.GoodsReceipt_GoodsReceipts, L("GoodsReceipts"));
            GoodsReceipt.CreateChildPermission(AppPermissions.GoodsReceipt_ReceiptNotes, L("ReceiptNotes"));
            GoodsReceipt.CreateChildPermission(AppPermissions.GoodsReceipt_ServiceReceipts, L("ServiceReceipts"));
            GoodsReceipt.CreateChildPermission(AppPermissions.GoodsReceipt_ReturnGoodsReceipt, L("ReturnGoodsReceipt"));

            //day la cua bms
            var MasterBmsData = context.GetPermissionOrNull(AppPermissions.MasterBmsData) ?? context.CreatePermission(AppPermissions.MasterBmsData, L("MasterBmsData"));
            MasterBmsData.CreateChildPermission(AppPermissions.MasterBmsData_SegmentStructure, L("SegmentStructure"));
            MasterBmsData.CreateChildPermission(AppPermissions.MasterBmsData_BudgetPlan, L("BudgetPlan"));
            MasterBmsData.CreateChildPermission(AppPermissions.MasterBmsData_BudgetPlanVersion, L("BudgetPlanVersion"));
            MasterBmsData.CreateChildPermission(AppPermissions.MasterBmsData_ProjectCode12, L("ProjectCode12"));
            MasterBmsData.CreateChildPermission(AppPermissions.MasterBmsData_OtherInvestment, L("OtherInvestment"));
            MasterBmsData.CreateChildPermission(AppPermissions.MasterBmsData_ExchangeRate, L("ExchangeRate"));

            var BudgetPIC = context.GetPermissionOrNull(AppPermissions.BudgetPIC) ?? context.CreatePermission(AppPermissions.BudgetPIC, L("BudgetPIC"));
            var DivisionHead = context.GetPermissionOrNull(AppPermissions.DivisionHead) ?? context.CreatePermission(AppPermissions.DivisionHead, L("DivisionHead"));
            var Finance = context.GetPermissionOrNull(AppPermissions.Finance) ?? context.CreatePermission(AppPermissions.Finance, L("Finance"));

        var WorkList = context.GetPermissionOrNull(AppPermissions.WorkList) ?? context.CreatePermission(AppPermissions.WorkList, L("WorkList"));

        var BudgetControlSetup = context.GetPermissionOrNull(AppPermissions.BudgetControlSetup) ?? context.CreatePermission(AppPermissions.BudgetControlSetup, L("BudgetControlSetup"));
            #endregion
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, tmssConsts.LocalizationSourceName);
        }
    }
}
