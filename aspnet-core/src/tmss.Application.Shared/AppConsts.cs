using System;

namespace tmss
{
    /// <summary>
    /// Some consts used in the application.
    /// </summary>
    public class AppConsts
    {
        /// <summary>
        /// Default page size for paged requests.
        /// </summary>
        public const int DefaultPageSize = 10;

        /// <summary>
        /// Maximum allowed page size for paged requests.
        /// </summary>
        public const int MaxPageSize = 1000;

        /// <summary>
        /// Default pass phrase for SimpleStringCipher decrypt/encrypt operations
        /// </summary>
        public const string DefaultPassPhrase = "gsKxGZ012HLL3MI5";

        public const int ResizedMaxProfilPictureBytesUserFriendlyValue = 1024;

        public const int MaxProfilPictureBytesUserFriendlyValue = 5;

        public const string TokenValidityKey = "token_validity_key";
        public const string RefreshTokenValidityKey = "refresh_token_validity_key";
        public const string SecurityStampKey = "AspNet.Identity.SecurityStamp";

        public const string TokenType = "token_type";

        public static string UserIdentifier = "user_identifier";

        public const string ThemeDefault = "default";
        public const string Theme2 = "theme2";
        public const string Theme3 = "theme3";
        public const string Theme4 = "theme4";
        public const string Theme5 = "theme5";
        public const string Theme6 = "theme6";
        public const string Theme7 = "theme7";
        public const string Theme8 = "theme8";
        public const string Theme9 = "theme9";
        public const string Theme10 = "theme10";
        public const string Theme11 = "theme11";

        public const string PurchasePurposeNameDuplicateMessage = "PurchasePurposeNameDuplicateMessage";
        public const string UnitOfMeasureNameDuplicateMessage = "UnitOfMeasureNameDuplicateMessage";
        public const string ValRecordsDelete = "NoRecordsToDelete";

        public const string UR = "UR";
        public const string PR = "PR";
        public const string PO = "PO";
        public const string PC = "PC";
        public const string GR = "GR";
        public const string PM = "PM";//Payment
        public const string AN = "AN";//Annex
        public const string SR = "SR";//Annex
        public const string IV = "IV"; //Invoice
        public const string BD = "BD"; //Backdate
        public const string ErrFindApprovalTree = "ErrFindApprovalTree";
        public const string ErrFindFirstApprovalTreeDetail = "ErrFindFirstApprovalTreeDetail";
        public const string ErrFindApprovalTreeDetail = "ErrFindApprovalTreeDetail";
        public const string ErrFindListApprovalTreeDetail = "ErrFindListApprovalTreeDetail";
        public const string ErrFindUserTreeDetail = "ErrFindUserTreeDetail";
        public const string CreateApprovalStep1Success = "CreateApprovalStep1Success";
        public const string STATUS_NEW = "NEW";
        public const string STATUS_PENDING = "PENDING";
        public const string STATUS_WAITTING = "WAITTING";
        public const string STATUS_APPROVED = "APPROVED";
        public const string STATUS_FORWARD = "FORWARD";
        public const string STATUS_REJECTED = "REJECTED";
        public const string SUBJECT_APPROVAL_TREE = "SUBJECT_APPROVAL_TREE";
        public const string BODY_APPROVAL_TREE = "BODY_APPROVAL_TREE";
        public const string UR_NOT_FOUND = "UR_NOT_FOUND";
        public const string PR_NOT_FOUND = "PR_NOT_FOUND";
        public const string PO_NOT_FOUND = "UR_NOT_FOUND";
        public const string APPROVAL_NATIONAL = "NATIONNAL";
        public const string STATUS_CANCEL = "Cancel";


        public static TimeSpan AccessTokenExpiration = TimeSpan.FromDays(1);
        public static TimeSpan RefreshTokenExpiration = TimeSpan.FromDays(365);

        public const string DateTimeOffsetFormat = "yyyy-MM-ddTHH:mm:sszzz";

        public const long DEFAULT_ORG_ID = 62;
        public const long DEFAULT_SHIP_LOCATION_ID = 21;
        public const long DEFAULT_BILL_LOCATION_ID = 43;

        //STATUS
        public const string STATUS_INCOMPLETE = "INCOMPLETE";
        public const string STATUS_IN_PROCESS = "IN PROCESS";
        public const string STATUS_SKIP = "SKIP";

        //PR
        public const string TYPE_LOOKUP_CODE = "PURCHASE";
        public const string TYPE_LOOKUP_CODE_CONTRACT = "CONTRACT";
        public const string ORDER_TYPE_LOOKUP_CODE_AMOUNT = "AMOUNT";
        public const string ORDER_TYPE_LOOKUP_CODE_QUANTITY = "QUANTITY";
        public const string MATCHING_BASIS = "QUANTITY ";
        public const string LINE_TYPE_GOODS = "GOODS ";
        public const string SOURCE_TYPE = "VENDOR ";

        //PO
        public const string PRICE_TYPE_LOOKUP_CODE = "VARIABLE";
        public const string TYPE_LOOKUP_CODE_PO = "STANDARD";
        public const string CURRENCY_CODE_VND = "VND";
        public const string CURRENCY_CODE_USD = "USD";
        public const long TERMS_ID_DEFAULT = 10061;
        public const string TERMS_PAID_BY = "T/T (tele transfer)";
        public const string TERMS_OTHER = "VAT Excluded";


        public const string STATUS_N = "N";
        public const string STATUS_Y = "Y";
        public const string SEND_EMAIL_TO_SUPPLIER_CONTACT_CREATE_ACCOUNT = "SEND_EMAIL_TO_SUPPLIER_CONTACT_CREATE_ACCOUNT";
        public const string SEND_EMAIL_TO_SUPPLIER_CONTACT_RESET_PASSWORD = "SEND_EMAIL_TO_SUPPLIER_CONTACT_RESET_PASSWORD";
        public const string ACCOUNT_INFORMATION = "ACCOUNT INFORMATION";
        public const string DUPLICATE_NAME = "DUPLICATE_NAME";
        public const string DUPLICATE_CODE = "DUPLICATE_CODE";
        public const string InActive = "InActive";
        public const string Active = "Active";

        public const long C_APPROVE_STEP_INTERNAL_DEPARTMENT = 1;
        public const long C_APPROVE_STEP_OTHER_DEPARTMENT = 2;
        public const long C_APPROVE_STEP_CHECK_BUDGET = 3;

        public const string SEND_APPROVAL_REQUEST = "SEND_APPROVAL_REQUEST";
        public const string REPLY_APPROVAL_REQUEST = "REPLY_APPROVAL_REQUEST";
    }
}
