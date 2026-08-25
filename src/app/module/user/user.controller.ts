/** biome-ignore-all lint/correctness/noUnusedImports: <explanation> */
/** biome-ignore-all lint/style/useImportType: <explanation> */
// biome-ignore assist/source/organizeImports: <explanation>
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "../auth/auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserServices } from "./user.service";

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
 
//   console.log(req.file, "req.file")

 if (!req.file) {
   throw new Error("No file uploaded");
 }

 const userId = req.user?.userId;

 
  const result = await UserServices.uploadProfileImage(req.file?.buffer, userId!);
  
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
