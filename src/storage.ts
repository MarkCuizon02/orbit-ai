import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadAttachment(userId: string, file: File, folder: string = "attachments"): Promise<string> {
  const fileRef = ref(storage, `${folder}/${userId}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
}

export async function removeFile(filePath: string): Promise<void> {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
}
