using Abp.Application.Editions;
using Abp.Application.Features;
using Abp.Auditing;
using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.DynamicEntityProperties;
using Abp.EntityHistory;
using Abp.Localization;
using Abp.Notifications;
using Abp.Organizations;
using Abp.UI.Inputs;
using Abp.Webhooks;
using AutoMapper;
using tmss.Auditing.Dto;
using tmss.Authorization.Accounts.Dto;
using tmss.Authorization.Delegation;
using tmss.Authorization.Permissions.Dto;
using tmss.Authorization.Roles;
using tmss.Authorization.Roles.Dto;
using tmss.Authorization.Users;
using tmss.Authorization.Users.Delegation.Dto;
using tmss.Authorization.Users.Dto;
using tmss.Authorization.Users.Importing.Dto;
using tmss.Authorization.Users.Profile.Dto;
using tmss.BMS.Master.BmsPeriod.Dto;
using tmss.BMS.Master.Period;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment1.Dto;
using tmss.BMS.Master.Segment2;
using tmss.BMS.Master.Segment2.Dto;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Segment3.Dto;
using tmss.BMS.Master.Segment4;
using tmss.BMS.Master.Segment4.Dto;
using tmss.BMS.Master.Segment5;
using tmss.BMS.Master.Segment5.Dto;
using tmss.Chat;
using tmss.Chat.Dto;
using tmss.Core.BMS.Master.Period;
using tmss.DynamicEntityProperties.Dto;
using tmss.Editions;
using tmss.Editions.Dto;
using tmss.Friendships;
using tmss.Friendships.Cache;
using tmss.Friendships.Dto;
using tmss.GR;
using tmss.GR.Dto;
using tmss.Localization.Dto;
using tmss.Master;
using tmss.Master.Assess.Dto;
using tmss.Master.CancelReason.Dto;
using tmss.Master.ContractTemplate.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.InventoryItemPrices.Dto;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.PurchasePurpose.Dto;
using tmss.Master.SupplierRequest.Dto;
using tmss.Master.UnitOfMeasure.Dto;
using tmss.MultiTenancy;
using tmss.MultiTenancy.Dto;
using tmss.MultiTenancy.HostDashboard.Dto;
using tmss.MultiTenancy.Payments;
using tmss.MultiTenancy.Payments.Dto;
using tmss.Notifications.Dto;
using tmss.Organizations.Dto;
using tmss.PaymentModule.InvoiceAdjusted.Dto;
using tmss.PaymentModule.Invoices;
using tmss.PaymentModule.Invoices.Dto;
using tmss.PaymentModule.InvTncApInterface;
using tmss.PaymentModule.Payment;
using tmss.PaymentModule.Payment.Dto;
using tmss.PaymentModule.Prepayment.Dto;
using tmss.PO;
using tmss.PO.PurchaseOrders.Dto;
using tmss.PR;
using tmss.PR.PurchasingRequest.Dto;
using tmss.Sessions.Dto;
using tmss.UR.UserRequestManagement.Dto;
using tmss.WebHooks.Dto;

namespace tmss
{
    internal static class CustomDtoMapper
    {
        public static void CreateMappings(IMapperConfigurationExpression configuration)
        {
            //Inputs
            configuration.CreateMap<CheckboxInputType, FeatureInputTypeDto>();
            configuration.CreateMap<SingleLineStringInputType, FeatureInputTypeDto>();
            configuration.CreateMap<ComboboxInputType, FeatureInputTypeDto>();
            configuration.CreateMap<IInputType, FeatureInputTypeDto>()
                .Include<CheckboxInputType, FeatureInputTypeDto>()
                .Include<SingleLineStringInputType, FeatureInputTypeDto>()
                .Include<ComboboxInputType, FeatureInputTypeDto>();
            configuration.CreateMap<StaticLocalizableComboboxItemSource, LocalizableComboboxItemSourceDto>();
            configuration.CreateMap<ILocalizableComboboxItemSource, LocalizableComboboxItemSourceDto>()
                .Include<StaticLocalizableComboboxItemSource, LocalizableComboboxItemSourceDto>();
            configuration.CreateMap<LocalizableComboboxItem, LocalizableComboboxItemDto>();
            configuration.CreateMap<ILocalizableComboboxItem, LocalizableComboboxItemDto>()
                .Include<LocalizableComboboxItem, LocalizableComboboxItemDto>();

            //Chat
            configuration.CreateMap<ChatMessage, ChatMessageDto>();
            configuration.CreateMap<ChatMessage, ChatMessageExportDto>();

            //Feature
            configuration.CreateMap<FlatFeatureSelectDto, Feature>().ReverseMap();
            configuration.CreateMap<Feature, FlatFeatureDto>();

            //Role
            configuration.CreateMap<RoleEditDto, Role>().ReverseMap();
            configuration.CreateMap<Role, RoleListDto>();
            configuration.CreateMap<UserRole, UserListRoleDto>();

            

            //Edition
            configuration.CreateMap<EditionEditDto, SubscribableEdition>().ReverseMap();
            configuration.CreateMap<EditionCreateDto, SubscribableEdition>();
            configuration.CreateMap<EditionSelectDto, SubscribableEdition>().ReverseMap();
            configuration.CreateMap<SubscribableEdition, EditionInfoDto>();

            configuration.CreateMap<Edition, EditionInfoDto>().Include<SubscribableEdition, EditionInfoDto>();

            configuration.CreateMap<SubscribableEdition, EditionListDto>();
            configuration.CreateMap<Edition, EditionEditDto>();
            configuration.CreateMap<Edition, SubscribableEdition>();
            configuration.CreateMap<Edition, EditionSelectDto>();


            //Payment
            configuration.CreateMap<SubscriptionPaymentDto, SubscriptionPayment>().ReverseMap();
            configuration.CreateMap<SubscriptionPaymentListDto, SubscriptionPayment>().ReverseMap();
            configuration.CreateMap<SubscriptionPayment, SubscriptionPaymentInfoDto>();
            configuration.CreateMap<PaymentHeaders, PaymentHeadersDto>().ReverseMap();
            configuration.CreateMap<PaymentHeaders, PaymentHeadersDto>();
            configuration.CreateMap<PaymentHeaders, InputPaymentHeadersDto>().ReverseMap();
            configuration.CreateMap<PaymentFromSuppliers, InputPaymentFromSuppliersDto>().ReverseMap();
            configuration.CreateMap<PaymentLines, PaymentLinesDto>();
            configuration.CreateMap<PaymentLines, PaymentLinesDto>().ReverseMap();
            configuration.CreateMap<PaymentLines, InputPaymentLinesDto>().ReverseMap();
            configuration.CreateMap<PaymentAttachmentsDto, PaymentAttachments>();
            configuration.CreateMap<PaymentFromSupplierAttachmentsDto, PaymentFromSupplierAttachments>();
            configuration.CreateMap<InvTncApInterface, InvTncApInterfaceDto>();
            configuration.CreateMap<InvTncApInterface, InvTncApInterfaceDto>().ReverseMap();

            configuration.CreateMap<InvoiceHeaders, InvoiceHeadersDto>();
            configuration.CreateMap<InvoiceHeaders, InvoiceHeadersDto>().ReverseMap();
            configuration.CreateMap<InvoiceLines, InvoiceLinesDto>();
            configuration.CreateMap<InvoiceLines, InvoiceLinesDto>().ReverseMap();

            configuration.CreateMap<PaymentPrepayment, PaymentPrepaymentDto>().ReverseMap();

            //Permission
            configuration.CreateMap<Permission, FlatPermissionDto>();
            configuration.CreateMap<Permission, FlatPermissionWithLevelDto>();

            //Language
            configuration.CreateMap<ApplicationLanguage, ApplicationLanguageEditDto>();
            configuration.CreateMap<ApplicationLanguage, ApplicationLanguageListDto>();
            configuration.CreateMap<NotificationDefinition, NotificationSubscriptionWithDisplayNameDto>();
            configuration.CreateMap<ApplicationLanguage, ApplicationLanguageEditDto>()
                .ForMember(ldto => ldto.IsEnabled, options => options.MapFrom(l => !l.IsDisabled));

            //Tenant
            configuration.CreateMap<Tenant, RecentTenant>();
            configuration.CreateMap<Tenant, TenantLoginInfoDto>();
            configuration.CreateMap<Tenant, TenantListDto>();
            configuration.CreateMap<TenantEditDto, Tenant>().ReverseMap();
            configuration.CreateMap<CurrentTenantInfoDto, Tenant>().ReverseMap();

            //User
            configuration.CreateMap<User, UserEditDto>()
                .ForMember(dto => dto.Password, options => options.Ignore())
                .ReverseMap()
                .ForMember(user => user.Password, options => options.Ignore());
            configuration.CreateMap<User, UserLoginInfoDto>();
            configuration.CreateMap<User, UserListDto>();
            configuration.CreateMap<User, ChatUserDto>();
            configuration.CreateMap<User, OrganizationUnitUserListDto>();
            configuration.CreateMap<Role, OrganizationUnitRoleListDto>();
            configuration.CreateMap<CurrentUserProfileEditDto, User>().ReverseMap();
            configuration.CreateMap<UserLoginAttemptDto, UserLoginAttempt>().ReverseMap();
            configuration.CreateMap<ImportUserDto, User>();

            //AuditLog
            configuration.CreateMap<AuditLog, AuditLogListDto>();
            configuration.CreateMap<EntityChange, EntityChangeListDto>();
            configuration.CreateMap<EntityPropertyChange, EntityPropertyChangeDto>();

            //Friendship
            configuration.CreateMap<Friendship, FriendDto>();
            configuration.CreateMap<FriendCacheItem, FriendDto>();

            //OrganizationUnit
            configuration.CreateMap<OrganizationUnit, OrganizationUnitDto>();

            //Webhooks
            configuration.CreateMap<WebhookSubscription, GetAllSubscriptionsOutput>();
            configuration.CreateMap<WebhookSendAttempt, GetAllSendAttemptsOutput>()
                .ForMember(webhookSendAttemptListDto => webhookSendAttemptListDto.WebhookName,
                    options => options.MapFrom(l => l.WebhookEvent.WebhookName))
                .ForMember(webhookSendAttemptListDto => webhookSendAttemptListDto.Data,
                    options => options.MapFrom(l => l.WebhookEvent.Data));

            configuration.CreateMap<WebhookSendAttempt, GetAllSendAttemptsOfWebhookEventOutput>();

            configuration.CreateMap<DynamicProperty, DynamicPropertyDto>().ReverseMap();
            configuration.CreateMap<DynamicPropertyValue, DynamicPropertyValueDto>().ReverseMap();
            configuration.CreateMap<DynamicEntityProperty, DynamicEntityPropertyDto>()
                .ForMember(dto => dto.DynamicPropertyName,
                    options => options.MapFrom(entity => entity.DynamicProperty.DisplayName ?? entity.DynamicProperty.PropertyName));
            configuration.CreateMap<DynamicEntityPropertyDto, DynamicEntityProperty>();

            configuration.CreateMap<DynamicEntityPropertyValue, DynamicEntityPropertyValueDto>().ReverseMap();
            
            //User Delegations
            configuration.CreateMap<CreateUserDelegationDto, UserDelegation>();

            /* ADD YOUR OWN CUSTOM AUTOMAPPER MAPPINGS HERE */
            //Master
            configuration.CreateMap<InputPurchasePurposeDto, MstPurchasePurpose>();
            configuration.CreateMap<InputCancelReasonDto, MstCancelReason>();
            configuration.CreateMap<UnitOfMeasureDto, MstUnitOfMeasureAppService>();
            configuration.CreateMap<MstInventoryGroup, MstInventoryGroupDto>();
            configuration.CreateMap<MstInventoryGroup, MstInventoryGroupDto>().ReverseMap();
            configuration.CreateMap<MstInventoryItems, MstInventoryItemsDto>();
            configuration.CreateMap<MstInventoryItems, MstInventoryItemsDto>().ReverseMap();
            configuration.CreateMap<MstInventoryItemPrices, MstInventoryItemPricesDto>();
            configuration.CreateMap<MstInventoryItemPrices, MstInventoryItemPricesDto>().ReverseMap();

            //Pr
            configuration.CreateMap<InputPurchaseRequestHeaderDto, PrRequisitionHeaders>();
            configuration.CreateMap<InputPurchaseRequestLineDto, PrRequisitionLines>();
            configuration.CreateMap<GetMstInventoryItemsDto, PrRequisitionLines>();
            configuration.CreateMap<GetListItemsForImportPrDto, PrRequisitionLines>();
            configuration.CreateMap<GetAllUserRequestForPrDto, InputPurchaseRequestLineDto>();
            configuration.CreateMap<InputInvoiceAdjustedHeadersDto, InvoiceAdjustedHeaders>();
            configuration.CreateMap<InputInvoiceAdjustedLinesDto, InvoiceAdjustedLines>();

            configuration.CreateMap<InvoiceAdjustedHeaders, InputInvoiceAdjustedHeadersDto>();
            configuration.CreateMap<InvoiceAdjustedLines, InputInvoiceAdjustedLinesDto>();

            //po
            configuration.CreateMap<InputPurchaseOrdersHeadersDto, PoHeaders>();
            configuration.CreateMap<InputPurchaseOrderLinesDto, PoLines>();
            configuration.CreateMap<InputPurchaseOrdersShipmentsDto, PoLineShipments>();
            configuration.CreateMap<InputPurchaseOrdersDistributionsDto, PoDistributions>();
            configuration.CreateMap<PoImportPurchaseOrderDto, PoImportPurchaseOrderTemp>();
            configuration.CreateMap<GetPrDistributionsForCreatePoDto, InputPurchaseOrdersDistributionsDto>();
            configuration.CreateMap<GetPurchaseRequestForCreatePODto, InputPurchaseOrderLinesDto>();
            configuration.CreateMap<GetAllUserRequestForPrDto, InputPurchaseOrderLinesDto>();

            //Rcv 
            configuration.CreateMap<InputRcvReceiptNoteHeadersDto, RcvReceiptNoteHeaders>();
            configuration.CreateMap<InputRcvReceiptNoteLinesDto, RcvReceiptNoteLines>();
            configuration.CreateMap<RcvShipmentAttachmentsDto, RcvShipmentAttachments>();
            configuration.CreateMap<GetExpectedReceiptNoteLinesDto, RcvReceiptNoteLines>();
            configuration.CreateMap<SupplierRequestInfoDto, MstSupplierRequest>();
            configuration.CreateMap<MstSupplierRequest,SupplierRequestInfoDto>();

            configuration.CreateMap<InputRcvShipmentHeadersDto, RcvShipmentHeaders>();
            configuration.CreateMap<InputRcvShipmentLinesDto, RcvShipmentLines>();
            configuration.CreateMap<GetRcvReceiptNoteLineForEditDto, RcvShipmentLines>().ReverseMap();
            configuration.CreateMap<GetRcvShipmentHeaderForViewDto, RcvShipmentHeaders>().ReverseMap();

            configuration.CreateMap<InputContractTemplateDto, MstContractTemplate>();
            configuration.CreateMap<ImportPrDto, PrImportPrTemp>();
            configuration.CreateMap<ImportPrDetailTempDto, PrImportPrDetailTemp>();

            /* User Request */
            configuration.CreateMap<CreateOrEditUserRequestInputDto, UserRequest>().ReverseMap();
            configuration.CreateMap<GetAllProductsForViewDto, UserRequestDetail>().ReverseMap();

            /*Bms */
            configuration.CreateMap<InputSegment1Dto, BmsMstSegment1>();
            configuration.CreateMap<InputSegment2Dto, BmsMstSegment2>();
            configuration.CreateMap<InputSegment3Dto, BmsMstSegment3>();
            configuration.CreateMap<InputSegment4Dto, BmsMstSegment4>();
            configuration.CreateMap<InputSegment5Dto, BmsMstSegment5>();
            configuration.CreateMap<InputBmsMstPeriodDto, BmsMstPeriod>();
            configuration.CreateMap<InputPeriodVersionDto, BmsMstPeriodVersion>();

            configuration.CreateMap<AssessInfoDto, MstAssess>().ReverseMap();
            configuration.CreateMap<AssessDetailInfoDto, MstAssessDetail>().ReverseMap();

            configuration.CreateMap<AssessGroupInfoDto, MstAssessGroup>().ReverseMap();
        }
    }
}
