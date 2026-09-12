import {
  AppointmentStatus,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import httpStatus from "http-status";
import PDFDocument from "pdfkit";
import path from "path";
import ejs from "ejs";
import { addMinutes, isBefore, isSameDay, subHours } from "date-fns";
import config from "../../config";
import {
  createAamarPayTransactionId,
  initiateAamarPayPayment,
  verifyAamarPayTransaction,
} from "../../lib/aamarpay";
import { transporter } from "../../lib/nodeMailer";
import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import type {
  IBookAppointmentPayload,
  ICancelAppointmentPayload,
  IPayAppointmentPayload,
} from "./appointment.interface";
import { AppointmentServices as ExistingAppointmentServices } from "./appointment.service";

const callbackUrl = () =>
  `${config.aamarpay_callback_url.replace(/\/$/, "")}/appointment/book-appointment/payment/callback`;

const createCheckout = async ({
  appointmentId,
  amount,
  name,
  email,
  phone,
}: {
  appointmentId: string;
  amount: string;
  name: string;
  email: string;
  phone: string | null;
}) => {
  if (!phone) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please add a contact number to your patient profile before payment",
    );
  }

  const merchantTransactionId = createAamarPayTransactionId();
  const url = callbackUrl();

  const gatewayResult = await initiateAamarPayPayment({
    transactionId: merchantTransactionId,
    amount,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    description: `DoctorHub appointment ${appointmentId}`,
    successUrl: url,
    failUrl: url,
    cancelUrl: url,
    appointmentId,
  });

  return {
    merchantTransactionId,
    gatewayResult,
    paymentUrl: gatewayResult.payment_url,
  };
};

const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: RequestUser,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.findUnique({
      where: { userId: user.userId },
    });

    if (!patient) {
      throw new AppError(httpStatus.NOT_FOUND, "Patient Profile Not Found");
    }

    const schedule = await tx.schedule.findUnique({
      where: { id: payload.scheduleId },
      include: { doctor: true },
    });

    if (!schedule || schedule.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, "Schedule Not Found");
    }

    if (schedule.status !== "PUBLISHED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This Schedule Is Not Published Yet",
      );
    }

    const now = new Date();

    if (!isSameDay(now, schedule.startDateTime)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This Schedule Is Not Available Today",
      );
    }

    if (!isBefore(now, schedule.startDateTime)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This Schedule Has Already Started",
      );
    }

    const existingAppointment = await tx.apppointment.findFirst({
      where: {
        patientId: patient.id,
        scheduleId: schedule.id,
      },
    });

    if (existingAppointment?.status === AppointmentStatus.PENDING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You Already Have A Pending Appointment. Please Pay For That",
      );
    }
    if (existingAppointment?.status === AppointmentStatus.CONFIRMED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You Already Have A Confirmed Appointment.",
      );
    }
    if (existingAppointment?.status === AppointmentStatus.ONGOING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You Already Have A Ongoing Appointment",
      );
    }
    if (existingAppointment?.status === AppointmentStatus.COMPLETED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You Already Have Completed An Appointment On This Schedule. Please Try Again Another Day",
      );
    }

    if (schedule.availableSlots === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This Schedule Is Fully Booked",
      );
    }

    if (!schedule.doctor.consultationFee) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Doctor Has Not Set A Consultation Fee Yet",
      );
    }

    const amount = schedule.doctor.consultationFee.toString();

    const appointment = await tx.apppointment.create({
      data: {
        status: AppointmentStatus.PENDING,
        patientId: patient.id,
        doctorId: schedule.doctor.id,
        scheduleId: schedule.id,
      },
    });

    const checkout = await createCheckout({
      appointmentId: appointment.id,
      amount,
      name: patient.name,
      email: patient.email,
      phone: patient.contactNumber,
    });

    await tx.payment.create({
      data: {
        paymentGateway: "aamarpay",
        merchantInvoiceNumber: appointment.id,
        appointmentId: appointment.id,
        amount: Number(amount),
        gatewayResponse: checkout.gatewayResult,
        // Legacy DB column retained to avoid an unnecessary destructive migration.
        // It now stores the aamarPay merchant transaction ID (mer_txnid/tran_id).
        bkashPaymentId: checkout.merchantTransactionId,
        payerReference: user.email,
      },
    });

    return { paymentUrl: checkout.paymentUrl };
  });

  return transactionResult;
};

const payAppointment = async (
  payload: IPayAppointmentPayload,
  user: RequestUser,
) => {
  const existingAppointment = await prisma.apppointment.findUnique({
    where: { id: payload.appointmentId },
    include: {
      patient: true,
      schedule: { include: { doctor: true } },
    },
  });

  if (!existingAppointment) {
    throw new AppError(httpStatus.NOT_FOUND, "Appointment Does Not Exists");
  }

  if (existingAppointment.patient.email !== user.email) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You Are Not Allowed To Pay For This Appointment",
    );
  }

  if (existingAppointment.status !== AppointmentStatus.PENDING) {
    throw new AppError(httpStatus.BAD_REQUEST, "Appointment Is Not Pending!");
  }

  if (!existingAppointment.schedule.doctor.consultationFee) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Doctor Has Not Set A Consultation Fee Yet",
    );
  }

  const amount = existingAppointment.schedule.doctor.consultationFee.toString();

  const checkout = await createCheckout({
    appointmentId: existingAppointment.id,
    amount,
    name: existingAppointment.patient.name,
    email: existingAppointment.patient.email,
    phone: existingAppointment.patient.contactNumber,
  });

  await prisma.payment.update({
    where: { appointmentId: existingAppointment.id },
    data: {
      paymentGateway: "aamarpay",
      status: PaymentStatus.UNPAID,
      merchantInvoiceNumber: existingAppointment.id,
      gatewayResponse: checkout.gatewayResult,
      bkashPaymentId: checkout.merchantTransactionId,
      bkashTrxId: null,
      paidAt: null,
    },
  });

  return { paymentUrl: checkout.paymentUrl };
};

const bookAppointmentCallback = async (payload: Record<string, any>) => {
  const merchantTransactionId = payload.mer_txnid as string | undefined;

  if (!merchantTransactionId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "aamarPay merchant transaction ID is missing",
    );
  }

  const payment = await prisma.payment.findUnique({
    where: { bkashPaymentId: merchantTransactionId },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment Not Found");
  }

  if (payment.status === PaymentStatus.PAID) {
    return {
      redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=success`,
    };
  }

  const callbackStatus = String(payload.pay_status || "").toLowerCase();
  const callbackStatusCode = String(payload.status_code || "");

  if (callbackStatus === "successful" || callbackStatusCode === "2") {
    const verified = await verifyAamarPayTransaction(merchantTransactionId);

    const verifiedStatusCode = String(verified.status_code || "");
    const verifiedStatus = String(verified.pay_status || "").toLowerCase();
    const verifiedMerchantTransactionId = String(verified.mer_txnid || "");
    const verifiedAmount = Number(verified.amount_bdt ?? verified.amount);
    const expectedAmount = Number(payment.amount.toString());

    if (
      verifiedStatusCode !== "2" ||
      verifiedStatus !== "successful" ||
      verifiedMerchantTransactionId !== merchantTransactionId ||
      !Number.isFinite(verifiedAmount) ||
      Math.abs(verifiedAmount - expectedAmount) > 0.009
    ) {
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        "aamarPay transaction verification failed",
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentPayment = await tx.payment.findUnique({
        where: { appointmentId: payment.appointmentId },
      });

      if (currentPayment?.status === PaymentStatus.PAID) {
        return null;
      }

      const appointment = await tx.apppointment.findUnique({
        where: { id: payment.appointmentId },
        include: {
          schedule: true,
          patient: true,
          doctor: true,
        },
      });

      if (!appointment) {
        throw new AppError(httpStatus.NOT_FOUND, "Appointment Not Found!");
      }

      if (appointment.schedule.availableSlots <= 0) {
        throw new AppError(
          httpStatus.CONFLICT,
          "No appointment slot is available anymore",
        );
      }

      const alreadyBookedSlots =
        appointment.schedule.totalSlots - appointment.schedule.availableSlots;
      const serialNumber = alreadyBookedSlots + 1;
      const joiningTime = addMinutes(
        appointment.schedule.startDateTime,
        (serialNumber - 1) * 20,
      );

      await tx.apppointment.update({
        where: { id: appointment.id },
        data: {
          status: AppointmentStatus.CONFIRMED,
          joiningTime,
          serialNumber,
        },
      });

      await tx.schedule.update({
        where: { id: appointment.schedule.id },
        data: { availableSlots: { decrement: 1 } },
      });

      const bankTransactionId = String(
        verified.bank_trxid || verified.bank_txn || verified.pg_txnid || "",
      );
      const paidAt = String(
        verified.date_processed || verified.pay_time || new Date().toISOString(),
      );

      await tx.payment.update({
        where: { appointmentId: appointment.id },
        data: {
          paymentGateway: "aamarpay",
          status: PaymentStatus.PAID,
          // Legacy DB column retained; now stores aamarPay/bank transaction reference.
          bkashTrxId: bankTransactionId || null,
          paidAt,
          gatewayResponse: verified,
        },
      });

      return {
        appointment,
        joiningTime,
        serialNumber,
        bankTransactionId,
        paidAt,
        amount: verifiedAmount,
      };
    });

    if (result) {
      const pdfDocument = new PDFDocument({ margin: 50 });
      const pdfChunks: Buffer[] = [];

      pdfDocument.on("data", (chunk: Buffer) => pdfChunks.push(chunk));
      const pdfReadyPromise = new Promise<Buffer>((resolve) => {
        pdfDocument.on("end", () => resolve(Buffer.concat(pdfChunks)));
      });

      pdfDocument.fontSize(20).text("DoctorHub", { align: "center" });
      pdfDocument.fontSize(14).text("Appointment Invoice", { align: "center" });
      pdfDocument.moveDown(2);
      pdfDocument.fontSize(12).text(`Patient Name: ${result.appointment.patient.name}`);
      pdfDocument.text(`Patient Email: ${result.appointment.patient.email}`);
      pdfDocument.moveDown();
      pdfDocument.text(`Doctor Name: ${result.appointment.doctor.name}`);
      pdfDocument.text(`Specialization: ${result.appointment.doctor.specialization}`);
      pdfDocument.moveDown();
      pdfDocument.text(
        `Appointment Date: ${result.appointment.schedule.startDateTime.toDateString()}`,
      );
      pdfDocument.text(`Your Joining Time: ${result.joiningTime.toString()}`);
      pdfDocument.text(`Your Serial Number: ${result.serialNumber}`);
      pdfDocument.text(`Meeting Link: ${result.appointment.schedule.meetingLink}`);
      pdfDocument.moveDown();
      pdfDocument.text(`Amount Paid: ${result.amount} BDT`);
      pdfDocument.text("Payment Method: aamarPay");
      pdfDocument.text(`Transaction Id: ${result.bankTransactionId}`);
      pdfDocument.text(`Paid At: ${result.paidAt}`);
      pdfDocument.end();

      const pdfBuffer = await pdfReadyPromise;
      const templatePath = path.join(
        process.cwd(),
        "src/app/templates/appointment-invoice.ejs",
      );
      const html = await ejs.renderFile(templatePath, {
        patientName: result.appointment.patient.name,
        patientEmail: result.appointment.patient.email,
        doctorName: result.appointment.doctor.name,
        specialization: result.appointment.doctor.specialization,
        appointmentDate: result.appointment.schedule.startDateTime.toDateString(),
        joiningTime: result.joiningTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        serialNumber: result.serialNumber,
        meetingLink: result.appointment.schedule.meetingLink,
        amount: result.amount,
        transactionId: result.bankTransactionId,
        paidAt: result.paidAt,
        year: new Date().getFullYear(),
      });

      await transporter.sendMail({
        from: `"DoctorHub" <${config.email_sender}>`,
        to: result.appointment.patient.email,
        replyTo: `"DoctorHub Support" <${config.email_sender}>`,
        subject: "Appointment Confirmed - DoctorHub",
        html,
        attachments: [
          {
            filename: "invoice.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    }

    return {
      redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=success`,
    };
  }

  const isCancelled = callbackStatus.includes("cancel");

  await prisma.payment.update({
    where: { appointmentId: payment.appointmentId },
    data: {
      status: isCancelled ? PaymentStatus.CANCELLED : PaymentStatus.FAILED,
      gatewayResponse: payload,
    },
  });

  return {
    redirectUrl: isCancelled
      ? `${config.frontend_url}/dashboard/my-appointments?status=cancel`
      : `${config.frontend_url}/dashboard/my-appointments?status=failure`,
  };
};

const cancelAppointment = async (
  payload: ICancelAppointmentPayload,
  user: RequestUser,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const existingAppointment = await tx.apppointment.findUnique({
      where: {
        id: payload.appointmentId,
        patient: { email: user.email },
      },
      include: {
        payment: true,
        schedule: true,
      },
    });

    if (!existingAppointment) {
      throw new AppError(httpStatus.NOT_FOUND, "Appointment Does Not Exists");
    }

    if (
      existingAppointment.status === AppointmentStatus.ONGOING ||
      existingAppointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Appointment Ongoing or Completed",
      );
    }

    if (existingAppointment.status === AppointmentStatus.CANCELLED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Appointment Already Cancelled",
      );
    }

    const wasConfirmed =
      existingAppointment.status === AppointmentStatus.CONFIRMED;

    const updatedAppointment = await tx.apppointment.update({
      where: { id: existingAppointment.id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    if (wasConfirmed) {
      await tx.schedule.update({
        where: { id: existingAppointment.schedule.id },
        data: { availableSlots: { increment: 1 } },
      });
    }

    let refundRequired = false;
    const paymentWasPaid =
      existingAppointment.payment?.status === PaymentStatus.PAID;

    if (paymentWasPaid) {
      const refundCutOffTime = subHours(
        existingAppointment.schedule.startDateTime,
        1,
      );
      const isEligibleForRefund = isBefore(new Date(), refundCutOffTime);

      if (isEligibleForRefund) {
        refundRequired = true;
        await tx.payment.update({
          where: { appointmentId: existingAppointment.id },
          data: {
            refundReason:
              "Patient cancelled before the refund cutoff. Process refund from aamarPay merchant account/support; no public refund API is configured.",
          },
        });
      }
    }

    const newPaymentInfo = await tx.payment.findUnique({
      where: { appointmentId: existingAppointment.id },
    });

    return {
      appointment: updatedAppointment,
      payment: newPaymentInfo,
      refundRequired,
      refundMessage: refundRequired
        ? "Appointment cancelled. Refund is eligible but must be processed through aamarPay merchant support/dashboard."
        : null,
    };
  });

  return transactionResult;
};

export const AppointmentServices = {
  ...ExistingAppointmentServices,
  bookAppointment,
  payAppointment,
  bookAppointmentCallback,
  cancelAppointment,
};
