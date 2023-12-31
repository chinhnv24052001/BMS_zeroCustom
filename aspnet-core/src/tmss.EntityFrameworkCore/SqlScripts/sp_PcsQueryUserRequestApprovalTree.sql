USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PcsQueryUserRequestApprovalTree]    Script Date: 4/19/2023 4:59:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
			,STEP.ApprovalTreeDetailId
			,USR.IsBuyer
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
			,0 as ApprovalTreeDetailId
			,0 as IsBuyer
		from MstActionHistory
		where IsDeleted = 0 
		and ActionType = @ProcessType
		and HeaderId = @ReqId
	) tbl
END;