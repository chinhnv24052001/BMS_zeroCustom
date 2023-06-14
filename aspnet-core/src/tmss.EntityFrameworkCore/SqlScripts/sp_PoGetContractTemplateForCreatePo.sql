create proc sp_PoGetContractTemplateForCreatePo
	@InventoryGroupId bigint
AS 
BEGIN
	select *
	from PrcContractTemplate
	where (EffectiveFrom IS NULL OR EffectiveFrom <= GETDATE())
		and (EffectiveTo IS NULL OR EffectiveTo >= GETDATE())
		and InventoryGroupId = @InventoryGroupId
	order by CreationTime desc
END