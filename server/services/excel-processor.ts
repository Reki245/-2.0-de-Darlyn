import * as XLSX from 'xlsx';
import { authService } from './auth';
import { emailService } from './email';
import { storage } from '../storage';

export interface ExcelUserData {
  'nombre completo': string;
  'correo electrónico': string;
  'sede': string;
  'cargo': string;
  'área': string;
  'número de celular': string;
}

export interface ProcessedUser {
  fullName: string;
  email: string;
  office: string;
  position: string;
  department: string;
  phoneNumber: string;
}

export function generateSecurePassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one character from each type
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export class ExcelProcessor {
  validateExcelData(data: any[]): { valid: boolean; errors: string[]; processedData: ProcessedUser[] } {
    const errors: string[] = [];
    const processedData: ProcessedUser[] = [];
    
    if (!data || data.length === 0) {
      return { valid: false, errors: ['El archivo Excel está vacío'], processedData: [] };
    }

    const requiredFields = [
      'nombre completo',
      'correo electrónico', 
      'sede',
      'cargo',
      'área',
      'número de celular'
    ];

    // Check if all required columns exist
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => 
      !Object.keys(firstRow).some(key => 
        key.toLowerCase().trim() === field.toLowerCase()
      )
    );

    if (missingFields.length > 0) {
      errors.push(`Faltan las siguientes columnas: ${missingFields.join(', ')}`);
      return { valid: false, errors, processedData: [] };
    }

    // Process each row
    data.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number (starting from 2)
      const processedRow: any = {};

      // Map Excel columns to our format (case-insensitive)
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().trim();
        switch (normalizedKey) {
          case 'nombre completo':
            processedRow.fullName = row[key]?.toString().trim();
            break;
          case 'correo electrónico':
            processedRow.email = row[key]?.toString().trim().toLowerCase();
            break;
          case 'sede':
            processedRow.office = row[key]?.toString().trim();
            break;
          case 'cargo':
            processedRow.position = row[key]?.toString().trim();
            break;
          case 'área':
            processedRow.department = row[key]?.toString().trim();
            break;
          case 'número de celular':
            processedRow.phoneNumber = row[key]?.toString().trim();
            break;
        }
      });

      // Validate required fields
      if (!processedRow.fullName) {
        errors.push(`Fila ${rowNumber}: Nombre completo es requerido`);
      }

      if (!processedRow.email) {
        errors.push(`Fila ${rowNumber}: Correo electrónico es requerido`);
      } else {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(processedRow.email)) {
          errors.push(`Fila ${rowNumber}: Formato de email inválido`);
        }
      }

      if (!processedRow.office) {
        errors.push(`Fila ${rowNumber}: Sede es requerida`);
      }

      if (!processedRow.position) {
        errors.push(`Fila ${rowNumber}: Cargo es requerido`);
      }

      if (!processedRow.department) {
        errors.push(`Fila ${rowNumber}: Área es requerida`);
      }

      // Phone number is optional but validate if provided
      if (processedRow.phoneNumber) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{9,15}$/;
        if (!phoneRegex.test(processedRow.phoneNumber)) {
          errors.push(`Fila ${rowNumber}: Formato de teléfono inválido`);
        }
      }

      if (Object.keys(processedRow).length >= 5) { // At least 5 required fields
        processedData.push(processedRow as ProcessedUser);
      }
    });

    // Check for duplicate emails
    const emails = processedData.map(user => user.email);
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicateEmails.length > 0) {
      errors.push(`Emails duplicados encontrados: ${[...new Set(duplicateEmails)].join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      processedData
    };
  }

  async processExcelFile(fileBuffer: Buffer): Promise<{ 
    success: boolean; 
    message: string; 
    errors?: string[]; 
    createdUsers?: number;
    failedUsers?: number;
  }> {
    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        return { success: false, message: 'El archivo Excel no contiene hojas de trabajo' };
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate data
      const validation = this.validateExcelData(jsonData);
      if (!validation.valid) {
        return { 
          success: false, 
          message: 'Errores de validación encontrados', 
          errors: validation.errors 
        };
      }

      // Process users
      let createdUsers = 0;
      let failedUsers = 0;
      const failureReasons: string[] = [];

      for (const userData of validation.processedData) {
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(userData.email);
          if (existingUser) {
            failedUsers++;
            failureReasons.push(`${userData.email}: Usuario ya existe`);
            continue;
          }

          // Create user account
          const { user, password } = await authService.createUserAccount(
            userData.email,
            userData.fullName,
            userData
          );

          // Send credentials via email
          await emailService.sendCredentials({
            email: userData.email,
            password,
            fullName: userData.fullName,
            office: userData.office,
            position: userData.position
          });

          createdUsers++;
          console.log(`User created successfully: ${userData.email}`);

        } catch (error) {
          failedUsers++;
          failureReasons.push(`${userData.email}: ${error}`);
          console.error(`Failed to create user ${userData.email}:`, error);
        }
      }

      const message = `Procesamiento completado. ${createdUsers} usuarios creados, ${failedUsers} fallaron.`;
      
      return {
        success: createdUsers > 0,
        message,
        errors: failureReasons.length > 0 ? failureReasons : undefined,
        createdUsers,
        failedUsers
      };

    } catch (error) {
      console.error('Excel processing error:', error);
      return { 
        success: false, 
        message: `Error procesando archivo Excel: ${error}` 
      };
    }
  }
}

export const excelProcessor = new ExcelProcessor();
