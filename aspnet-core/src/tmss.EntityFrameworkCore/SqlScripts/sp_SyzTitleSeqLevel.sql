USE [CPS]
GO

/****** Object:  StoredProcedure [dbo].[sp_SyzTitleSeqLevel]    Script Date: 4/11/2023 12:01:08 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

create proc [dbo].[sp_SyzTitleSeqLevel]
as
begin
	merge into MstTitles des
	using 
	(
		select *
		from MstTitleSeq
	) src on (des.Name = src.TitleName)
	when matched then
		update set des.Seq = src.Seq;
end
GO


