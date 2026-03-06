const crypto = require("crypto");

const hasCloudinaryConfig = () => (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
);

exports.getMediaConfig = async (req, res) => {
    return res.json({
        enabled: hasCloudinaryConfig(),
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        defaultFolder: process.env.CLOUDINARY_FOLDER || "toris"
    });
};

exports.uploadMedia = async (req, res) => {
    try {
        if (!hasCloudinaryConfig()) {
            return res.status(500).json({
                message: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
            });
        }

        const fileDataUrl = String(req.body?.fileDataUrl || "");
        if (!fileDataUrl.startsWith("data:image/")) {
            return res.status(400).json({ message: "Invalid image payload. Use a base64 data URL." });
        }

        const folderRaw = String(req.body?.folder || process.env.CLOUDINARY_FOLDER || "toris").trim();
        const folder = folderRaw.replace(/[^a-zA-Z0-9/_-]/g, "") || "toris";
        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature = crypto
            .createHash("sha1")
            .update(`${paramsToSign}${process.env.CLOUDINARY_API_SECRET}`)
            .digest("hex");

        const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append("file", fileDataUrl);
        formData.append("api_key", process.env.CLOUDINARY_API_KEY);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const response = await fetch(uploadUrl, {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        if (!response.ok) {
            const message = result?.error?.message || "Cloudinary upload failed";
            return res.status(502).json({ message });
        }

        return res.json({
            message: "Image uploaded successfully",
            secureUrl: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Upload failed" });
    }
};

