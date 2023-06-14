ALTER PROC [dbo].[sp_PrSearchPr]
	@RequisitionNo varchar(50),
	@PreparerId varchar(255),
	@BuyerId varchar(255),
	@FromDate datetime2(7),
	@ToDate datetime2(7),
	@InventoryGroupId bigint,
	@Status varchar(20),
	@UserId BIGINT,
	@IsInternal BIT,
	@MaxResultCount BIGINT,
	@SkipCount BIGINT
AS
BEGIN
	select 
		headers.Id,
		headers.RequisitionNo,
		headers.Description,
		headers.AuthorizationStatus,
		isnull(PriceLine.TotalPrice, 0) AS TotalPrice,
		users.Name AS PreparerName,
		headers.CreationTime,
		'VND' AS Currency,
		headers.DepartmentApprovalName,
		groups.ProductGroupName,
		headers.CreatorUserId,
		(
            SELECT step.RequestNote + ',' AS [text()]
            FROM RequestApprovalStep step WITH (NOLOCK)
            WHERE step.ReqId = headers.Id and step.ProcessTypeCode = 'PR'
            FOR XML PATH ('')
        ) RequestNote,
		(
            SELECT step.ReplyNote + ',' AS [text()]
            FROM RequestApprovalStep step WITH (NOLOCK)
            WHERE step.ReqId = headers.Id and step.ProcessTypeCode = 'PR'
            FOR XML PATH ('')
        ) ReplyNote,
		COUNT(headers.Id) OVER() AS TotalCount
	from PrRequisitionHeaders headers
	left join AbpUsers users on headers.PreparerId = users.Id
	left join MstLookup lookStatus on headers.AuthorizationStatus = lookStatus.LookupCode and lookStatus.LookupType = 'AUTHORIZATION STATUS'
	left JOIN AbpUsers US ON US.Id = headers.CreatorUserId AND headers.IsDeleted = 0
	left join MstInventoryGroup groups on headers.InventoryGroupId = groups.Id and groups.IsDeleted = 0
	left join (
		select sum(isnull(line.UnitPrice, 0) * isnull(line.Quantity, 0)) TotalPrice, PrRequisitionHeaderId
		from PrRequisitionLines line
		Group by PrRequisitionHeaderId
	) PriceLine on headers.Id = PriceLine.PrRequisitionHeaderId
	where (ISNULL(@RequisitionNo, '') = '' OR UPPER(headers.RequisitionNo) LIKE '%' + UPPER(@RequisitionNo) + '%')
		AND (ISNULL(@FromDate, '') = '' OR CAST(headers.CreationTime AS DATE) >= CAST(@FromDate AS DATE))
		AND (ISNULL(@ToDate, '') = '' OR CAST(headers.CreationTime AS DATE) <= CAST(@ToDate AS DATE))
		AND (ISNULL(@PreparerId, 0) = 0 OR headers.PreparerId = @PreparerId)
		AND (ISNULL(@InventoryGroupId, 0) = 0 OR headers.InventoryGroupId = @InventoryGroupId)
		AND (ISNULL(@Status, '') = '' OR headers.AuthorizationStatus = @Status)
		and headers.IsDeleted = 0
		and headers.RequisitionNo is not null
	ORDER BY headers.CreationTime DESC
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;
END