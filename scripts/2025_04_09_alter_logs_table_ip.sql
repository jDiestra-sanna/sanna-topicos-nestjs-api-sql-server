USE [sanna-topicos-mssql];
GO

ALTER TABLE [sanna].[logs] ADD ip nvarchar(255) COLLATE Modern_Spanish_CI_AS DEFAULT N'' NULL;
GO