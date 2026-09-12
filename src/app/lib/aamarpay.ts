import { randomUUID } from "node:crypto";
import httpStatus from "http-status";
import config from "../config";
import { AppError } from "../utils/AppError";

interface IAamarPayCreatePaymentPayload {
  transactionId: string;
  amount: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  appointmentId: string;
}

const getBaseUrl = () => config.aamarpay_base_url.replace(/\/$/, "");

export const createAamarPayTransactionId = () =>
  `DH${Date.now()}${randomUUID().replace(/-/g, "").slice(0, 12)}`;

export const initiateAamarPayPayment = async (
  payload: IAamarPayCreatePaymentPayload,
) => {
  if (!payload.customerPhone) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Patient contact number is required for aamarPay payment",
    );
  }

  const response = await fetch(`${getBaseUrl()}/jsonpost.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      store_id: config.aamarpay_store_id,
      signature_key: config.aamarpay_signature_key,
      tran_id: payload.transactionId,
      amount: payload.amount,
      currency: "BDT",
      desc: payload.description,
      cus_name: payload.customerName,
      cus_email: payload.customerEmail,
      cus_phone: payload.customerPhone,
      cus_country: "Bangladesh",
      success_url: payload.successUrl,
      fail_url: payload.failUrl,
      cancel_url: payload.cancelUrl,
      opt_a: payload.appointmentId,
      type: "json",
    }),
  });

  const result: any = await response.json();

  if (!response.ok || result?.result !== "true" || !result?.payment_url) {
    const gatewayMessage =
      result?.message || result?.result || "Unknown gateway error";
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      `aamarPay payment initiation failed: ${gatewayMessage}`,
    );
  }

  return result;
};

export const verifyAamarPayTransaction = async (transactionId: string) => {
  const url = new URL(`${getBaseUrl()}/api/v1/trxcheck/request.php`);
  url.searchParams.set("request_id", transactionId);
  url.searchParams.set("store_id", config.aamarpay_store_id);
  url.searchParams.set("signature_key", config.aamarpay_signature_key);
  url.searchParams.set("type", "json");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const result: any = await response.json();

  if (!response.ok) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "aamarPay transaction verification failed",
    );
  }

  return result;
};
