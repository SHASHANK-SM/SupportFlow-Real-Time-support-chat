export const isImageAttachment = (attachment) => attachment?.type?.startsWith('image/');

export async function createAttachment(file) {
  if (!file) return null;
  const allowed = /^(image\/(png|jpeg|webp|gif)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)|text\/plain)$/;
  if (!allowed.test(file.type) || file.size > 3 * 1024 * 1024) throw new Error('Choose an image, PDF, Word, Excel, or text file up to 3 MB.');
  const url = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
  return { name: file.name, url, type: file.type, size: file.size };
}
