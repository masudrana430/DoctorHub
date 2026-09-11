import type { Application } from "express";
import swaggerUi from "swagger-ui-express";

export const openApiDocument = {
  "openapi": "3.0.3",
  "info": {
    "title": "DoctorHub API",
    "version": "1.0.0",
    "description": "REST API documentation for DoctorHub. The API supports patient authentication, doctor onboarding and approval, doctor schedules, appointment booking, bKash payments/refunds, prescriptions, profile images, and role-based analytics.\n\nAuthentication: protected endpoints accept `Authorization: Bearer <accessToken>`. The backend also supports access-token cookies. Roles: `SUPER_ADMIN`, `ADMIN`, `DOCTOR`, `PATIENT`."
  },
  "servers": [
    {
      "url": "https://doctorhub.onrender.com",
      "description": "Production"
    },
    {
      "url": "http://localhost:5000",
      "description": "Local development"
    }
  ],
  "tags": [
    {
      "name": "Auth",
      "description": "Registration, login, OTP verification and password recovery"
    },
    {
      "name": "User",
      "description": "Shared user operations"
    },
    {
      "name": "Doctor",
      "description": "Doctor application, approval, profile and public discovery"
    },
    {
      "name": "Schedule",
      "description": "Doctor schedules and today's availability"
    },
    {
      "name": "Appointment",
      "description": "Appointment booking, payment callback, cancellation and lifecycle"
    },
    {
      "name": "Payment",
      "description": "Payment history and payment detail"
    },
    {
      "name": "Prescription",
      "description": "Prescription creation and retrieval"
    },
    {
      "name": "Analytics",
      "description": "Role-specific analytics"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Paste the access token returned from login/verification."
      },
      "accessTokenCookie": {
        "type": "apiKey",
        "in": "cookie",
        "name": "accessToken"
      },
      "refreshTokenCookie": {
        "type": "apiKey",
        "in": "cookie",
        "name": "refreshToken"
      }
    },
    "parameters": {
      "Page": {
        "name": "page",
        "in": "query",
        "schema": {
          "type": "integer",
          "minimum": 1,
          "default": 1
        }
      },
      "Limit": {
        "name": "limit",
        "in": "query",
        "schema": {
          "type": "integer",
          "minimum": 1,
          "default": 10
        }
      },
      "SortBy": {
        "name": "sortBy",
        "in": "query",
        "schema": {
          "type": "string",
          "default": "createdAt"
        }
      },
      "SortOrder": {
        "name": "sortOrder",
        "in": "query",
        "schema": {
          "type": "string",
          "enum": [
            "asc",
            "desc"
          ],
          "default": "desc"
        }
      }
    },
    "schemas": {
      "Role": {
        "type": "string",
        "enum": [
          "SUPER_ADMIN",
          "ADMIN",
          "DOCTOR",
          "PATIENT"
        ]
      },
      "UserStatus": {
        "type": "string",
        "enum": [
          "ACTIVE",
          "BLOCKED",
          "DELETED"
        ]
      },
      "AppointmentStatus": {
        "type": "string",
        "enum": [
          "PENDING",
          "CONFIRMED",
          "CANCELLED",
          "ONGOING",
          "COMPLETED"
        ]
      },
      "PaymentStatus": {
        "type": "string",
        "enum": [
          "UNPAID",
          "PAID",
          "FAILED",
          "CANCELLED",
          "REFUNDED"
        ]
      },
      "ScheduleStatus": {
        "type": "string",
        "enum": [
          "DRAFT",
          "PUBLISHED"
        ]
      },
      "DoctorVerificationStatus": {
        "type": "string",
        "enum": [
          "PENDING",
          "APPROVED",
          "REJECTED"
        ]
      },
      "PaginationMeta": {
        "type": "object",
        "properties": {
          "page": {
            "type": "integer",
            "example": 1
          },
          "limit": {
            "type": "integer",
            "example": 10
          },
          "total": {
            "type": "integer",
            "example": 25
          },
          "totalPages": {
            "type": "integer",
            "example": 3
          }
        }
      },
      "ErrorResponse": {
        "type": "object",
        "properties": {
          "success": {
            "type": "boolean",
            "example": false
          },
          "statusCode": {
            "type": "integer",
            "example": 400
          },
          "name": {
            "type": "string",
            "example": "AppError"
          },
          "message": {
            "type": "string",
            "example": "Bad Request"
          }
        }
      },
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          },
          "googleId": {
            "type": "string",
            "nullable": true
          },
          "authProvider": {
            "type": "string",
            "enum": [
              "GOOGLE",
              "CREDENTIALS"
            ]
          },
          "emailVerified": {
            "type": "boolean"
          },
          "role": {
            "$ref": "#/components/schemas/Role"
          },
          "status": {
            "$ref": "#/components/schemas/UserStatus"
          },
          "needPasswordChange": {
            "type": "boolean"
          },
          "imageUrl": {
            "type": "string"
          },
          "isDeleted": {
            "type": "boolean"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "Patient": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          },
          "contactNumber": {
            "type": "string",
            "nullable": true
          },
          "address": {
            "type": "string",
            "nullable": true
          },
          "userId": {
            "type": "string"
          }
        }
      },
      "Doctor": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "email": {
            "type": "string",
            "format": "email"
          },
          "address": {
            "type": "string",
            "nullable": true
          },
          "specialization": {
            "type": "string"
          },
          "licenseNumber": {
            "type": "string"
          },
          "qualifications": {
            "type": "string"
          },
          "experienceYears": {
            "type": "integer"
          },
          "bio": {
            "type": "string",
            "nullable": true
          },
          "consultationFee": {
            "type": "number",
            "nullable": true,
            "example": 1200
          },
          "contactNumber": {
            "type": "string",
            "nullable": true
          },
          "verificationStatus": {
            "$ref": "#/components/schemas/DoctorVerificationStatus"
          },
          "resume": {
            "type": "string",
            "nullable": true
          },
          "userId": {
            "type": "string"
          }
        }
      },
      "Schedule": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "startDateTime": {
            "type": "string",
            "format": "date-time"
          },
          "endDateTime": {
            "type": "string",
            "format": "date-time"
          },
          "totalSlots": {
            "type": "integer"
          },
          "availableSlots": {
            "type": "integer"
          },
          "meetingLink": {
            "type": "string",
            "format": "uri"
          },
          "status": {
            "$ref": "#/components/schemas/ScheduleStatus"
          },
          "isDeleted": {
            "type": "boolean"
          },
          "doctorId": {
            "type": "string"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "Payment": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "status": {
            "$ref": "#/components/schemas/PaymentStatus"
          },
          "amount": {
            "type": "number"
          },
          "currency": {
            "type": "string",
            "example": "BDT"
          },
          "paymentGateway": {
            "type": "string",
            "example": "bkash"
          },
          "merchantInvoiceNumber": {
            "type": "string"
          },
          "bkashPaymentId": {
            "type": "string",
            "nullable": true
          },
          "bkashTrxId": {
            "type": "string",
            "nullable": true
          },
          "payerReference": {
            "type": "string",
            "nullable": true
          },
          "paidAt": {
            "type": "string",
            "nullable": true
          },
          "refundTrxId": {
            "type": "string",
            "nullable": true
          },
          "refundAmount": {
            "type": "number",
            "nullable": true
          },
          "refundReason": {
            "type": "string",
            "nullable": true
          },
          "refundedAt": {
            "type": "string",
            "nullable": true
          },
          "appointmentId": {
            "type": "string"
          }
        }
      },
      "Appointment": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "status": {
            "$ref": "#/components/schemas/AppointmentStatus"
          },
          "joiningTime": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "serialNumber": {
            "type": "integer",
            "nullable": true
          },
          "recordUrl": {
            "type": "string",
            "nullable": true
          },
          "prescriptionUrl": {
            "type": "string",
            "nullable": true
          },
          "patientId": {
            "type": "string"
          },
          "doctorId": {
            "type": "string"
          },
          "scheduleId": {
            "type": "string"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "RegisterPatientRequest": {
        "type": "object",
        "required": [
          "name",
          "email",
          "password"
        ],
        "properties": {
          "name": {
            "type": "string",
            "minLength": 3,
            "maxLength": 100,
            "example": "Masud Rana"
          },
          "email": {
            "type": "string",
            "format": "email",
            "example": "patient@example.com"
          },
          "password": {
            "type": "string",
            "minLength": 8,
            "example": "Patient@123"
          },
          "patient": {
            "type": "object",
            "properties": {
              "contactNumber": {
                "type": "string",
                "example": "01700000000"
              }
            }
          }
        }
      },
      "VerifyEmailRequest": {
        "type": "object",
        "required": [
          "email",
          "otp"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email"
          },
          "otp": {
            "type": "string",
            "minLength": 6,
            "maxLength": 6,
            "example": "123456"
          }
        }
      },
      "LoginRequest": {
        "type": "object",
        "required": [
          "email",
          "password"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email"
          },
          "password": {
            "type": "string",
            "minLength": 8,
            "example": "Patient@123"
          }
        }
      },
      "GoogleLoginRequest": {
        "type": "object",
        "required": [
          "idToken"
        ],
        "properties": {
          "idToken": {
            "type": "string",
            "description": "Google ID token"
          }
        }
      },
      "ForgotPasswordRequest": {
        "type": "object",
        "required": [
          "email"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email"
          }
        }
      },
      "ResetPasswordRequest": {
        "type": "object",
        "required": [
          "email",
          "otp",
          "newPassword"
        ],
        "properties": {
          "email": {
            "type": "string",
            "format": "email"
          },
          "otp": {
            "type": "string",
            "minLength": 6,
            "maxLength": 6
          },
          "newPassword": {
            "type": "string",
            "minLength": 8,
            "example": "NewPassword@123"
          }
        }
      },
      "DoctorApprovalRequest": {
        "type": "object",
        "required": [
          "doctorId",
          "verificationStatus"
        ],
        "properties": {
          "doctorId": {
            "type": "string"
          },
          "verificationStatus": {
            "type": "string",
            "enum": [
              "APPROVED",
              "REJECTED"
            ]
          },
          "rejectionReason": {
            "type": "string",
            "description": "Required by business logic when rejecting."
          }
        }
      },
      "DoctorUpdateRequest": {
        "type": "object",
        "properties": {
          "address": {
            "type": "string",
            "minLength": 5
          },
          "bio": {
            "type": "string",
            "maxLength": 1000
          },
          "consultationFee": {
            "type": "number",
            "minimum": 0
          },
          "contactNumber": {
            "type": "string",
            "minLength": 5
          }
        }
      },
      "ScheduleCreateRequest": {
        "type": "object",
        "required": [
          "startDateTime",
          "endDateTime",
          "meetingLink"
        ],
        "properties": {
          "startDateTime": {
            "type": "string",
            "format": "date-time",
            "example": "2026-09-12T09:00:00.000Z"
          },
          "endDateTime": {
            "type": "string",
            "format": "date-time",
            "example": "2026-09-12T15:00:00.000Z"
          },
          "meetingLink": {
            "type": "string",
            "format": "uri",
            "example": "https://meet.google.com/example"
          }
        }
      },
      "ScheduleUpdateRequest": {
        "type": "object",
        "properties": {
          "startDateTime": {
            "type": "string",
            "format": "date-time"
          },
          "endDateTime": {
            "type": "string",
            "format": "date-time"
          },
          "meetingLink": {
            "type": "string",
            "format": "uri"
          }
        }
      },
      "BookAppointmentRequest": {
        "type": "object",
        "required": [
          "scheduleId"
        ],
        "properties": {
          "scheduleId": {
            "type": "string"
          }
        }
      },
      "AppointmentIdRequest": {
        "type": "object",
        "required": [
          "appointmentId"
        ],
        "properties": {
          "appointmentId": {
            "type": "string"
          }
        }
      },
      "UpdateAppointmentStatusRequest": {
        "type": "object",
        "required": [
          "status"
        ],
        "properties": {
          "status": {
            "type": "string",
            "enum": [
              "ONGOING",
              "COMPLETED"
            ]
          }
        }
      },
      "CreatePrescriptionRequest": {
        "type": "object",
        "required": [
          "appointmentId",
          "findings",
          "medicines"
        ],
        "properties": {
          "appointmentId": {
            "type": "string"
          },
          "findings": {
            "type": "string",
            "minLength": 5
          },
          "medicines": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": [
                "name",
                "dosage",
                "duration"
              ],
              "properties": {
                "name": {
                  "type": "string"
                },
                "dosage": {
                  "type": "string",
                  "example": "1 tablet twice daily"
                },
                "duration": {
                  "type": "string",
                  "example": "7 days"
                },
                "instructions": {
                  "type": "string",
                  "example": "Take after food"
                }
              }
            }
          }
        }
      }
    },
    "responses": {
      "BadRequest": {
        "description": "Bad request",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "Unauthorized": {
        "description": "Authentication required or token invalid",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "Forbidden": {
        "description": "Authenticated but not allowed",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      "NotFound": {
        "description": "Resource not found",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ErrorResponse"
            }
          }
        }
      }
    }
  },
  "paths": {
    "/api/v1/auth/register": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Register a patient",
        "description": "Starts credential registration and sends a 6-digit verification OTP. The database user is created after OTP verification.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterPatientRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Registration OTP sent",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/auth/verify-email": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Verify patient email",
        "description": "Verifies the registration OTP, creates the patient account and returns authentication tokens.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyEmailRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Email verified and patient created",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Login with email and password",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/auth/me": {
      "get": {
        "tags": [
          "Auth"
        ],
        "summary": "Get current user",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Current user returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/auth/refresh-token": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Refresh authentication tokens",
        "description": "Reads the refresh token from the `refreshToken` cookie.",
        "security": [
          {
            "refreshTokenCookie": []
          }
        ],
        "responses": {
          "200": {
            "description": "Tokens refreshed",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          }
        }
      }
    },
    "/api/v1/auth/google": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Patient Google login/register",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/GoogleLoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Google authentication successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/auth/forgot-password": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Send forgot-password OTP",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ForgotPasswordRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Password-reset OTP sent",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/auth/reset-password": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Reset password with OTP",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ResetPasswordRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Password reset successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/user/profile-image": {
      "patch": {
        "tags": [
          "User"
        ],
        "summary": "Upload or replace profile image",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "required": [
                  "profileImage"
                ],
                "properties": {
                  "profileImage": {
                    "type": "string",
                    "format": "binary"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Profile image updated",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/doctor/apply-as-doctor": {
      "post": {
        "tags": [
          "Doctor"
        ],
        "summary": "Apply as a doctor",
        "description": "Public multipart endpoint. `data` is a JSON string containing `{ user, doctor }`. `resume` accepts one file and `additionalFiles` accepts up to 10 files.",
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "required": [
                  "data",
                  "resume"
                ],
                "properties": {
                  "data": {
                    "type": "string",
                    "example": "{\"user\": {\"name\": \"Dr. Example\", \"email\": \"doctor@example.com\"}, \"doctor\": {\"specialization\": \"Cardiology\", \"licenseNumber\": \"BMDC12345\", \"qualifications\": \"MBBS, FCPS\", \"experienceYears\": 5, \"consultationFee\": 1200, \"contactNumber\": \"01700000000\"}}"
                  },
                  "resume": {
                    "type": "string",
                    "format": "binary"
                  },
                  "additionalFiles": {
                    "type": "array",
                    "maxItems": 10,
                    "items": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Doctor application submitted",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/doctor/apply-as-doctor/verify-email": {
      "post": {
        "tags": [
          "Doctor"
        ],
        "summary": "Verify doctor application email",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/VerifyEmailRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Doctor email verified",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/doctor/approve-doctor": {
      "post": {
        "tags": [
          "Doctor"
        ],
        "summary": "Approve or reject a doctor application",
        "description": "ADMIN or SUPER_ADMIN only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DoctorApprovalRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Doctor application reviewed",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/doctor/all-doctors": {
      "get": {
        "tags": [
          "Doctor"
        ],
        "summary": "List doctors for administration",
        "description": "ADMIN or SUPER_ADMIN only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "specialization",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "email",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "email"
            }
          },
          {
            "name": "licenseNumber",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "verificationStatus",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/DoctorVerificationStatus"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Doctors returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/doctor/update-my-profile": {
      "patch": {
        "tags": [
          "Doctor"
        ],
        "summary": "Update authenticated doctor profile",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DoctorUpdateRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Doctor profile updated",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/doctor/public/available-today": {
      "get": {
        "tags": [
          "Doctor"
        ],
        "summary": "List doctors available today",
        "description": "Public endpoint. A doctor is available when an approved doctor has a published, not-yet-started schedule today with open slots.",
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "specialization",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Available doctors returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/doctor/public/all-doctors": {
      "get": {
        "tags": [
          "Doctor"
        ],
        "summary": "List public doctor profiles",
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "specialization",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Public doctor list returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/doctor/public/{doctorId}": {
      "get": {
        "tags": [
          "Doctor"
        ],
        "summary": "Get a public doctor profile",
        "parameters": [
          {
            "name": "doctorId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Doctor profile returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/schedule/create-schedule": {
      "post": {
        "tags": [
          "Schedule"
        ],
        "summary": "Create a doctor schedule",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ScheduleCreateRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Schedule created",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/schedule/my-schedules": {
      "get": {
        "tags": [
          "Schedule"
        ],
        "summary": "List authenticated doctor's schedules",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ScheduleStatus"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Schedules returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/schedule/all-schedules": {
      "get": {
        "tags": [
          "Schedule"
        ],
        "summary": "List all schedules",
        "description": "ADMIN or SUPER_ADMIN only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "doctorId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "email",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "email"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ScheduleStatus"
            }
          },
          {
            "name": "searchTerm",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Schedules returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/schedule/todays-schedule": {
      "get": {
        "tags": [
          "Schedule"
        ],
        "summary": "List a doctor's bookable schedules for today",
        "description": "Public endpoint. `doctorId` is required.",
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "doctorId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Today's schedules returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          }
        }
      }
    },
    "/api/v1/schedule/update-schedule/{scheduleId}": {
      "patch": {
        "tags": [
          "Schedule"
        ],
        "summary": "Update a doctor schedule",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "scheduleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": false,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ScheduleUpdateRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Schedule updated",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/schedule/publish-schedule/{scheduleId}": {
      "patch": {
        "tags": [
          "Schedule"
        ],
        "summary": "Publish a doctor schedule",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "scheduleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Schedule published",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/schedule/{scheduleId}": {
      "get": {
        "tags": [
          "Schedule"
        ],
        "summary": "Get a schedule by ID",
        "description": "DOCTOR, ADMIN or SUPER_ADMIN.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "scheduleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Schedule returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      },
      "delete": {
        "tags": [
          "Schedule"
        ],
        "summary": "Soft-delete a schedule",
        "description": "DOCTOR only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "scheduleId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Schedule deleted",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/book-appointment": {
      "post": {
        "tags": [
          "Appointment"
        ],
        "summary": "Create a pending appointment and start bKash checkout",
        "description": "PATIENT only. The response contains the bKash checkout URL.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/BookAppointmentRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Appointment booking/payment initialized",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/pay-appointment": {
      "post": {
        "tags": [
          "Appointment"
        ],
        "summary": "Retry payment for a pending appointment",
        "description": "PATIENT only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AppointmentIdRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Payment initialized",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/cancel-appointment": {
      "post": {
        "tags": [
          "Appointment"
        ],
        "summary": "Cancel an appointment",
        "description": "PATIENT, ADMIN or SUPER_ADMIN. Refund eligibility depends on cancellation time.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/AppointmentIdRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Appointment cancelled",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/book-appointment/payment/callback": {
      "get": {
        "tags": [
          "Appointment"
        ],
        "summary": "bKash payment callback",
        "description": "Called by the bKash checkout flow. This endpoint is normally not called manually.",
        "parameters": [
          {
            "name": "paymentID",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "status",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "enum": [
                "success",
                "failure",
                "cancel"
              ]
            }
          }
        ],
        "responses": {
          "302": {
            "description": "Redirects to the frontend according to payment result"
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          }
        }
      }
    },
    "/api/v1/appointment/update-status/{appointmentId}": {
      "patch": {
        "tags": [
          "Appointment"
        ],
        "summary": "Advance appointment status",
        "description": "DOCTOR only. CONFIRMED -> ONGOING -> COMPLETED.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UpdateAppointmentStatusRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Appointment status updated",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/my-appointments": {
      "get": {
        "tags": [
          "Appointment"
        ],
        "summary": "List authenticated patient's appointments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/AppointmentStatus"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Appointments returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/doctor-appointments": {
      "get": {
        "tags": [
          "Appointment"
        ],
        "summary": "List authenticated doctor's appointments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/AppointmentStatus"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Appointments returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/all-appointments": {
      "get": {
        "tags": [
          "Appointment"
        ],
        "summary": "List all appointments",
        "description": "ADMIN or SUPER_ADMIN only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/AppointmentStatus"
            }
          },
          {
            "name": "doctorId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "patientId",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "doctorEmail",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "email"
            }
          },
          {
            "name": "patientEmail",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "email"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Appointments returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/appointment/{appointmentId}": {
      "get": {
        "tags": [
          "Appointment"
        ],
        "summary": "Get an appointment by ID",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Appointment returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/payment/my-payments": {
      "get": {
        "tags": [
          "Payment"
        ],
        "summary": "List authenticated patient's payments",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          }
        ],
        "responses": {
          "200": {
            "description": "Payments returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/payment/all-payments": {
      "get": {
        "tags": [
          "Payment"
        ],
        "summary": "List all payments",
        "description": "ADMIN or SUPER_ADMIN only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "$ref": "#/components/parameters/Page"
          },
          {
            "$ref": "#/components/parameters/Limit"
          },
          {
            "$ref": "#/components/parameters/SortBy"
          },
          {
            "$ref": "#/components/parameters/SortOrder"
          },
          {
            "name": "patientEmail",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "email"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Payments returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/payment/{paymentId}": {
      "get": {
        "tags": [
          "Payment"
        ],
        "summary": "Get payment by ID",
        "description": "PATIENT, ADMIN or SUPER_ADMIN.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "paymentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Payment returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/prescription/create-prescription": {
      "post": {
        "tags": [
          "Prescription"
        ],
        "summary": "Create a prescription",
        "description": "DOCTOR only. Appointment must already be COMPLETED. Generates and emails a PDF prescription.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreatePrescriptionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Prescription created",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/prescription/{appointmentId}": {
      "get": {
        "tags": [
          "Prescription"
        ],
        "summary": "Get prescription for an appointment",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "parameters": [
          {
            "name": "appointmentId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Prescription returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/analytics/patient-analytics": {
      "get": {
        "tags": [
          "Analytics"
        ],
        "summary": "Get patient analytics",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Patient analytics returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/analytics/doctor-analytics": {
      "get": {
        "tags": [
          "Analytics"
        ],
        "summary": "Get doctor analytics",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Doctor analytics returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    },
    "/api/v1/analytics/admin-analytics": {
      "get": {
        "tags": [
          "Analytics"
        ],
        "summary": "Get admin analytics",
        "description": "ADMIN or SUPER_ADMIN only.",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "responses": {
          "200": {
            "description": "Admin analytics returned",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "400": {
            "$ref": "#/components/responses/BadRequest"
          },
          "404": {
            "$ref": "#/components/responses/NotFound"
          },
          "401": {
            "$ref": "#/components/responses/Unauthorized"
          },
          "403": {
            "$ref": "#/components/responses/Forbidden"
          }
        }
      }
    }
  }
};

export const setupSwagger = (app: Application) => {
  app.get("/api-docs.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      explorer: true,
      customSiteTitle: "DoctorHub API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    }),
  );
};
