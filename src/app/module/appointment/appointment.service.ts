import {
  AppointmentStatus,
  PaymentStatus,
} from "../../../generated/prisma/browser";
import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";

const bookAppointment = async (payload: any, user: RequestUser) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // business logic

    const appointment = await tx.apppointment.create({
      data: {
        status: AppointmentStatus.PENDING,
      },
    });

    const bkashIdToken = await getBkashIdToken();

    if (!bkashIdToken) {
      throw new Error("No Bkash Access Token Found!");
    }

    console.log({ bkashIdToken });

    const bkashCreatePaymentResponse = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
          mode: "0011",
          // payerReference: "0123456789", //user email or phone number
          payerReference: user.email, //user email or phone number
          callbackURL: `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
          amount: "1200",
          currency: "BDT",
          intent: "sale",
          // merchantInvoiceNumber: "Inv4" // apppointment id
          merchantInvoiceNumber: appointment.id, // apppointment id
        }),
      },
    );

    const bkashCreatePaymentResult = await bkashCreatePaymentResponse.json();

    // console.log({bkashCreatePaymentResult});

    //payment model cerate

    await tx.payment.create({
      data: {
        merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
        appointmentId: appointment.id,
        amount: "1200",
        gatewayResponse: bkashCreatePaymentResult,
        bkashPaymentId: bkashCreatePaymentResult.paymentID,
        payerReference: user.email,
      },
    });

    return {
      paymentUrl: bkashCreatePaymentResult.bkashURL,
    };

    // return bkashCreatePaymentResult
  });
  return transactionResult;
};

const bookAppointmentCallback = async (query: Record<string, any>) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const paymentId = query.paymentID;

    if (!paymentId) {
      throw new Error("Payment Id Missing");
    }

    const status = query.status;

    if (!status) {
      throw new Error("Payment Status is Missing");
    }

    const bkashIdToken = await getBkashIdToken();

    if (!bkashIdToken) {
      throw new Error("No Bkash Access Token Found!");
    }

    const executedPaymentResponse = await fetch(
      `${config.bkash_base_url}/tokenized/checkout/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },

        body: JSON.stringify({
          paymentID: paymentId,
        }),
      },
    );

    const executedPaymentResult = await executedPaymentResponse.json();

    if (status === "success") {
      await tx.apppointment.update({
        where: {
          id: executedPaymentResult.merchantInvoiceNumber,
        },
        data: {
          status: AppointmentStatus.CONFIRMED,
        },
      });

      await tx.payment.update({
        where: {
          appointmentId: executedPaymentResult.merchantInvoiceNumber,
          bkashPaymentId: paymentId,
        },
        data: {
          status: PaymentStatus.PAID,
          bkashTrxId: executedPaymentResult.trxID,
          paidAt: executedPaymentResult.paymentExecuteTime,
          gatewayResponse: executedPaymentResult,
        },
      });
      return {
        redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=success`,
      };
    } else if (status === "failure") {
        await tx.payment.update({
				where: {
					bkashPaymentId: paymentId,
				},
				data: {
					status: PaymentStatus.FAILED,
					gatewayResponse: executedPaymentResult,
				},
			});
      return {
        
        redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=failue`,
      };
    } else if (status === "cancel") {
        await tx.payment.update({
				where: {
					bkashPaymentId: paymentId,
				},
				data: {
					status: PaymentStatus.CANCELLED,
					gatewayResponse: executedPaymentResult,
				},
			});
      return {
        executedPaymentResult,
        redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=cancel`,
      };
    } else {
      return {
        executedPaymentResult,
        redirectUrl: `${config.frontend_url}/dashboard/my-appointments?error=payment-failed`,
      };
    }
  });

  return transactionResult;
};

// const bookAppointmentCallback = async (
// 	query: Record<string, any>,
// ) => {
// 	console.log("bKash callback query:", query);

// 	const paymentId = query.paymentID;
// 	const status = query.status;

// 	if (!paymentId) {
// 		throw new Error("Payment Id Missing");
// 	}

// 	if (!status) {
// 		throw new Error("Payment Status is Missing");
// 	}

// 	// --------------------------------
// 	// Find our local payment first
// 	// --------------------------------

// 	const payment = await prisma.payment.findUnique({
// 		where: {
// 			bkashPaymentId: paymentId,
// 		},
// 	});

// 	if (!payment) {
// 		throw new Error("Payment record not found");
// 	}

// 	// =================================
// 	// FAILURE
// 	// =================================

// 	if (status === "failure") {
// 		await prisma.payment.update({
// 			where: {
// 				bkashPaymentId: paymentId,
// 			},

// 			data: {
// 				status: PaymentStatus.FAILED,

// 				gatewayResponse: {
// 					callback: query,
// 				},
// 			},
// 		});

// 		return {
// 			redirectUrl:
// 				`${config.frontend_url}` +
// 				"/dashboard/my-appointments?status=failure",
// 		};
// 	}

// 	// =================================
// 	// CANCEL
// 	// =================================

// 	if (status === "cancel") {
// 		await prisma.payment.update({
// 			where: {
// 				bkashPaymentId: paymentId,
// 			},

// 			data: {
// 				status: PaymentStatus.CANCELLED,

// 				gatewayResponse: {
// 					callback: query,
// 				},
// 			},
// 		});

// 		return {
// 			redirectUrl:
// 				`${config.frontend_url}` +
// 				"/dashboard/my-appointments?status=cancel",
// 		};
// 	}

// 	// =================================
// 	// UNKNOWN CALLBACK STATUS
// 	// =================================

// 	if (status !== "success") {
// 		return {
// 			redirectUrl:
// 				`${config.frontend_url}` +
// 				"/dashboard/my-appointments?error=payment-failed",
// 		};
// 	}

// 	// =================================
// 	// SUCCESS → EXECUTE PAYMENT
// 	// =================================

// 	const bkashIdToken =
// 		await getBkashIdToken();

// 	if (!bkashIdToken) {
// 		throw new Error(
// 			"No Bkash Access Token Found!",
// 		);
// 	}

// 	const executedPaymentResponse =
// 		await fetch(
// 			`${config.bkash_base_url}/tokenized/checkout/execute`,
// 			{
// 				method: "POST",

// 				headers: {
// 					"Content-Type":
// 						"application/json",

// 					Accept:
// 						"application/json",

// 					Authorization:
// 						bkashIdToken,

// 					"X-App-Key":
// 						config.bkash_app_key,
// 				},

// 				body: JSON.stringify({
// 					paymentID: paymentId,
// 				}),
// 			},
// 		);

// 	const executedPaymentResult =
// 		await executedPaymentResponse.json();

// 	console.log(
// 		"bKash Execute HTTP:",
// 		executedPaymentResponse.status,
// 	);

// 	console.log(
// 		"bKash Execute Result:",
// 		executedPaymentResult,
// 	);

// 	// =================================
// 	// VALIDATE EXECUTION
// 	// =================================

// 	if (
// 		!executedPaymentResponse.ok ||
// 		executedPaymentResult.statusCode !== "0000"
// 	) {
// 		console.error(
// 			"bKash execution failed:",
// 			executedPaymentResult,
// 		);

// 		throw new Error(
// 			executedPaymentResult.statusMessage ||
// 				"bKash payment execution failed",
// 		);
// 	}

// 	if (!executedPaymentResult.trxID) {
// 		throw new Error(
// 			"bKash transaction ID missing",
// 		);
// 	}

// 	// =================================
// 	// Verify appointment relationship
// 	// =================================

// 	if (
// 		executedPaymentResult.merchantInvoiceNumber !==
// 		payment.appointmentId
// 	) {
// 		throw new Error(
// 			"Merchant invoice number does not match appointment",
// 		);
// 	}

// 	// =================================
// 	// DB TRANSACTION
// 	// =================================

// 	await prisma.$transaction(async (tx) => {
// 		await tx.apppointment.update({
// 			where: {
// 				id: payment.appointmentId,
// 			},

// 			data: {
// 				status:
// 					AppointmentStatus.CONFIRMED,
// 			},
// 		});

// 		await tx.payment.update({
// 			where: {
// 				bkashPaymentId: paymentId,
// 			},

// 			data: {
// 				status: PaymentStatus.PAID,

// 				bkashTrxId:
// 					executedPaymentResult.trxID,

// 				paidAt: executedPaymentResult.paymentExecuteTime,

// 				gatewayResponse:
// 					executedPaymentResult,
// 			},
// 		});
// 	});

// 	return {
// 		redirectUrl:
// 			`${config.frontend_url}` +
// 			"/dashboard/my-appointments?status=success",
// 	};
// };

export const AppointmentServices = {
  bookAppointment,
  bookAppointmentCallback,
};
