export async function loadMNISTTest() {
  const [imageResponse, labelResponse] = await Promise.all([
    fetch("/mnist/t10k-images-idx3-ubyte.gz"),
    fetch("/mnist/t10k-labels-idx1-ubyte.gz"),
  ]);

  if (!imageResponse.ok || !labelResponse.ok) {
    throw new Error("Unable to download MNIST test dataset.");
  }

  const [imageBuffer, labelBuffer] = await Promise.all([
    imageResponse.arrayBuffer(),
    labelResponse.arrayBuffer(),
  ]);

  // Vite/browser automatically decompresses these gzip responses
  const images = new Uint8Array(imageBuffer);
  const labels = new Uint8Array(labelBuffer);

  const imageMagic =
    new DataView(images.buffer, images.byteOffset).getUint32(0);

  const imageCount =
    new DataView(images.buffer, images.byteOffset).getUint32(4);

  const rows =
    new DataView(images.buffer, images.byteOffset).getUint32(8);

  const columns =
    new DataView(images.buffer, images.byteOffset).getUint32(12);

  const labelMagic =
    new DataView(labels.buffer, labels.byteOffset).getUint32(0);

  const labelCount =
    new DataView(labels.buffer, labels.byteOffset).getUint32(4);

  if (
    imageMagic !== 2051 ||
    labelMagic !== 2049 ||
    rows !== 28 ||
    columns !== 28 ||
    imageCount !== labelCount
  ) {
    throw new Error("Invalid MNIST test dataset format.");
  }

  return {
    images: images.subarray(16),
    labels: labels.subarray(8),
    imageCount,
    rows,
    columns,
  };
}
