ALTER PROC [dbo].[sp_PoGetListPoForAddPrToPoLine]
	@PoNumber varchar(100)
AS
BEGIN
	select 
		poHeaders.Id,
		Segment1 AS PoNumber,
		supplier.SupplierName,
		poHeaders.Comments Descriptions
	from PoHeaders poHeaders
	left join MstSuppliers supplier on poHeaders.VendorId = supplier.Id
	where poHeaders.IsDeleted = 0
	and AuthorizationStatus <> 'APPROVED'
	AND (ISNULL(@PoNumber, '') = '' OR UPPER(Segment1) LIKE '%' + UPPER(@PoNumber) + '%')
	order by poHeaders.id desc
END
