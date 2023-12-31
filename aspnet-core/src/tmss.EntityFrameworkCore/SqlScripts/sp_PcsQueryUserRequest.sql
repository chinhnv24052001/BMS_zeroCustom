USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PcsQueryUserRequest]    Script Date: 4/26/2023 11:17:03 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_PcsQueryUserRequest]
(
	@URNumber NVARCHAR(50),
	@InventoryGroupId BIGINT,
	@Status NVARCHAR(25),
	@EffectFrom DATETIME2(7),
	@EffectTo DATETIME2(7),
	@UserId BIGINT,
	@PicUserId BIGINT,
	@MaxResultCount BIGINT,
	@SkipCount BIGINT
)
WITH RECOMPILE
AS
BEGIN
	SELECT
		UR.Id
		,UR.UserRequestNumber
		,UR.UserRequestName
		,UR.CreationTime AS RequestDate
		,US.Name AS RequestUser
		,UR.CreatorUserId AS CreatorUserId
		,DEPART.Name AS DepartmentName
		,UR.ApprovalStatus
		,UR.DepartmentApprovalName
		,UR.CheckBudgetStatus
		,UR.TotalPrice
		,CUR.CurrencyCode
		,INVG.ProductGroupName
		,COUNT(UR.Id) OVER() AS TotalCount
		,(
			SELECT step.RequestNote + ',' AS [text()]
			FROM RequestApprovalStep step WITH (NOLOCK)
			WHERE step.ReqId = UR.Id and step.ProcessTypeCode = 'UR'
			FOR XML PATH ('')
		) RequestNote
		,(
			SELECT step.ReplyNote + ',' AS [text()]
			FROM RequestApprovalStep step WITH (NOLOCK)
			WHERE step.ReqId = UR.Id and step.ProcessTypeCode = 'UR'
			FOR XML PATH ('')
		) ReplyNote
	FROM UserRequest UR
	INNER JOIN AbpUsers US ON US.Id = UR.CreatorUserId AND UR.IsDeleted = 0 AND (ISNULL(@Status, '') = '' OR UPPER(UR.ApprovalStatus) = UPPER(@Status))
	LEFT JOIN MstHrOrgStructure DEPART ON DEPART.Id = US.HrOrgStructureId
	LEFT JOIN MstCurrency CUR ON CUR.Id = UR.CurrencyId
	LEFT JOIN MstInventoryGroup INVG ON INVG.Id = UR.InventoryGroupId
	WHERE US.Id = @UserId
		AND (ISNULL(@URNumber, '') = '' OR UPPER(UR.UserRequestNumber) LIKE '%' + UPPER(@URNumber) + '%')
		AND (ISNULL(@EffectFrom, '') = '' OR CAST(UR.CreationTime AS DATE) >= CAST(@EffectFrom AS DATE))
		AND (ISNULL(@EffectTo, '') = '' OR CAST(UR.CreationTime AS DATE) <= CAST(@EffectTo AS DATE))
		AND (ISNULL(@InventoryGroupId, '') = '' OR UR.InventoryGroupId = @InventoryGroupId)
		AND (ISNULL(@PicUserId, '') = '' OR UR.CreatorUserId = @PicUserId)
	ORDER BY UR.Id DESC
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;
END;