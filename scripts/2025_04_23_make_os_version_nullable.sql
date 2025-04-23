USE [sanna-topicos-mssql]
GO

ALTER TABLE [sanna].[sessions] ALTER COLUMN os_version nvarchar(255) COLLATE Modern_Spanish_CI_AS NULL;
GO;

UPDATE [sanna].[roles] SET name = 'Soporte' WHERE id = 1;
GO;