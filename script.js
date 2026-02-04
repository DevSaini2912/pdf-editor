
let imageBlobs = [];
let cropper = null;

const preview = document.getElementById("preview");
const imgInput = document.getElementById("imgInput");

imgInput.addEventListener("change", handleImages);

// 1️⃣ Load images from gallery / camera
function handleImages(e) {
  for (let file of e.target.files) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.className = "thumb";

    img.onclick = () => openCrop(img);

    preview.appendChild(img);
  }
}

// 2️⃣ Crop image
function openCrop(img) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const cropImg = document.createElement("img");
  cropImg.src = img.src;

  const btn = document.createElement("button");
  btn.innerText = "Crop & Save";

  modal.appendChild(cropImg);
  modal.appendChild(btn);
  document.body.appendChild(modal);

  cropper = new Cropper(cropImg, {
    viewMode: 1
  });

  btn.onclick = () => {
    cropper.getCroppedCanvas().toBlob(blob => {
      imageBlobs.push(blob);
      img.src = URL.createObjectURL(blob);
      cropper.destroy();
      modal.remove();
    }, "image/jpeg");
  };
}

// 3️⃣ Create PDF
async function createPDF() {
  if (imageBlobs.length === 0) {
    alert("Add at least one image");
    return;
  }

  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let blob of imageBlobs) {
    const bytes = await blob.arrayBuffer();
    const img = await pdfDoc.embedJpg(bytes);

    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height
    });
  }

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, "scanned.pdf");
}

function download(bytes, name) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}
