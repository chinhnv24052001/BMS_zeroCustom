CREATE TABLE DashboardFunctions(
	Id BIGINT NOT NULL PRIMARY KEY,
	FunctionName NVARCHAR(255) NOT NULL,
	FunctionKey NVARCHAR(255) NOT NULL,
	CreationTime DATETIME2(7) NOT NULL,
	CreatorUserId BIGINT NULL,
	LastModificationTime DATETIME2(7) NULL,
	LastModifierUserId BIGINT NULL,
	DeleterUserId BIGINT NULL,
	DeletionTime DATETIME2(7),
	IsDeleted BIT NOT NULL
	UNIQUE(FunctionName, FunctionKey)
);