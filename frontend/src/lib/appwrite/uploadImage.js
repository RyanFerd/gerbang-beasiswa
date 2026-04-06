import { ID } from "appwrite"
import { appwriteConfig, storage } from "./config"

// Upload File
export async function uploadFile(file) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    )

    return uploadedFile
  } catch (error) {
    console.log(error)
  }
}

// Get File Url tanpa transformasi (gunakan getFileView)
export function getFilePreview(fileId) {
  try {
    const fileUrl = storage.getFileView(
      appwriteConfig.storageId,
      fileId
    )

    if (!fileUrl) throw Error

    return fileUrl
  } catch (error) {
    console.log(error)
  }
}
