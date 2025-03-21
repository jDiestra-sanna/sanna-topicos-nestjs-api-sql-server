USE [sanna-topicos];
GO

-- Crear el índice único
CREATE UNIQUE INDEX UQ_Patients_State_DocType_DocNumber
ON sanna.patients (state, document_type_id, document_number);
GO
