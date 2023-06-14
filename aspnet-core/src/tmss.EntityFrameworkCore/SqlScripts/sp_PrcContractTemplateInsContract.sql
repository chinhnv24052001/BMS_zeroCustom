ALTER PROCEDURE [dbo].[sp_PrcContractTemplateInsContract]
(
	@p_ContractNo NVARCHAR(50),
	@p_ContractDate datetime2,
	@p_EffectiveFrom DATETIME2,
	@p_EffectiveTo DATETIME2,
	@p_Description NVARCHAR(255),
	@p_SupplierId BIGINT,
	@p_user nvarchar(255),
	@p_signer nvarchar(255), 
	@p_signer_sup nvarchar(255),
	@p_inventory_group_id BIGINT,
	@p_paymenterms_id BIGINT,
	 @p_TitleSigner NVARCHAR(255),
	 @p_TiitleSignerNcc NVARCHAR(255),
	 @p_PlaceOfDelivery NVARCHAR(255),
	 @p_Shipment NVARCHAR(255),
	 @p_PaidBy NVARCHAR(255),
	 @p_Orthers NVARCHAR(255)
)
AS 

	declare @CountContract int;
	declare @IdContract bigint;

	select @IdContract = Id
	from PrcContractTemplate
	where ContractNo = @p_ContractNo
	GROUP BY Id

	IF @IdContract is null
	BEGIN
		INSERT INTO PrcContractTemplate 
		(
		ContractNo,
		ContractDate,
		EffectiveFrom,
		EffectiveTo,
		Description,
		SupplierId,
		ApprovalStatus,
		CreationTime, 
		CreatorUserId,
		IsDeleted,
		Signer_By,
		SignerBySupplier,
		InventoryGroupId,
		PaymentTermsId,
		TitleSigner, 
		TitleSignerNcc,
		PlaceOfDelivery,
		Shipment,
		PaidBy,
		Orthers)
  VALUES (
		@p_ContractNo,
		@p_ContractDate,
		@p_EffectiveFrom,
		@p_EffectiveTo,
		@p_Description,
		@p_SupplierId,
		'INCOMPLETE',
		getdate(),
		@p_user,
		0,
		@p_signer,
		@p_signer_sup,
		@p_inventory_group_id,
		@p_paymenterms_id,
		@p_TitleSigner,
		@p_TiitleSignerNcc,
		@p_PlaceOfDelivery,
		@p_Shipment,
		@p_PaidBy,
		@p_Orthers
		);

	select @IdContract = Id
	from PrcContractTemplate
	where ContractNo = @p_ContractNo
		--select @IdContract = SCOPE_IDENTITY();
	END

	select @IdContract AS Id;