namespace tmss.Authorization
{
    /// <summary>
    /// Defines string constants for application's permission names.
    /// <see cref="AppAuthorizationProvider"/> for permission definitions.
    /// </summary>
    public static class AppPermissions
    {
        //COMMON PERMISSIONS (FOR BOTH OF TENANTS AND HOST)

        public const string Pages = "Pages";

        public const string Pages_DemoUiComponents = "Pages.DemoUiComponents";
        public const string Pages_Administration = "Pages.Administration";

        public const string Pages_Administration_Roles = "Pages.Administration.Roles";
        public const string Pages_Administration_Roles_Create = "Pages.Administration.Roles.Create";
        public const string Pages_Administration_Roles_Edit = "Pages.Administration.Roles.Edit";
        public const string Pages_Administration_Roles_Delete = "Pages.Administration.Roles.Delete";

        public const string Pages_Administration_Users = "Pages.Administration.Users";
        public const string Pages_Administration_Users_Create = "Pages.Administration.Users.Create";
        public const string Pages_Administration_Users_Edit = "Pages.Administration.Users.Edit";
        public const string Pages_Administration_Users_Delete = "Pages.Administration.Users.Delete";
        public const string Pages_Administration_Users_ChangePermissions = "Pages.Administration.Users.ChangePermissions";
        public const string Pages_Administration_Users_Impersonation = "Pages.Administration.Users.Impersonation";
        public const string Pages_Administration_Users_Unlock = "Pages.Administration.Users.Unlock";

        public const string Pages_Administration_Languages = "Pages.Administration.Languages";
        public const string Pages_Administration_Languages_Create = "Pages.Administration.Languages.Create";
        public const string Pages_Administration_Languages_Edit = "Pages.Administration.Languages.Edit";
        public const string Pages_Administration_Languages_Delete = "Pages.Administration.Languages.Delete";
        public const string Pages_Administration_Languages_ChangeTexts = "Pages.Administration.Languages.ChangeTexts";

        public const string Pages_Administration_AuditLogs = "Pages.Administration.AuditLogs";

        public const string Pages_Administration_OrganizationUnits = "Pages.Administration.OrganizationUnits";
        public const string Pages_Administration_OrganizationUnits_ManageOrganizationTree = "Pages.Administration.OrganizationUnits.ManageOrganizationTree";
        public const string Pages_Administration_OrganizationUnits_ManageMembers = "Pages.Administration.OrganizationUnits.ManageMembers";
        public const string Pages_Administration_OrganizationUnits_ManageRoles = "Pages.Administration.OrganizationUnits.ManageRoles";

        public const string Pages_Administration_HangfireDashboard = "Pages.Administration.HangfireDashboard";

        public const string Pages_Administration_UiCustomization = "Pages.Administration.UiCustomization";

        public const string Pages_Administration_WebhookSubscription = "Pages.Administration.WebhookSubscription";
        public const string Pages_Administration_WebhookSubscription_Create = "Pages.Administration.WebhookSubscription.Create";
        public const string Pages_Administration_WebhookSubscription_Edit = "Pages.Administration.WebhookSubscription.Edit";
        public const string Pages_Administration_WebhookSubscription_ChangeActivity = "Pages.Administration.WebhookSubscription.ChangeActivity";
        public const string Pages_Administration_WebhookSubscription_Detail = "Pages.Administration.WebhookSubscription.Detail";
        public const string Pages_Administration_Webhook_ListSendAttempts = "Pages.Administration.Webhook.ListSendAttempts";
        public const string Pages_Administration_Webhook_ResendWebhook = "Pages.Administration.Webhook.ResendWebhook";

        public const string Pages_Administration_DynamicProperties = "Pages.Administration.DynamicProperties";
        public const string Pages_Administration_DynamicProperties_Create = "Pages.Administration.DynamicProperties.Create";
        public const string Pages_Administration_DynamicProperties_Edit = "Pages.Administration.DynamicProperties.Edit";
        public const string Pages_Administration_DynamicProperties_Delete = "Pages.Administration.DynamicProperties.Delete";

        public const string Pages_Administration_DynamicPropertyValue = "Pages.Administration.DynamicPropertyValue";
        public const string Pages_Administration_DynamicPropertyValue_Create = "Pages.Administration.DynamicPropertyValue.Create";
        public const string Pages_Administration_DynamicPropertyValue_Edit = "Pages.Administration.DynamicPropertyValue.Edit";
        public const string Pages_Administration_DynamicPropertyValue_Delete = "Pages.Administration.DynamicPropertyValue.Delete";

        public const string Pages_Administration_DynamicEntityProperties = "Pages.Administration.DynamicEntityProperties";
        public const string Pages_Administration_DynamicEntityProperties_Create = "Pages.Administration.DynamicEntityProperties.Create";
        public const string Pages_Administration_DynamicEntityProperties_Edit = "Pages.Administration.DynamicEntityProperties.Edit";
        public const string Pages_Administration_DynamicEntityProperties_Delete = "Pages.Administration.DynamicEntityProperties.Delete";

        public const string Pages_Administration_DynamicEntityPropertyValue = "Pages.Administration.DynamicEntityPropertyValue";
        public const string Pages_Administration_DynamicEntityPropertyValue_Create = "Pages.Administration.DynamicEntityPropertyValue.Create";
        public const string Pages_Administration_DynamicEntityPropertyValue_Edit = "Pages.Administration.DynamicEntityPropertyValue.Edit";
        public const string Pages_Administration_DynamicEntityPropertyValue_Delete = "Pages.Administration.DynamicEntityPropertyValue.Delete";
        //TENANT-SPECIFIC PERMISSIONS

        public const string Pages_Tenant_Dashboard = "Pages.Tenant.Dashboard";

        public const string Pages_Administration_Tenant_Settings = "Pages.Administration.Tenant.Settings";

        public const string Pages_Administration_Tenant_SubscriptionManagement = "Pages.Administration.Tenant.SubscriptionManagement";

        //HOST-SPECIFIC PERMISSIONS

        public const string Pages_Editions = "Pages.Editions";
        public const string Pages_Editions_Create = "Pages.Editions.Create";
        public const string Pages_Editions_Edit = "Pages.Editions.Edit";
        public const string Pages_Editions_Delete = "Pages.Editions.Delete";
        public const string Pages_Editions_MoveTenantsToAnotherEdition = "Pages.Editions.MoveTenantsToAnotherEdition";

        public const string Pages_Tenants = "Pages.Tenants";
        public const string Pages_Tenants_Create = "Pages.Tenants.Create";
        public const string Pages_Tenants_Edit = "Pages.Tenants.Edit";
        public const string Pages_Tenants_ChangeFeatures = "Pages.Tenants.ChangeFeatures";
        public const string Pages_Tenants_Delete = "Pages.Tenants.Delete";
        public const string Pages_Tenants_Impersonation = "Pages.Tenants.Impersonation";

        public const string Pages_Administration_Host_Maintenance = "Pages.Administration.Host.Maintenance";
        public const string Pages_Administration_Host_Settings = "Pages.Administration.Host.Settings";
        public const string Pages_Administration_Host_Dashboard = "Pages.Administration.Host.Dashboard";

        /* Custom Application Permission */
        #region -- Custom Application Permission

        #region -- User Request
        public const string UserRequest = "UserRequest";

        /* Buy From Catalog */
        public const string UserRequest_BuyRequestFromCatalog = "UserRequest.BuyRequestFromCatalog";
        public const string UserRequest_BuyRequestFromCatalog_Create = "UserRequest.BuyRequestFromCatalog.Create";
        
        /* User Request Management */
        public const string UserRequest_ManageUserRequest = "UserRequest.ManageUserRequest";
        public const string UserRequest_ManageUserRequest_CreateOrEdit = "UserRequest.ManageUserRequest.CreateOrEdit";
        public const string UserRequest_ManageUserRequest_Delete = "UserRequest.ManageUserRequest.Delete";
        public const string UserRequest_ManageUserRequest_Import = "UserRequest.ManageUserRequest.Import";
        public const string UserRequest_ManageUserRequest_Export = "UserRequest.ManageUserRequest.Export";
        public const string UserRequest_ManageUserRequest_SendRequest = "UserRequest.ManageUserRequest.SendRequest";
        #endregion

        #region -- Purchase Request
        public const string PurchaseRequest = "PurchaseRequest";
        public const string PurchaseRequest_PurchaseRequestManagement = "PurchaseRequest.PurchaseRequestManagement";
        public const string PurchaseRequest_PurchaseRequestManagement_Search = "PurchaseRequest.PurchaseRequestManagement.Search";
        public const string PurchaseRequest_PurchaseRequestManagement_Add = "PurchaseRequest.PurchaseRequestManagement.Add";
        public const string PurchaseRequest_PurchaseRequestManagement_Delete = "PurchaseRequest.PurchaseRequestManagement.Delete";
        public const string PurchaseRequest_PurchaseRequestManagement_Import = "PurchaseRequest.PurchaseRequestManagement.Import";
        public const string PurchaseRequest_PurchaseRequestManagement_Export = "PurchaseRequest.PurchaseRequestManagement.Export";
        public const string PurchaseRequest_PurchaseRequestManagement_SendRequest = "PurchaseRequest.PurchaseRequestManagement.SendRequest";

        public const string PurchaseRequest_CreatePurchaseRequest = "PurchaseRequest.CreatePurchaseRequest";
        public const string PurchaseRequest_CreatePurchaseRequest_Search = "PurchaseRequest.CreatePurchaseRequest.Search";
        public const string PurchaseRequest_CreatePurchaseRequest_Add = "PurchaseRequest.CreatePurchaseRequest.Add";

        public const string PurchaseOrders_AutoCreatePurchaseOrders = "PurchaseOrders.AutoCreatePurchaseOrders";
        public const string PurchaseOrders_AutoCreatePurchaseOrders_Search = "PurchaseOrders.AutoCreatePurchaseOrders.Search";
        public const string PurchaseOrders_AutoCreatePurchaseOrders_Add = "PurchaseOrders.AutoCreatePurchaseOrders.Add";



        #endregion

        public const string ConfigureSystem = "ConfigureSystem";

        public const string ApprovalTree = "ConfigureSystem.ApprovalTree";
        public const string ApprovalTree_Search = "ConfigureSystem.ApprovalTree.Search";
        public const string ApprovalTree_Add = "ConfigureSystem.ApprovalTree.Add";
        public const string ApprovalTree_Edit = "ConfigureSystem.ApprovalTree.Edit";
        public const string ApprovalTree_Delete = "ConfigureSystem.ApprovalTree.Delete";

        public const string ListOfDocument = "ConfigureSystem.ListOfDocument";
        public const string ListOfDocument_Search = "ConfigureSystem.ListOfDocument.Search";
        public const string ListOfDocument_Add = "ConfigureSystem.ListOfDocument.Add";
        public const string ListOfDocument_Edit = "ConfigureSystem.ListOfDocument.Edit";
        public const string ListOfDocument_Export = "ConfigureSystem.ListOfDocument.Export";

        public const string InventoryCodeConfig = "ConfigureSystem.InventoryCodeConfig";
        public const string InventoryCodeConfig_Search = "ConfigureSystem.InventoryCodeConfig.Search";
        public const string InventoryCodeConfig_Add = "ConfigureSystem.InventoryCodeConfig.Add";
        public const string InventoryCodeConfig_Edit = "ConfigureSystem.InventoryCodeConfig.Edit";
        public const string InventoryCodeConfig_Export = "ConfigureSystem.InventoryCodeConfig.Export";

        public const string MasterData = "MasterData";
        public const string PurchasePurpose = "MasterData.PurchasePurpose";
        public const string PurchasePurpose_Search = "MasterData.PurchasePurpose.Search";
        public const string PurchasePurpose_Add = "MasterData.PurchasePurpose.Add";
        public const string PurchasePurpose_Edit = "MasterData.PurchasePurpose.Edit";
        public const string PurchasePurpose_Delete = "MasterData.PurchasePurpose.Delete";
        public const string PurchasePurpose_Import = "MasterData.PurchasePurpose.Import";

        public const string CurrencyType = "MasterData.CurrencyType";
        public const string CurrencyType_Search = "MasterData.CurrencyType.Search";
        public const string CurrencyType_Add = "MasterData.CurrencyType.Add";
        public const string CurrencyType_Edit = "MasterData.CurrencyType.Edit";
        public const string CurrencyType_Delete = "MasterData.CurrencyType.Delete";

        public const string UnitOfMeasure = "MasterData.UnitOfMeasure";
        public const string UnitOfMeasure_Search = "MasterData.UnitOfMeasure.Search";
        public const string UnitOfMeasure_Add = "MasterData.UnitOfMeasure.Add";
        public const string UnitOfMeasure_Edit = "MasterData.UnitOfMeasure.Edit";
        public const string UnitOfMeasure_Delete = "MasterData.UnitOfMeasure.Delete";
        public const string UnitOfMeasure_Export = "MasterData.UnitOfMeasure.Export";

        public const string CancelReason = "MasterData.CancelReason";
        public const string CancelReason_Search = "MasterData.CancelReason.Search";
        public const string CancelReason_Add = "MasterData.CancelReason.Add";
        public const string CancelReason_Edit = "MasterData.CancelReason.Edit";
        public const string CancelReason_Delete = "MasterData.CancelReason.Delete";

        public const string MasterCatalog = "MasterData.MasterCatalog";
        public const string MasterCatalog_Search = "MasterData.MasterCatalog.Search";
        public const string MasterCatalog_Add = "MasterData.MasterCatalog.Add";
        public const string MasterCatalog_Edit = "MasterData.MasterCatalog.Edit";
        public const string MasterCatalog_Delete = "MasterData.MasterCatalog.Delete";

        public const string MstProductManagement = "MasterData.ProductManagement";
        public const string ProductManagement_Search = "MasterData.ProductManagement.Search";
        public const string ProductManagement_Add = "MasterData.ProductManagement.Add";
        public const string ProductManagement_Edit = "MasterData.ProductManagement.Edit";
        public const string ProductManagement_Delete = "MasterData.ProductManagement.Delete";
        public const string ProductManagement_Export = "MasterData.ProductManagement.Export";
        public const string ProductManagement_Import = "MasterData.ProductManagement.Import";

        public const string InventoryGroup = "MasterData.InventoryGroup";
        public const string InventoryGroup_Search = "MasterData.InventoryGroup.Search";
        public const string InventoryGroup_Add = "MasterData.InventoryGroup.Add";
        public const string InventoryGroup_Edit = "MasterData.InventoryGroup.Edit";
        public const string InventoryGroup_Delete = "MasterData.InventoryGroup.Delete";
        public const string InventoryGroup_Export = "MasterData.InventoryGroup.Export";

        public const string PersonnelMaster = "MasterData.PersonnelMaster";
        public const string PersonnelMaster_Search = "MasterData.PersonnelMaster.Search";

        public const string MstExchangeRateData = "MasterData.MstExchangeRateData";
        public const string MstExchangeRateData_Search = "MasterData.MstExchangeRateData.Search";
        public const string MstExchangeRateData_Add = "MasterData.MstExchangeRateData.Add";
        public const string MstExchangeRateData_Edit = "MasterData.MstExchangeRateData.Edit";
        public const string MstExchangeRateData_Delete = "MasterData.MstExchangeRateData.Delete";
        public const string MstExchangeRateData_Export = "MasterData.MstExchangeRateData.Export";

        public const string MasterBudgetCode = "MasterData.MasterBudgetCode";
        public const string MasterBudgetCode_Search = "MasterData.MasterBudgetCode.Search";


        public const string Project = "MasterData.Project";
        public const string Project_Search = "MasterData.Project.Search";
        public const string Project_Add = "MasterData.Project.Add";
        public const string Project_Edit = "MasterData.Project.Edit";
        public const string Project_Export = "MasterData.Project.Export";

        public const string QuotaExpense = "MasterData.QuotaExpense";
        public const string QuotaExpense_Search = "MasterData.QuotaExpense.Search";
        public const string QuotaExpense_Add = "MasterData.QuotaExpense.Add";
        public const string QuotaExpense_Edit = "MasterData.QuotaExpense.Edit";
        public const string QuotaExpense_Export = "MasterData.QuotaExpense.Export";

        public const string ProductGroup = "MasterData.ProductGroup";
        public const string ProductGroup_Search = "MasterData.ProductGroup.Search";
        public const string ProductGroup_Add = "MasterData.ProductGroup.Add";
        public const string ProductGroup_Edit = "MasterData.ProductGroup.Edit";
        public const string ProductGroup_Export = "MasterData.ProductGroup.Export";

        //public const string ProductManagement = "ProductManagement";
        //public const string ExchangeRateData = "ExchangeRateData";

        public const string PriceManagement = "PriceManagement";
        public const string PriceManagement_FrameworkContractSupplier = "PriceManagement.FrameworkContractSupplier";
        public const string MstPriceManagement = "PriceManagement.MstPriceManagement";
        public const string MstPriceManagement_Search = "PriceManagement.MstPriceManagement.Search";
        public const string MstPriceManagement_Import = "PriceManagement.MstPriceManagement.Import";
        
        public const string FrameworkContractManagement = "PriceManagement.FrameworkContractManagement";
        public const string FrameworkContractManagement_Search = "PriceManagement.FrameworkContractManagement.Search";
        public const string FrameworkContractManagement_Add = "PriceManagement.FrameworkContractManagement.Add";
        public const string FrameworkContractManagement_Edit = "PriceManagement.FrameworkContractManagement.Edit";
        public const string FrameworkContractManagement_Delete = "PriceManagement.FrameworkContractManagement.Delete";
        public const string FrameworkContractManagement_Import = "PriceManagement.FrameworkContractManagement.Import";

        public const string FrameworkContractCatalog = "PriceManagement.FrameworkContractCatalog";
        public const string FrameworkContractCatalog_Search = "PriceManagement.FrameworkContractCatalog.Search";
        public const string FrameworkContractCatalog_Add = "PriceManagement.FrameworkContractCatalog.Add";
        public const string FrameworkContractCatalog_Edit = "PriceManagement.FrameworkContractCatalog.Edit";
        public const string FrameworkContractCatalog_Delete = "PriceManagement.FrameworkContractCatalog.Delete";

        public const string SupplierManagement = "SupplierManagement";
        public const string SupplierList = "SupplierManagement.SupplierList";
        public const string SupplierList_Search = "SupplierManagement.SupplierList.Search";
        public const string SupplierList_Add = "SupplierManagement.SupplierList.Add";
        public const string SupplierList_Edit = "SupplierManagement.SupplierList.Edit";
        public const string SupplierList_Delete = "SupplierManagement.SupplierList.Delete";

        public const string SupplierRequest = "SupplierManagement.SupplierRequest";
        public const string SupplierRequest_Search = "SupplierManagement.SupplierRequest.Search";
        public const string SupplierRequest_Add = "SupplierManagement.SupplierRequest.Add";
        public const string SupplierRequest_Edit = "SupplierManagement.SupplierRequest.Edit";
        public const string SupplierRequest_Rejected = "SupplierManagement.SupplierRequest.Rejected";
        public const string SupplierRequest_ApproveAndCreateAccount = "SupplierManagement.SupplierRequest.ApproveAndCreateAccount";

        public const string ApproveRequest = "ApproveRequest";
        public const string ApprovalManagement = "ApproveRequest.ApprovalManagement";
        public const string ApprovalManagement_Search = "ApproveRequest.ApprovalManagement.Search";
        public const string ApprovalManagement_Forward = "ApproveRequest.ApprovalManagement.Forward";
        public const string ApprovalManagement_Rejected = "ApproveRequest.ApprovalManagement.Rejected";
        public const string ApprovalManagement_ApproveRequest = "ApproveRequest.ApprovalManagement.ApproveRequest";

        public const string PurchaseOrders = "PurchaseOrders";
        public const string PurchaseOrders_PurchaseOrdersManagement = "PurchaseOrders.PurchaseOrdersManagement";
        public const string PurchaseOrders_PurchaseOrdersManagement_Search = "PurchaseOrders.PurchaseOrdersManagement.Search";
        public const string PurchaseOrders_PurchaseOrdersManagement_Add = "PurchaseOrders.PurchaseOrdersManagement.Add";
        public const string PurchaseOrders_PurchaseOrdersManagement_Delete = "PurchaseOrders.PurchaseOrdersManagement.Delete";
        public const string PurchaseOrders_PurchaseOrdersManagement_Export = "PurchaseOrders.PurchaseOrdersManagement.Export";
        public const string PurchaseOrders_PurchaseOrdersManagement_Import = "PurchaseOrders.PurchaseOrdersManagement.Import";
        public const string PurchaseOrders_PurchaseOrdersManagement_SendRequest = "PurchaseOrders.PurchaseOrdersManagement.SendRequest";

        public const string PurchaseOrders_PurchaseOrdersHandle = "PurchaseOrders.PurchaseOrdersHandle";
        public const string PurchaseOrders_PurchaseOrdersHandle_Search = "PurchaseOrders.PurchaseOrdersHandle.Search";
        public const string PurchaseOrders_PurchaseOrdersHandle_Approved = "PurchaseOrders.PurchaseOrdersHandle.Approved";
        public const string PurchaseOrders_PurchaseOrdersHandle_Rejected = "PurchaseOrders.PurchaseOrdersHandle.Rejected";

        public const string SupplierPurchaseOrders = "SupplierPurchaseOrders";
        public const string SupplierPurchaseOrders_PurchaseOrdersHandle = "SupplierPurchaseOrders.PurchaseOrdersHandle";

        public const string InvoiceItems = "InvoiceItems";
        public const string InvoiceItems_PaymentRequest = "InvoiceItems.PaymentRequest";
        public const string InvoiceItems_PaymentRequest_Search = "InvoiceItems.PaymentRequest.Search";
        public const string InvoiceItems_PaymentRequest_Add = "InvoiceItems.PaymentRequest.Add";
        public const string InvoiceItems_PaymentRequest_Edit = "InvoiceItems.PaymentRequest.Edit";
        public const string InvoiceItems_PaymentRequest_SendRequest = "InvoiceItems.PaymentRequest.SendRequest";
        public const string InvoiceItems_PaymentRequest_Cancel = "InvoiceItems.PaymentRequest.Cancel";

        public const string InvoiceItems_InvoiceAdjusted = "InvoiceItems.InvoiceAdjusted";

        public const string InvoiceItems_Invoices = "InvoiceItems.Invoices";
        public const string InvoiceItems_Invoices_Search = "InvoiceItems.Invoices.Search";
        public const string InvoiceItems_Invoices_Add = "InvoiceItems.Invoices.Add";
        public const string InvoiceItems_Invoices_Edit = "InvoiceItems.Invoices.Edit";
        public const string InvoiceItems_Invoices_Import = "InvoiceItems.Invoices.Import";

        public const string InvoiceItems_DigitalInvoices = "InvoiceItems.DigitalInvoices";
        public const string InvoiceItems_DigitalInvoices_Search = "InvoiceItems.DigitalInvoices.Search";
        public const string InvoiceItems_DigitalInvoices_Edit = "InvoiceItems.DigitalInvoices.Edit";
        public const string InvoiceItems_DigitalInvoices_Delete = "InvoiceItems.DigitalInvoices.Delete";
        public const string InvoiceItems_DigitalInvoices_ChangeStatus = "InvoiceItems.DigitalInvoices.ChangeStatus";

        public const string InvoiceItems_Prepayment = "InvoiceItems.Prepayment";
        public const string InvoiceItems_Prepayment_Search = "InvoiceItems.Prepayment.Search";
        public const string InvoiceItems_Prepayment_Add = "InvoiceItems.Prepayment.Add";
        public const string InvoiceItems_Prepayment_Edit = "InvoiceItems.Prepayment.Edit";
        public const string InvoiceItems_Prepayment_Delete = "InvoiceItems.Prepayment.Delete";

        public const string InvoiceItems_PaymentRequestFromSuppliers = "InvoiceItems.PaymentRequestFromSuppliers";
        public const string InvoiceItems_PaymentRequestFromSuppliers_Search = "InvoiceItems.PaymentRequestFromSuppliers.Search";
        public const string InvoiceItems_PaymentRequestFromSuppliers_Add = "InvoiceItems.PaymentRequestFromSuppliers.Add";
        public const string InvoiceItems_PaymentRequestFromSuppliers_Edit = "InvoiceItems.PaymentRequestFromSuppliers.Edit";
        public const string InvoiceItems_PaymentRequestFromSuppliers_Cancel = "InvoiceItems.PaymentRequestFromSuppliers.Cancel";
        public const string InvoiceItems_PaymentRequestFromSuppliers_SendToTMV = "InvoiceItems.PaymentRequestFromSuppliers.SendToTMV";

        public const string GoodsReceipt = "GoodsReceipt";
        public const string GoodsReceipt_ReceiptNotes = "GoodsReceipt.ReceiptNotes";
        public const string GoodsReceipt_AcceptanceNotes = "GoodsReceipt.AcceptanceNotes";
        public const string GoodsReceipt_GoodsReceipts = "GoodsReceipt.GoodsReceipts";
        public const string GoodsReceipt_ServiceReceipts = "GoodsReceipt.ServiceReceipts";
        public const string GoodsReceipt_ReturnGoodsReceipt = "GoodsReceipt.ReturnGoodsReceipt";

        public const string WorkList = "WorkList";

        //Day la BMS
        public const string MasterBmsData = "MasterBmsData";
        public const string MasterBmsData_SegmentStructure = "MasterBmsData.SegmentStructure";
        public const string MasterBmsData_BudgetPlan = "MasterBmsData.BudgetPlan";
        public const string MasterBmsData_BudgetPlanVersion = "MasterBmsData.BudgetPlanVersion";
        public const string MasterBmsData_ProjectCode12 = "MasterBmsData.ProjectCode12";
        public const string MasterBmsData_OtherInvestment = "MasterBmsData.OtherInvestment";
        public const string MasterBmsData_ExchangeRate = "MasterBmsData.ExchangeRate";

        public const string BudgetPIC = "BudgetPIC";
        public const string DivisionHead = "DivisionHead";
        public const string Finance = "Finance";
        public const string BudgetControlSetup = "BudgetControlSetup";

        #endregion
    }
}