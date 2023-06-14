export class AppConsts {

    static readonly tenancyNamePlaceHolderInUrl = '{TENANCY_NAME}';

    static remoteServiceBaseUrl: string;
    static remoteServiceBaseUrlFormat: string;
    static appBaseUrl: string;
    static appBaseHref: string; // returns angular's base-href parameter value if used during the publish
    static appBaseUrlFormat: string;
    static recaptchaSiteKey: string;
    static subscriptionExpireNootifyDayCount: number;

    static localeMappings: any = [];

    static readonly userManagement = {
        defaultAdminUserName: 'admin'
    };

    static readonly localization = {
        defaultLocalizationSourceName: 'tmss'
    };

    static readonly authorization = {
        encrptedAuthTokenName: 'enc_auth_token'
    };

    static readonly grid = {
        defaultPageSize: 10
    };

    static readonly MinimumUpgradePaymentAmount = 1;

    /// <summary>
    /// Gets current version of the application.
    /// It's also shown in the web page.
    /// </summary>
    static readonly WebAppGuiVersion = '10.2.0';
    static readonly CPS_KEYS = {
        Saved_Successfully: 'SavedSuccessfullyModal',
        Successfully_Deleted: 'Successfully Deleted',
        Are_You_Sure: 'AreYouSureModal',
        Please_Select_1_Line_To_Edit: 'PleaseSelect1LineToEdit',
        Please_Select_1_Line_To_Delete: 'PleaseSelect1LineToDelete',
        Please_Select_1_Line_To_SetUp: 'PleaseSelect1LineToSetUp',
        Please_Select_1_Line_To_SetDown: 'PleaseSelect1LineToSetDown',
        ResetPassWord_Successfully: 'ResetPassWordSuccessfully',
        Edit_Info_Successfully: 'EditInfoSuccessfully',
        Create_Account_Successfully: 'CreateAccountSuccessfully',
        Account_Already_Xists: 'AccountAlreadyXists',
        Account_Does_Not_Exist: 'AccountDoesNotExist',

        This_Row_Is_The_First: 'ThisRowIsTheFirst',
        This_Row_Is_The_Last: 'ThisRowIsTheLast',
        Add_Approval_Detail_Success: 'AddApprovalDetailSuccess',

        TYPE_PR: 'PR',
        TYPE_UR: 'UR',
        TYPE_PC: 'PC',

        Please_Select_1_Line_In_List_Supplier_Site_To_Add_Contact: 'PleaseSelect1LineInListSupplierSiteToAddContact',
        Please_Select_1_Line_In_List_Contact_To_Reset_Password: 'PleaseSelect1LineInListContactToResetPassword',
        DUPLICATE_NAME: 'DUPLICATE_NAME',
        DUPLICATE_CODE: 'DUPLICATE_CODE',
        Please_Select_1_Line: 'PleaseSelect1Line',
        STATUS_NOT_MATHCHED: 'Not Matched',
        STATUS_MATHCHED: 'Matched',
        INV_SRC_AUTOMATIC: 'Automatic',
        INV_SRC_MANUAL: 'Manual'
    }

    static readonly STORAGE_KEYS = {
        OPEN_TABS:            'OPEN_TABS', // Value [{ name: string, code: string, params: {}, active: boolean }, {}, {}...]
        CURRENT_TAB:          'CURRENT_TAB',
        CURRENT_MENU_GROUP:   'CURRENT_MENU_GROUP',
        CurrentTenant: 'CurrentTenant',
    }
}
