# DoctorHub Postman Testing Guide

This collection targets the current DoctorHub API and contains requests for every mounted API module:

- Authentication
- User/profile image
- Doctor application, approval, public discovery
- Schedules
- Appointments + bKash payment flow
- Payments
- Prescriptions
- Analytics

## Import

Import these three files into Postman:

1. `DoctorHub.postman_collection.json`
2. `DoctorHub-Production.postman_environment.json`
3. `DoctorHub-Local.postman_environment.json`

Choose **DoctorHub - Production** to test:

`https://doctorhub.onrender.com`

## Recommended test order

### 1. Health
Run `00 - Health / Health Check`.

### 2. Set credentials in the environment
Fill patient, doctor, admin and super-admin emails/passwords. Do not commit real passwords to Git.

### 3. Authentication
For a new patient:

1. `Patient - Register (Send OTP)`
2. Copy the real OTP from email into `patientRegistrationOtp`
3. `Patient - Verify Email OTP`

The verification request automatically stores `patientAccessToken`.

For existing roles, run the login requests in `02 - Role Logins`. They automatically store:

- `doctorAccessToken`
- `adminAccessToken`
- `superAdminAccessToken`

### 4. Doctor application
The doctor application is multipart/form-data. Postman cannot export a portable local file path, so manually select a resume file in the request before sending it.

After email verification, approve the application using an Admin token.

### 5. Schedule
Log in as a doctor, create a schedule, then publish it. The create request automatically saves `scheduleId`.

Update the ISO date-time environment values before testing. The backend's business rules determine whether the requested date/time is allowed.

### 6. Appointment + bKash
Run:

1. Public Today's Schedules
2. Patient Book Appointment
3. Open the returned bKash checkout URL in a browser
4. Complete the hosted bKash flow
5. Return to Postman
6. Run Patient My Appointments

The collection saves the newest `appointmentId`, `paymentId`, and `bkashPaymentId` when available.

**Do not normally call the bKash callback manually.** The callback requires a valid bKash payment ID and is meant to be invoked by the payment flow.

### 7. Appointment lifecycle
For a successfully paid appointment:

1. Doctor My Appointments
2. Status CONFIRMED -> ONGOING
3. Status ONGOING -> COMPLETED

### 8. Prescription
Once the appointment is COMPLETED:

1. Doctor Create Prescription
2. Patient Get Prescription

### 9. Payment and analytics
Run the patient/admin payment endpoints and all three analytics endpoints.

## Important destructive requests

These modify data and should not be run blindly:

- Reset Password
- Approve/Reject Doctor
- Update/Delete Schedule
- Book/Retry/Cancel Appointment
- Update Appointment Status
- Create Prescription
- Upload Profile Image

## Notes about automatic variables

The collection uses **collection variables** for generated runtime state such as JWTs and resource IDs. Credentials and OTPs are **environment variables**.

If an ID is not captured automatically, copy it from the response and set the corresponding collection variable:

- `doctorId`
- `doctorApplicationId`
- `scheduleId`
- `appointmentId`
- `paymentId`
- `bkashPaymentId`

## bKash limitation

Postman can start the payment request, but the hosted checkout requires browser/user interaction. Therefore a truly end-to-end successful payment cannot be fully automated by this collection alone.
