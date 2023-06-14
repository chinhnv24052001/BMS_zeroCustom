namespace tmss.GR.Enum
{
    public enum Status : byte
    {
        Yes = 1,
        No = 0
    }

    public enum GenSeqType : byte
    {
        UserRequest = 0,
        PurchasingRequest = 1,
        PurchasingOrder = 2,
        ReceiptNote = 3,
        Receipt = 4,
        Annex = 5,
        PaymentRequest = 6,
        ContractBackdate = 7,
        PaymentFromSupplier = 8,
        SupplierRequest = 9
    }

    public enum EInvStatus : byte
    {
       New = 0, //Inv bị thiếu số PO => ko match đc 
       Matched = 1, //đã đc match thủ công hoặc match tự động
       Paid = 2, //đã đc làm payment request 
       Cancel = 3 //Hủy hóa đơn
    }

    public enum EInvErrorStatus : byte
    {
        None = 0,
        NotMatchedName = 1,  // Không match tên item trên inv với tên ncc đc config trong master 
        NotMatchedAmtPO = 2, // Không match amt với PO
        NotMachedQtyRcv = 3, // Không match qty với Receiving 
        
    }
    public enum EInvMatchedStatus : byte
    {
        New = 0,
        AutoMatched = 1, // Auto Matched by the job 
        UnMatched = 2,  // UnMatched by Users
        ReMatched = 3,  // Matched Manually by Users 
    }

    public enum PaymentStatus : byte
    {
        New = 0,
        Paid = 1, // Paid
        Cancel = 2,  // Cancel
    }
    public enum InvoiceEnum
    {
        Fpt = 1,
        Vnpt = 2,
        QdtInv = 3,
        //Qdt = 4,
    }
}
