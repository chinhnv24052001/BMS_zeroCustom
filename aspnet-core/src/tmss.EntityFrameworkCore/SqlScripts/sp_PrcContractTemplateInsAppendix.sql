ALTER PROCEDURE [dbo].[sp_PrcContractTemplateInsAppendix]
(
@p_AppendixNo NVARCHAR(250),
@p_AppendixDate datetime2,
@p_EffectiveFrom DATETIME2,
@p_EffectiveTo DATETIME2,
@p_Description NVARCHAR(255),
@p_ContractId BIGINT,
@p_user nvarchar(255),
@p_Signer_By nvarchar(50),
@p_Signer_By_Sup nvarchar(50),
@p_seqNo nvarchar(255),
 @p_TitleSigner NVARCHAR(255),
 @p_TiitleSignerNcc NVARCHAR(255),
 @p_PlaceOfDelivery NVARCHAR(255),
 @p_Shipment NVARCHAR(255),
 @p_PaidBy NVARCHAR(255),
 @p_Orthers NVARCHAR(255)
)
AS 

INSERT INTO PrcAppendixContract 
(AppendixNo, AppendixDate, EffectiveFrom, EffectiveTo, Description, ContractId,
 ApprovalStatus, TotalAmount, CreationTime, CreatorUserId, IsDeleted, Signer_By, SignerBySupplier, SeqNo, TitleSigner, TitleSignerNcc, PlaceOfDelivery, Shipment, PaidBy, Orthers)
  VALUES (@p_AppendixNo, @p_AppendixDate, @p_EffectiveFrom, @p_EffectiveTo, @p_Description,
  @p_ContractId, 'INCOMPLETE',0, getdate(), @p_user, 0, @p_Signer_By, @p_Signer_By_Sup, @p_seqNo, @p_TitleSigner, @p_TiitleSignerNcc, @p_PlaceOfDelivery, @p_Shipment, @p_PaidBy, @p_Orthers);

SELECT SCOPE_IDENTITY() AS Id;