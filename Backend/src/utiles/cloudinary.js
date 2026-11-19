import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
    cloud_name: "drargfdfb",
    api_key: "876421259555577",
    api_secret: "kmHqL8MT1qDDCI8dL5Y79YfLo94",
    //timeout: 60000
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // File uploaded successfully
       // console.log("File uploaded to Cloudinary:", response.url);

        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        // Attempt to delete the local file even if upload fails
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Failed to delete local file:", unlinkError);
        }

        return null;
    }
};

export { uploadOnCloudinary };