ALTER PROCEDURE [dbo].[sp_PrcContractTemplateSearch] 
	@p_contract_no NVARCHAR(50),
	@p_eff_from DATE,
	@p_eff_to DATE,
	@p_appendix_no NVARCHAR(50),
	@p_approve_by NVARCHAR(240),
	@p_approve_status NVARCHAR(240),
	@InventoryGroupId bigint,
	@SupplierId bigint
AS
BEGIN
  SELECT
    a.Id
   ,a.Id ContractId
   ,a.ContractNo
   ,a.ContractDate
   ,a.EffectiveFrom
   ,a.EffectiveTo
   ,a.SupplierId
   ,ms.SupplierName
   ,a.Description
   ,a.ApprovalStatus
   ,a.TotalAmount
   ,a.DepartmentApprovalName
   ,a.ApproveName
   ,a.Signer_By
   ,a.SignerBySupplier Signer_By_Suplier
   ,a.InventoryGroupId
   ,mig.ProductGroupName
   ,a.PaymentTermsId
   ,mpt.Name PaymentermsName
    ,a.TitleSigner
	, a.TitleSignerNcc
	, a.PlaceOfDelivery
	, a.Shipment
	, a.PaidBy
	, a.Orthers
  FROM PrcContractTemplate a
  LEFT JOIN PrcAppendixContract b
    ON a.Id = b.ContractId
  LEFT JOIN AbpUsers au
    ON au.Id = a.ApproveBy
  LEFT JOIN MstSuppliers ms
    ON ms.Id = a.SupplierId
    left join MstInventoryGroup mig
    ON mig.Id = a.InventoryGroupId
    left join MstPaymentTerms mpt ON mpt.Id = a.PaymentTermsId
  WHERE (ISNULL(@p_contract_no, '') = ''
  OR a.ContractNo LIKE CONCAT('%', @p_contract_no, '%'))
  AND (@p_eff_from IS NULL
  OR a.EffectiveFrom >= @p_eff_from)
  AND (@p_eff_to IS NULL
  OR a.EffectiveTo < DATEADD(DAY, 1, @p_eff_to))
  AND (ISNULL(@p_appendix_no, '') = ''
  OR b.AppendixNo LIKE CONCAT('%', @p_appendix_no, '%'))
  AND (ISNULL(@p_approve_by, '') = ''
  OR au.Name LIKE CONCAT('%', @p_approve_by, '%'))
  AND (ISNULL(@p_approve_status, '') = ''
  OR a.ApprovalStatus = @p_approve_status)
  and (isnull(@InventoryGroupId, 0) = 0  or a.InventoryGroupId = @InventoryGroupId)
    and (isnull(@SupplierId, 0) = 0  or a.SupplierId = @SupplierId)
  AND  a.IsDeleted = 0
  GROUP BY a.Id
          ,a.ContractNo
          ,a.ContractDate
          ,a.EffectiveFrom
          ,a.EffectiveTo
          ,a.SupplierId
          ,ms.SupplierName
          ,a.Description
          ,a.ApprovalStatus
          ,a.TotalAmount
          ,a.DepartmentApprovalName
          ,a.ApproveName
          ,a.Signer_By
		  ,a.SignerBySupplier
          ,a.InventoryGroupId
          ,mig.ProductGroupName
         ,a.PaymentTermsId
         ,mpt.Name
		,a.TitleSigner
	, a.TitleSignerNcc
	, a.PlaceOfDelivery
	, a.Shipment
	, a.PaidBy
	, a.Orthers
  ORDER BY a.ContractDate DESC;
  END