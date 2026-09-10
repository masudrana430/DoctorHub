/** biome-ignore-all lint/correctness/noUnusedImports: <explanation> */
/** biome-ignore-all lint/style/useImportType: <explanation> */
// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
  //   console.log(req.file, "req.file")

  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  const userId = req.user?.userId;

  const result = await UserServices.uploadProfileImage(
    req.file?.buffer,
    userId!,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New tokens generated successfully",
    data: result,
  });
});

export const UserController = {
  uploadProfileImage,
};
