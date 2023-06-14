USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PaymentGetAllEmployees]    Script Date: 4/5/2023 9:44:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO




--SET QUOTED_IDENTIFIER ON|OFF
--SET ANSI_NULLS ON|OFF
--GO
ALTER PROCEDURE [dbo].[sp_PaymentGetAllEmployees]
AS
BEGIN
	SELECT u.UserName,u.EmailAddress, u.Id, u.Name, u.EmployeeCode,ISNULL(p.PositionCode,' ') as PosCode, ISNULL(t.Code,' ') as TitleCode, ISNULL(s.Name, ' ') as DeptName, ISNULL(t.Code,' ') as TitleDescription 
	,u.HrOrgStructureId 
	,s.ParentId-- t.Description as TitleDescription
	FROM AbpUsers u 
	LEFT JOIN [MstTitles] t on u.TitlesId = t.id 
	LEFT JOIN [MstPosition] p on u.PositionId = p.id 
	LEFT JOIN [MstHrOrgStructure] s on s.Id = HrOrgStructureId
	WHERE TenantId = 1
	AND SupplierContactId is null
	-- AND u.EmployeeCode IS NOT NULL
END



GO
ALTER PROCEDURE [dbo].[sp_PcsQueryUserRequestApprovalTree]
(
	@ReqId BIGINT,
	@ProcessType varchar(10)
)
WITH RECOMPILE
AS
BEGIN
	select tbl.*,
		ROW_NUMBER() over (ORDER BY SeqOrder, SeqNum, ApprovalDate) ApprovalSeq
	from (
		SELECT
			STEP.Id as Id 
			,STEP.ReqId
			,1 SeqOrder
			,STEP.ApprovalSeq SeqNum
			,USR.Name AS ApprovalUserName
			,ORG.Name AS ApprovalUserDepartment
			,TITLE.Name AS ApprovalUserTitle
			,STEPUSR.ApprovalDate
			,STEPUSR.RejectDate
			,STEP.ApprovalStatus
			,STEPUSR.DeadlineDate AS LeadTime
			,STEP.Note 
			,STEP.RequestNote 
			,STEP.ReplyNote 
			,STEP.DayOfProcess as DayOfProcess
			,STEPUSR.ApprovalUserId as ApprovalUserId
			--,STEP.Note
		FROM RequestApprovalStep STEP
		INNER JOIN RequestApprovalStepUser STEPUSR ON STEPUSR.RequestApprovalStepId = STEP.ID
		INNER JOIN AbpUsers USR ON USR.Id = STEPUSR.ApprovalUserId
		LEFT JOIN MstHrOrgStructure ORG ON ORG.Id = STEPUSR.ApprovalHrOrgStructureId
		LEFT JOIN MstTitles TITLE ON TITLE.Id = USR.TitlesId
		WHERE STEP.IsDeleted = 0
		and step.ProcessTypeCode = @ProcessType
		and STEP.ReqId = @ReqId
		--
		union all
		--
		select 0 
			,HeaderId ReqId
			,0 SeqOrder
			,SeqNum
			,EmployeeName AS ApprovalUserName
			,'' AS ApprovalUserDepartment
			,'' AS ApprovalUserTitle
			,ActionDate ApprovalDate
			,cast(null as datetime) RejectDate
			,UPPER(ActionCodeDsp) ApprovalStatus
			,cast(null as datetime) AS LeadTime
			,Note Note 
			,null RequestNote 
			,null ReplyNote
			,0 as DayOfProcess
			,0 as ApprovalUserId
		from MstActionHistory
		where IsDeleted = 0 
		and ActionType = @ProcessType
		and HeaderId = @ReqId
	) tbl
END;

/****** Object:  StoredProcedure [dbo].[sp_GetAllRequestApprovalByUser]    Script Date: 4/5/2023 1:20:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 --Tạo bởi Hung NL

ALTER PROCEDURE [dbo].[sp_GetAllRequestApprovalByUser]
	-- Add the parameters for the stored procedure here
	 @ApprovalUserId BIGINT,
	 @ApprovalStatus NVARCHAR(20),
	 @RequestTypeId BIGINT,
	 @RequestNo NVARCHAR(50),
	 @SendDateFrom DATETIME2(7),
	 @SendDateTo DATETIME2(7),
	 @SkipCount BIGINT,
	 @MaxResultCount BIGINT
AS
BEGIN
	 SELECT 
		Id,
		Id ReqId,
		ProcessTypeCode,
		ApprovalStatus,
		RequestDate,
		RequestType,
		RequestNo,
		RequestPersonName,
		RequestApprovalStepId,
		DepartmentApprovalName,
		RequestNote,
		ReplyNote,
		Description,
		COUNT(*) OVER() AS TotalCount
	 FROM
	 (
		 SELECT 
			ur.Id,
			step.Id RequestApprovalStepId,
			step.ProcessTypeCode,
			step.ApprovalStatus ApprovalStatus,
			step.CreationTime RequestDate,
			'User Request' RequestType,
			ur.UserRequestNumber RequestNo,
			users.Name RequestPersonName,
			step.DepartmentName DepartmentApprovalName,
			step.RequestNote ,
			step.ReplyNote ,
			'' Description
		 FROM (
			select *
			from RequestApprovalStep
			union all
			select *
			from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			union all
			select *
			from RequestApprovalStepUserLog
			where ApprovalUserId = @ApprovalUserId
		 ) stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN UserRequest ur ON step.ReqId = ur.Id AND step.ProcessTypeCode = 'UR'
		 INNER JOIN AbpUsers users ON users.Id = ur.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING'
			AND (ISNULL(@ApprovalUserId, '') = '' OR stepUser.ApprovalUserId = @ApprovalUserId)
			AND (ISNULL(@RequestNo, '') = '' OR UPPER(ur.UserRequestNumber) LIKE '%' + UPPER(@RequestNo) + '%')
			AND (ISNULL(@RequestTypeId, '') = '' Or @RequestTypeId = 0 OR @RequestTypeId = (select Id from MstProcessType where ProcessTypeCode = 'UR'))
			And (@SendDateFrom is null or @SendDateFrom <= step.CreationTime)
			And (@SendDateTo is null or @SendDateTo >= step.CreationTime)
		 UNION ALL
		 SELECT 
			pr.Id,
			step.Id RequestApprovalStepId,
			step.ProcessTypeCode,
			step.ApprovalStatus ApprovalStatus,
			step.CreationTime RequestDate,
			'Purchasing Request' RequestType,
			RequisitionNo RequestNo,
			users.Name RequestPersonName,
			step.DepartmentName DepartmentApprovalName,
			step.RequestNote ,
			step.ReplyNote ,
			pr.Description
		 FROM (
			select *
			from RequestApprovalStep
			union all
			select *
			from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			union all
			select *
			from RequestApprovalStepUserLog
			where ApprovalUserId = @ApprovalUserId
) stepUser   ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PrRequisitionHeaders pr ON step.ReqId = pr.Id AND step.ProcessTypeCode = 'PR'
		 INNER JOIN AbpUsers users ON users.Id = pr.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING'
			AND (ISNULL(@ApprovalUserId, '') = '' OR stepUser.ApprovalUserId = @ApprovalUserId)
			AND (ISNULL(@RequestTypeId, '') = '' Or @RequestTypeId = 0 OR @RequestTypeId = (select Id from MstProcessType where ProcessTypeCode = 'PR'))
			AND (ISNULL(@RequestNo, '') = '' OR UPPER(pr.RequisitionNo) LIKE '%' + UPPER(@RequestNo) + '%')
			And (@SendDateFrom is null or @SendDateFrom <= step.CreationTime)
			And (@SendDateTo is null or @SendDateTo >= step.CreationTime)
		 UNION ALL
		 SELECT 
			po.Id,
			step.Id RequestApprovalStepId,
			step.ProcessTypeCode,
			step.ApprovalStatus ApprovalStatus,
			step.CreationTime RequestDate,
			'Purchase Orders' RequestType,
			po.Segment1 RequestNo,
			users.Name RequestPersonName,
			step.DepartmentName DepartmentApprovalName,
			step.RequestNote ,
			step.ReplyNote ,
			po.Description
		 FROM  (
			select *
			from RequestApprovalStep
			union all
			select *
			from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			union all
			select *
			from RequestApprovalStepUserLog
			where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PoHeaders po ON step.ReqId = po.Id AND step.ProcessTypeCode = 'PO'
		 INNER JOIN AbpUsers users ON users.Id = po.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING'
			AND (ISNULL(@ApprovalUserId, '') = '' OR stepUser.ApprovalUserId = @ApprovalUserId)
			AND (ISNULL(@RequestTypeId, '') = '' Or @RequestTypeId = 0 OR @RequestTypeId = (select Id from MstProcessType where ProcessTypeCode = 'PO'))
			AND (ISNULL(@RequestNo, '') = '' OR UPPER(po.Segment1) LIKE '%' + UPPER(@RequestNo) + '%')
			And (@SendDateFrom is null or @SendDateFrom <= step.CreationTime)
			And (@SendDateTo is null or @SendDateTo >= step.CreationTime)
		union all
		SELECT 
			pc.Id,
			step.Id RequestApprovalStepId,
			step.ProcessTypeCode,
			step.ApprovalStatus ApprovalStatus,
			step.CreationTime RequestDate,
			'Contract/Annex' RequestType,
			pc.SeqNo RequestNo,
			users.Name RequestPersonName,
			step.DepartmentName DepartmentApprovalName,
			step.RequestNote ,
			step.ReplyNote ,
			pc.Description
		 FROM  (
			select *
			from RequestApprovalStep
			union all
			select *
			from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			union all
			select *
			from RequestApprovalStepUserLog
			where ApprovalUserId = @ApprovalUserId
)   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PrcAppendixContract  pc ON step.ReqId = pc.Id AND step.ProcessTypeCode = 'AN'
		 INNER JOIN AbpUsers users ON users.Id = pc.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING'
			AND (ISNULL(@ApprovalUserId, '') = '' OR stepUser.ApprovalUserId = @ApprovalUserId)
			AND (ISNULL(@RequestTypeId, '') = '' Or @RequestTypeId = 0 OR @RequestTypeId = (select Id from MstProcessType where ProcessTypeCode = 'AN'))
			AND (ISNULL(@RequestNo, '') = '' OR UPPER(pc.SeqNo) LIKE '%' + UPPER(@RequestNo) + '%')
			And (@SendDateFrom is null or @SendDateFrom <= step.CreationTime)
			And (@SendDateTo is null or @SendDateTo >= step.CreationTime)
		union all
		SELECT 
			gr.Id,
			step.Id RequestApprovalStepId,
			step.ProcessTypeCode,
			step.ApprovalStatus ApprovalStatus,
			step.CreationTime RequestDate,
			'GR Approval' RequestType,
			gr.ReceiptNum RequestNo,
			users.Name RequestPersonName,
			step.DepartmentName DepartmentApprovalName,
			step.RequestNote ,
			step.ReplyNote ,
			'' as Description
		 FROM  (
			select *
			from RequestApprovalStep
			union all
			select *
			from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			union all
			select *
			from RequestApprovalStepUserLog
			where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN RcvShipmentHeaders gr ON step.ReqId = gr.Id AND step.ProcessTypeCode = 'GR'
		 INNER JOIN AbpUsers users ON users.Id = gr.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING'
			AND (ISNULL(@ApprovalUserId, '') = '' OR stepUser.ApprovalUserId = @ApprovalUserId)
			AND (ISNULL(@RequestTypeId, '') = '' Or @RequestTypeId = 0 OR @RequestTypeId = (select Id from MstProcessType where ProcessTypeCode = 'GR'))
			AND (ISNULL(@RequestNo, '') = '' OR UPPER(gr.ReceiptNum) LIKE '%' + UPPER(@RequestNo) + '%')
			And (@SendDateFrom is null or @SendDateFrom <= step.CreationTime)
			And (@SendDateTo is null or @SendDateTo >= step.CreationTime)
		UNION ALL
		SELECT 
			pm.Id,
			step.Id RequestApprovalStepId,
			step.ProcessTypeCode,
			step.ApprovalStatus ApprovalStatus,
			step.CreationTime RequestDate,
			'Payment Request' RequestType,
			pm.PaymentNo RequestNo,
			users.Name RequestPersonName,
			step.DepartmentName DepartmentApprovalName,
			step.RequestNote ,
			step.ReplyNote ,
			pm.Description as Description
		 FROM  (
			select *
			from RequestApprovalStep
			union all
			select *
			from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			union all
			select *
			from RequestApprovalStepUserLog
where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PaymentHeaders pm ON step.ReqId = pm.Id AND step.ProcessTypeCode = 'PM'
		 INNER JOIN AbpUsers users ON users.Id = pm.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING'
			AND (ISNULL(@ApprovalUserId, '') = '' OR stepUser.ApprovalUserId = @ApprovalUserId)
			AND (ISNULL(@RequestTypeId, '') = '' Or @RequestTypeId = 0 OR @RequestTypeId = (select Id from MstProcessType where ProcessTypeCode = 'PM'))
			AND (ISNULL(@RequestNo, '') = '' OR UPPER(pm.PaymentNo) LIKE '%' + UPPER(@RequestNo) + '%')
			And (@SendDateFrom is null or @SendDateFrom <= step.CreationTime)
			And (@SendDateTo is null or @SendDateTo >= step.CreationTime)
		UNION ALL
		SELECT 
			sr.Id,
			step.Id RequestApprovalStepId,
			step.ProcessTypeCode,
			step.ApprovalStatus ApprovalStatus,
			step.CreationTime RequestDate,
			'Supplier Request' RequestType,
			sr.RequestNo RequestNo,
			users.Name RequestPersonName,
			step.DepartmentName DepartmentApprovalName,
			step.RequestNote ,
			step.ReplyNote ,
			'' Description
		 FROM  (
			select *
			from RequestApprovalStep
			union all
			select *
			from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			union all
			select *
			from RequestApprovalStepUserLog
			where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN MstSupplierRequest sr ON step.ReqId = sr.Id AND step.ProcessTypeCode = 'SR'
		 INNER JOIN AbpUsers users ON users.Id = sr.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING'
			AND (ISNULL(@ApprovalUserId, '') = '' OR stepUser.ApprovalUserId = @ApprovalUserId)
			AND (ISNULL(@RequestTypeId, '') = '' Or @RequestTypeId = 0 OR @RequestTypeId = (select Id from MstProcessType where ProcessTypeCode = 'SR'))
			AND (ISNULL(@RequestNo, '') = '' OR UPPER(sr.RequestNo) LIKE '%' + UPPER(@RequestNo) + '%')
			And (@SendDateFrom is null or @SendDateFrom <= step.CreationTime)
			And (@SendDateTo is null or @SendDateTo >= step.CreationTime)
	) AS req
	ORDER BY RequestDate DESC
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;
END

ALTER TABLE MstSupplierRequest
ADD RequestNo nvarchar(50);

ALTER TABLE MstSupplierRequest
ADD DepartmentApprovalName nvarchar(50);

INSERT INTO [dbo].[MstProcessType]
           ([ProcessTypeCode]
           ,[ProcessTypeName]
           ,[IsDeleted]
           ,[CreationTime]
           ,[CreatorUserId]
           ,[DeleterUserId]
           ,[DeletionTime]
           ,[LastModificationTime]
           ,[LastModifierUserId])
     VALUES
           ('SR'
           ,'Supplier Request'
           ,0
			,null
           ,null
           ,null
           ,null
           ,null
           ,null)
GO


USE [CPS]
GO

INSERT INTO [dbo].[MstLastPurchasingSeq]
           ([LastSeq]
           ,[LastRequestDate]
           ,[Type]
           ,[CreationTime]
           ,[CreatorUserId]
           ,[LastModificationTime]
           ,[LastModifierUserId]
           ,[DeleterUserId]
           ,[DeletionTime]
           ,[IsDeleted])
     VALUES
           (0
           ,GETDATE()
           ,9
           ,GETDATE()
           ,676
           ,GETDATE()
           ,675
           ,null
           ,null
           ,0)
GO


