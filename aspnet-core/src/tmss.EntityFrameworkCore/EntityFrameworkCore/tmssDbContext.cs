using Abp.IdentityServer4vNext;
using Abp.Zero.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using tmss.Authorization.Delegation;
using tmss.Authorization.Roles;
using tmss.Authorization.Users;
using tmss.BMS.BudgetPIC;
using tmss.BMS.BudgetPlan;
using tmss.BMS.Master.ExchangeRateMaster;
using tmss.BMS.Master.PairingSegment;
using tmss.BMS.Master.Period;
using tmss.BMS.Master.ProjectCode12;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment2;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Segment4;
using tmss.BMS.Master.Segment5;
using tmss.BMS.Master.Status;
using tmss.BMS.Master.UserControl;
using tmss.Chat;
using tmss.Config;
using tmss.Core.BMS.Master.Period;
using tmss.Core.Master.Period;
using tmss.Editions;
using tmss.Friendships;
using tmss.GR;
using tmss.MainDashboard;
using tmss.Master;
using tmss.Master.BMS.Department;
using tmss.Master.InventoryItemTemp;
using tmss.Master.Relationship;
using tmss.MultiTenancy;
using tmss.MultiTenancy.Accounting;
using tmss.MultiTenancy.Payments;
using tmss.PaymentModule.Invoices;
using tmss.PaymentModule.Payment;
using tmss.PO;
using tmss.PR;
using tmss.Price;
using tmss.RequestApproval;
using tmss.Storage;

namespace tmss.EntityFrameworkCore
{
    public class tmssDbContext : AbpZeroDbContext<Tenant, Role, User, tmssDbContext>, IAbpPersistedGrantDbContext
    {
        /* Define an IDbSet for each entity of the application */

        public virtual DbSet<BinaryObject> BinaryObjects { get; set; }

        public virtual DbSet<Friendship> Friendships { get; set; }

        public virtual DbSet<ChatMessage> ChatMessages { get; set; }

        public virtual DbSet<SubscribableEdition> SubscribableEditions { get; set; }

        public virtual DbSet<SubscriptionPayment> SubscriptionPayments { get; set; }

        public virtual DbSet<Invoice> Invoices { get; set; }

        public virtual DbSet<PersistedGrantEntity> PersistedGrants { get; set; }

        public virtual DbSet<SubscriptionPaymentExtensionData> SubscriptionPaymentExtensionDatas { get; set; }

        public virtual DbSet<UserDelegation> UserDelegations { get; set; }
        public virtual DbSet<PrImportPrTemp> PrImportPrTemp { get; set; }
        public virtual DbSet<PrImportPrDetailTemp> PrImportPrDetailTemp { get; set; }
        public virtual DbSet<MstPeriod> MstPeriods { get; set; }
        public virtual DbSet<MstPurchasePurpose> MstPurchasePurpose { get; set; }
        public virtual DbSet<PrRequisitionHeaders> PrRequisitionHeaders { get; set; }
        public virtual DbSet<PrRequisitionLines> PrRequisitionLines { get; set; }
        public virtual DbSet<MstUnitOfMeasure> MstUnitOfMeasure { get; set; }
        public virtual DbSet<MstSupplierContacts> MstSupplierContacts { get; set; }
        public virtual DbSet<MstSupplierSites> MstSupplierSites { get; set; }
        public virtual DbSet<MstCurrency> MstCurrencies { get; set; }
        public virtual DbSet<MstInventoryGroup> MstInventoryGroup { get; set; }
        public virtual DbSet<MstProductGroup> MstProductGroup { get; set; }

        public virtual DbSet<MstInventoryItems> MstInventoryItems { get; set; }
        public virtual DbSet<MstSuppliers> MstSuppliers { get; set; }
        public virtual DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public virtual DbSet<ShoppingCartDetail> ShoppingCartDetails { get; set; }
        public virtual DbSet<MstCategories> MstCategories { get; set; }
        public virtual DbSet<MstLineType> MstLineType { get; set; }
        public virtual DbSet<MstLocations> MstLocations { get; set; }
        public virtual DbSet<MstOrganizations> MstOrganizations { get; set; }
        public virtual DbSet<UserRequest> UserRequests { get; set; }
        public virtual DbSet<UserRequestDetail> UserRequestDetails { get; set; }
        public virtual DbSet<MstLastPurchasingSeq> MstLastPurchasingSeqs { get; set; }
        public virtual DbSet<MstInventoryItemPrices> MstInventoryItemPrices { get; set; }
        public virtual DbSet<MstSupplierRequest> MstSupplierRequest { get; set; }
        public virtual DbSet<MstCancelReason> MstCancelReason { get; set; }
        public virtual DbSet<MstNation> MstNation { get; set; }
        public virtual DbSet<MstProvince> MstProvince { get; set; }
        public virtual DbSet<MstDistrict> MstDistrict { get; set; }
        public virtual DbSet<MstLookup> MstLookup { get; set; }
        public virtual DbSet<MstPaymentTerms> MstPaymentTerms { get; set; }
        public virtual DbSet<PoImportPurchaseOrderTemp> PoImportPurchaseOrderTemp { get; set; }
        public virtual DbSet<CfgReportTemplate> CfgReportTemplate { get; set; }
        public virtual DbSet<CfgReportTemplateTable> CfgReportTemplateTable { get; set; }
        public virtual DbSet<CfgReportTemplateTableColumn> CfgReportTemplateTableColumn { get; set; }
        public virtual DbSet<CfgReportTemplateField> CfgReportTemplateField { get; set; }
        public virtual DbSet<MstSupplierBankAccount> MstSupplierBankAccount { get; set; }
        public virtual DbSet<InvoiceAdjustedHeaders> InvoiceAdjustedHeaders { get; set; }
        public virtual DbSet<InvoiceAdjustedLines> InvoiceAdjustedLines { get; set; }

        //GR
        public virtual DbSet<RcvRoutingHeaders> RcvRoutingHeaders { get; set; }
        public virtual DbSet<RcvShipmentHeaders> RcvShipmentHeaders { get; set; }
        public virtual DbSet<RcvShipmentLines> RcvShipmentLines { get; set; }
        public virtual DbSet<RcvTransactions> RcvTransactions { get; set; }
        public virtual DbSet<RcvReceiptNoteHeaders> RcvReceiptNoteHeaders { get; set; }
        public virtual DbSet<RcvReceiptNoteLines> RcvReceiptNoteLines { get; set; }
        public virtual DbSet<RcvShipmentAttachments> RcvShipmentAttachments { get; set; }
        public virtual DbSet<MstInventoryItemSubInventories> MstInventoryItemSubInventories { get; set; }


        //PO
        public virtual DbSet<PoHeaders> PoHeaders { get; set; }
        public virtual DbSet<PoLines> PoLines { get; set; }

        public virtual DbSet<MstTitles> MstTitles { get; set; }
        public virtual DbSet<MstProcessType> MstProcessType { get; set; }
        public virtual DbSet<MstHrOrgStructure> MstHrOrgStructure { get; set; }
        public virtual DbSet<MstApprovalType> MstApprovalType { get; set; }
        public virtual DbSet<MstApprovalTreeDetail> MstApprovalTreeDetail { get; set; }
        public virtual DbSet<MstApprovalTree> MstApprovalTree { get; set; }
        public virtual DbSet<MstApprovalTreeDetailUser> MstApprovalTreeDetailUser { get; set; }
        public virtual DbSet<RequestApprovalStep> RequestApprovalStep { get; set; }
        public virtual DbSet<RequestApprovalStepUser> RequestApprovalStepUser { get; set; }

        public virtual DbSet<PoLineShipments> PoLineShipments { get; set; }
        public virtual DbSet<PoDistributions> PoDistributions { get; set; }
        public virtual DbSet<MstGlCodeCombination> MstGlCodeCombination { get; set; }
        public virtual DbSet<PrRequisitionDistributions> PrRequisitionDistributions { get; set; }
        public virtual DbSet<PaymentHeaders> PaymentHeaders { get; set; }
        public virtual DbSet<PaymentLines> PaymentLines { get; set; }
        public virtual DbSet<PaymentAttachments> PaymentAttachments { get; set; }
        public virtual DbSet<PaymentFromSuppliers> PaymentFromSuppliers { get; set; }
        public virtual DbSet<PaymentFromSupplierAttachments> PaymentFromSupplierAttachments { get; set; }
        public virtual DbSet<InvTncApInterface> InvTncApInterface { get; set; }
        public virtual DbSet<InvoiceHeaders> InvoiceHeaders { get; set; }
        public virtual DbSet<InvoiceLines> InvoiceLines { get; set; }
        //temp 
        public virtual DbSet<ImpInventoryItemPriceTemp> ImpInventoryItemPriceTemp { get; set; }
        public virtual DbSet<MstTemplateEmail> MstTemplateEmail { get; set; }
        public virtual DbSet<ImpInventoryItemTemp> ImpInventoryItemTemp { get; set; }
        public virtual DbSet<CfgEmailTemplate> CfgEmailTemplate { get; set; }
        public virtual DbSet<MstGlExchangeRate> MstGlExchangeRate { get; set; }
        public virtual DbSet<MstContractTemplate> MstContractTemplate { get; set; }

        public virtual DbSet<PrcContractHeaders> PrcContractHeaders { get; set; }
        public virtual DbSet<PrcContractLines> PrcContractLines { get; set; }
        public virtual DbSet<PrcAppendixContract> PrcAppendixContract { get; set; }
        public virtual DbSet<PrcAppendixContractItems> PrcAppendixContractItems { get; set; }
        public virtual DbSet<PrcContractTemplate> PrcContractTemplate { get; set; }
        public virtual DbSet<MstAttachFiles> MstAttachFiles { get; set; }


        public virtual DbSet<PaymentPrepayment> PaymentPrepayment { get; set; }
        public virtual DbSet<PaymentPrepaymentInvoice> PaymentPrepaymentInvoice { get; set; }
        public virtual DbSet<MstCatalog> MstCatalog { get; set; }
        public virtual DbSet<MstPosition> MstPosition { get; set; }
        public virtual DbSet<MstInventoryCodeConfig> MstInventoryCodeConfig { get; set; }
        public virtual DbSet<PoLookupCodes> PoLookupCodes { get; set; }
        public virtual DbSet<MstTitleSeq> MstTitleSeq { get; set; }

        public virtual DbSet<BmsMstSegment1> BmsMstSegment1 { get; set; }
        public virtual DbSet<BmsMstSegment1TypeCost> BmsMstSegment1TypeCost { get; set; }
        public virtual DbSet<BmsMstSegment2> BmsMstSegment2 { get; set; }
        public virtual DbSet<BmsMstSegment2ProjectType> BmsMstSegment2ProjectType { get; set; }
        public virtual DbSet<BmsMstSegment3> BmsMstSegment3 { get; set; }
        public virtual DbSet<BmsMstSegment4> BmsMstSegment4 { get; set; }
        public virtual DbSet<BmsMstSegment4Group> BmsMstSegment4Group { get; set; }
        public virtual DbSet<BmsMstDepartment> BmsMstDepartment { get; set; }
        public virtual DbSet<BmsMstDivision> BmsMstDivision { get; set; }
        public virtual DbSet<BmsMstSegment5> BmsMstSegment5 { get; set; }
        public virtual DbSet<BmsMstPeriodVersion> BmsMstPeriodVersion { get; set; }
        public virtual DbSet<BmsMstPeriod> BmsMstPeriod { get; set; }
        public virtual DbSet<BmsBudgetPlan> BmsBudgetPlan { get; set; }
        public virtual DbSet<BmsMstExchangeRate> BmsMstExchangeRate { get; set; }
        public virtual DbSet<BmsMstProjectCode12> BmsMstProjectCode12 { get; set; }
        public virtual DbSet<MstAssess> MstAssess { get; set; }
        public virtual DbSet<MstAssessDetail> MstAssessDetail { get; set; }
        public virtual DbSet<MstAssessGroup> MstAssessGroup { get; set; }
        public virtual DbSet<AssessRelationship> AssessRelationship { get; set; }
        public virtual DbSet<DashboardUserFunctions> DashboardUserFunctions { get; set; }
        public virtual DbSet<DashboardFunctions> DashboardFunctions { get; set; }
        public virtual DbSet<BmsBudgetTransferItem> BmsBudgetTransferItem { get; set; }
        public virtual DbSet<BmsTransferBudget> BmsTransferBudget { get; set; }
        public virtual DbSet<BmsTransferAutoNo> BmsTransferAutoNo { get; set; }
        public virtual DbSet<BmsMstStatus> BmsMstStatus { get; set; }
        public virtual DbSet<BmsBudgetUserControl> BmsBudgetUserControl { get; set; }
        public virtual DbSet<BmsMstTransferBudgetType> BmsMstTransferBudgetType { get; set; }
        public virtual DbSet<BmsTransferBudgetLog> BmsTransferBudgetLog { get; set; }
        public virtual DbSet<BmsTransferBudgetHis> BmsTransferBudgetHis { get; set; }
        public virtual DbSet<BmsMstVersion> BmsMstVersion { get; set; }
        public virtual DbSet<BmsBudgetPlanDetail> BmsBudgetPlanDetail { get; set; }

        public tmssDbContext(DbContextOptions<tmssDbContext> options)
            : base(options)
        {
            Database.SetCommandTimeout(600);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<BinaryObject>(b =>
            {
                b.HasIndex(e => new { e.TenantId });
            });

            modelBuilder.Entity<ChatMessage>(b =>
            {
                b.HasIndex(e => new { e.TenantId, e.UserId, e.ReadState });
                b.HasIndex(e => new { e.TenantId, e.TargetUserId, e.ReadState });
                b.HasIndex(e => new { e.TargetTenantId, e.TargetUserId, e.ReadState });
                b.HasIndex(e => new { e.TargetTenantId, e.UserId, e.ReadState });
            });

            modelBuilder.Entity<Friendship>(b =>
            {
                b.HasIndex(e => new { e.TenantId, e.UserId });
                b.HasIndex(e => new { e.TenantId, e.FriendUserId });
                b.HasIndex(e => new { e.FriendTenantId, e.UserId });
                b.HasIndex(e => new { e.FriendTenantId, e.FriendUserId });
            });

            modelBuilder.Entity<Tenant>(b =>
            {
                b.HasIndex(e => new { e.SubscriptionEndDateUtc });
                b.HasIndex(e => new { e.CreationTime });
            });

            modelBuilder.Entity<SubscriptionPayment>(b =>
            {
                b.HasIndex(e => new { e.Status, e.CreationTime });
                b.HasIndex(e => new { PaymentId = e.ExternalPaymentId, e.Gateway });
            });

            modelBuilder.Entity<SubscriptionPaymentExtensionData>(b =>
            {
                b.HasQueryFilter(m => !m.IsDeleted)
                    .HasIndex(e => new { e.SubscriptionPaymentId, e.Key, e.IsDeleted })
                    .IsUnique();
            });

            modelBuilder.Entity<UserDelegation>(b =>
            {
                b.HasIndex(e => new { e.TenantId, e.SourceUserId });
                b.HasIndex(e => new { e.TenantId, e.TargetUserId });
            });

            modelBuilder.ConfigurePersistedGrantEntity();
        }
    }
}
