USE [CPS]
GO

/****** Object:  Table [dbo].[MstTitleSeq]    Script Date: 4/11/2023 12:02:33 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[MstTitleSeq](
	[Id] [bigint] IDENTITY(1,1) NOT NULL,
	[TitleName] [nvarchar](50) NULL,
	[Seq] [bigint] NULL,
 CONSTRAINT [PK_MstTitleSeq] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

