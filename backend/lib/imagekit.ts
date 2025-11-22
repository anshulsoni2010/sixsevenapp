import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export async function uploadImageToImageKit(
    base64Image: string,
    fileName: string
): Promise<string | null> {
    try {
        // Remove data URL prefix if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

        const uploadResponse = await imagekit.upload({
            file: base64Data,
            fileName: fileName,
            folder: '/chat-images',
            useUniqueFileName: true,
        });

        return uploadResponse.url;
    } catch (error) {
        console.error('ImageKit upload error:', error);
        return null;
    }
}

export default imagekit;
