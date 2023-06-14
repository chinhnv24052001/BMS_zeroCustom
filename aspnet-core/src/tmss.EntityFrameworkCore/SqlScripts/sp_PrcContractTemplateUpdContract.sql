ALTER PROCEDURE [dbo].[sp_PrcContractTemplateUpdContract]
(
	@p_Id BIGINT,
	@p_ContractDate datetime2,
	@p_EffectiveFrom DATETIME2,
	@p_EffectiveTo DATETIME2,
	@p_Description NVARCHAR(255),
	@p_SupplierId BIGINT,
	@p_user nvarchar(255),
	@p_inventory_group_id BIGINT,
	@p_paymenterms_id BIGINT,
	@p_signer nvarchar(255),
	@p_signer_sup nvarchar(255),
	@p_TitleSigner NVARCHAR(255),
	@p_TiitleSignerNcc NVARCHAR(255),
	@p_PlaceOfDelivery NVARCHAR(255),
	@p_Shipment NVARCHAR(255),
	@p_PaidBy NVARCHAR(255),
	@p_Orthers NVARCHAR(255)
)
AS 
UPDATE PrcContractTemplate 
set ContractDate = @p_ContractDate,
    EffectiveFrom = @p_EffectiveFrom,
    EffectiveTo = @p_EffectiveTo,
    Description = @p_Description,
    SupplierId = @p_SupplierId,
    LastModificationTime = getdate(),
    LastModifierUserId = @p_user,
    InventoryGroupId = @p_inventory_group_id,
    PaymentTermsId = @p_paymenterms_id,
    Signer_By = @p_signer,
    SignerBySupplier = @p_signer_sup,
	TitleSigner = @p_TitleSigner,
	TitleSignerNcc = @p_TiitleSignerNcc,
	PlaceOfDelivery = @p_PlaceOfDelivery,
	Shipment = @p_Shipment,
	PaidBy = @p_PaidBy,
	Orthers = @p_Orthers

    WHERE Id = @p_Id;