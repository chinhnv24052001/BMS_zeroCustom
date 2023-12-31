USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAllRequestApprovalByUser]    Script Date: 4/19/2023 4:44:30 PM ******/
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
		IsBuyer,
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
			'' Description,
			users.IsBuyer
		 FROM (
			select *
			from RequestApprovalStep
			--union all
			--select *
			--from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			--union all
			--select *
			--from RequestApprovalStepUserLog
			--where ApprovalUserId = @ApprovalUserId
		 ) stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN UserRequest ur ON step.ReqId = ur.Id AND step.ProcessTypeCode = 'UR'
		 INNER JOIN AbpUsers users ON users.Id = ur.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING' and step.ApprovalStatus <> 'SKIP' and step.ApprovalStatus <> 'FORWARD'
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
			pr.Description,
			users.IsBuyer
		 FROM (
			select *
			from RequestApprovalStep
			--union all
			--select *
			--from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			--union all
			--select *
			--from RequestApprovalStepUserLog
			--where ApprovalUserId = @ApprovalUserId
		 ) stepUser   ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PrRequisitionHeaders pr ON step.ReqId = pr.Id AND step.ProcessTypeCode = 'PR'
		 INNER JOIN AbpUsers users ON users.Id = pr.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING' and step.ApprovalStatus <> 'SKIP' and step.ApprovalStatus <> 'FORWARD'
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
			po.Description,
			0 as IsBuyer
		 FROM  (
			select *
			from RequestApprovalStep
			--union all
			--select *
			--from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			--union all
			--select *
			--from RequestApprovalStepUserLog
			--where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PoHeaders po ON step.ReqId = po.Id AND step.ProcessTypeCode = 'PO'
		 INNER JOIN AbpUsers users ON users.Id = po.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING' and step.ApprovalStatus <> 'SKIP' and step.ApprovalStatus <> 'FORWARD'
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
			pc.Description,
			0 as IsBuyer
		 FROM  (
			select *
			from RequestApprovalStep
			--union all
			--select *
			--from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			--union all
			--select *
			--from RequestApprovalStepUserLog
			--where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PrcAppendixContract  pc ON step.ReqId = pc.Id AND step.ProcessTypeCode = 'AN'
		 INNER JOIN AbpUsers users ON users.Id = pc.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING' and step.ApprovalStatus <> 'SKIP' and step.ApprovalStatus <> 'FORWARD'
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
			'' as Description,
			0 as IsBuyer
		 FROM  (
			select *
			from RequestApprovalStep
			--union all
			--select *
			--from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			--union all
			--select *
			--from RequestApprovalStepUserLog
			--where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN RcvShipmentHeaders gr ON step.ReqId = gr.Id AND step.ProcessTypeCode = 'GR'
		 INNER JOIN AbpUsers users ON users.Id = gr.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING' and step.ApprovalStatus <> 'SKIP' and step.ApprovalStatus <> 'FORWARD'
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
			pm.Description as Description,
			0 as IsBuyer
		 FROM  (
			select *
			from RequestApprovalStep
			--union all
			--select *
			--from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			--union all
			--select *
			--from RequestApprovalStepUserLog
			--where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN PaymentHeaders pm ON step.ReqId = pm.Id AND step.ProcessTypeCode = 'PM'
		 INNER JOIN AbpUsers users ON users.Id = pm.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING' and step.ApprovalStatus <> 'SKIP' and step.ApprovalStatus <> 'FORWARD'
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
			'' Description,
			0 as IsBuyer
		 FROM  (
			select *
			from RequestApprovalStep
			--union all
			--select *
			--from RequestApprovalStepLog
		 ) step
		 INNER JOIN (
			select *
			from RequestApprovalStepUser
			where ApprovalUserId = @ApprovalUserId
			--union all
			--select *
			--from RequestApprovalStepUserLog
			--where ApprovalUserId = @ApprovalUserId
		 )   stepUser ON step.Id = stepUser.RequestApprovalStepId
		 INNER JOIN MstSupplierRequest sr ON step.ReqId = sr.Id AND step.ProcessTypeCode = 'SR'
		 INNER JOIN AbpUsers users ON users.Id = sr.CreatorUserId
		 WHERE ((ISNULL(@ApprovalStatus, '') = '' ) OR UPPER(step.ApprovalStatus) LIKE + '%' + @ApprovalStatus + '%' ) and step.ApprovalStatus <> 'PENDING' and step.ApprovalStatus <> 'SKIP' and step.ApprovalStatus <> 'FORWARD'
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
