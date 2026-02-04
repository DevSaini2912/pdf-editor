let images = [];
let cropper = null;

const createBtn = document.getElementById("createBtn");
const choice = document.getElementById("choice");
const storageInput = document.getElementById("storageInput");
const cameraInput = document.getElementById("cameraInput");
const preview = document.getElementById("preview");
const doneBtn = document.getElementById("doneBtn");
const addMoreBtn = document.getElementById("addMoreBtn");

// STEP 1: Create PDF clicked
createBtn.onclick = () => {
  choice.style.display = "block";
};

// STEP 2: Choose source
document.getElementById("storageBtn").onclick = () => {
  storageInput.click();
};

document.getElementById("cameraBtn").onclick = () => {
  cameraInput.click();
};

// STEP 3: Handle images (camera + storage)
storageInput.onchange = cameraInput.onchange = e => {
  const files = Array.from(e.target.files);
  files.forEach(file => addImage(file));

  choice.style.display = "none";
  addMoreBtn.style.display = "inline-block";
  doneBtn.style.display = "inline-block";

  // allow selecting same file again
  e.target.value = "";
};

// Add image to preview
function addImage(file) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.onclick = () => cropImage(img);

  preview.appendChild(img);
  images.push(file);
}

// STEP 4: Crop image
function cropImage(imgEl) {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }

  const modal = document.createElement("div");
  modal.className = "modal";

  const img = document.createElement("img");
  img.src = imgEl.src;

  const btn = document.createElement("button");
  btn.textContent = "Crop & Save";

  modal.append(img, btn);
  document.body.appendChild(modal);

  cropper = new Cropper(img, {
    viewMode: 1,
    autoCropArea: 1
  });

  btn.onclick = () => {
    cropper.getCroppedCanvas().toBlob(blob => {
      imgEl.src = URL.createObjectURL(blob);

      const index = [...preview.children].indexOf(imgEl);
      images[index] = blob;

      cropper.destroy();
      cropper = null;
      modal.remove();
    }, "image/jpeg", 0.9);
  };
}

// Add more images
addMoreBtn.onclick = () => {
  choice.style.display = "block";
};

// STEP 5: Create PDF
doneBtn.onclick = async () => {
  if (images.length === 0) return;

  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let file of images) {
    const bytes = await file.arrayBuffer();

    // SAFELY embed image (jpg/png)
    let pdfImg;
    try {
      pdfImg = await pdfDoc.embedJpg(bytes);
    } catch {
      pdfImg = await pdfDoc.embedPng(bytes);
    }

    const page = pdfDoc.addPage([pdfImg.width, pdfImg.height]);
    page.drawImage(pdfImg, {
      x: 0,
      y: 0,
      width: pdfImg.width,
      height: pdfImg.height
    });
  }

  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, "my_pdf.pdf");

  // RESET UI
  images = [];
  preview.innerHTML = "";
  addMoreBtn.style.display = "none";
  doneBtn.style.display = "none";
  choice.style.display = "none";
};

// Download helper
function download(bytes, name) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
}
