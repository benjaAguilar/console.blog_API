import Errors from "./customError.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteLocalUploads } from "./utils.js";

export async function uploadMDtoCloud(path, options){
    try {
        const result = await cloudinary.uploader.upload(path, options);
        return result;
  
    } catch (error) {
        console.log(error);
        throw new Errors.customError('Error uploading file, try again', 500);

    } finally {
        deleteLocalUploads(path);
    }
}

export async function deleteMDfromCloud(cloudId, options){
    try {
        const result = await cloudinary.uploader.destroy(cloudId, options);
        if(result.result !== 'ok'){
            throw new Errors.customError('Error deleting the file, try again', 500);
        }

        return result
        
    } catch (error) {
        console.log(error);
        throw new Errors.customError('Error deleting the file, try again', 500);

    }
}